import 'dart:convert';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/models/register_request.dart';
import 'package:mobile/models/verification_flow.dart';
import 'package:mobile/services/api_service.dart';
import 'package:mobile/services/auth_service.dart';

final apiServiceProvider = Provider<ApiService>((ref) {
  return ApiService();
});

final authServiceProvider = Provider<AuthService>((ref) {
  return AuthService();
});

final authStateProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(
    apiService: ref.read(apiServiceProvider),
    authService: ref.read(authServiceProvider),
  );
});

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier({
    required ApiService apiService,
    required AuthService authService,
  }) : _apiService = apiService,
       _authService = authService,
       super(AuthState.initial()) {
    initialize();
  }

  final ApiService _apiService;
  final AuthService _authService;

  Future<void> initialize() async {
    state = state.copyWith(
      isBootstrapping: true,
      clearError: true,
      clearSuccess: true,
    );

    final session = await _authService.readSession();

    if (session != null) {
      state = state.copyWith(
        isBootstrapping: false,
        isAuthenticated: true,
        accessToken: session.accessToken,
        refreshToken: session.refreshToken,
        userId: _extractUserIdFromToken(session.accessToken),
      );
      return;
    }

    state = state.copyWith(
      isBootstrapping: false,
      isAuthenticated: false,
      clearTokens: true,
    );
  }

  Future<AuthActionResult> login({
    required String email,
    required String password,
  }) async {
    state = state.copyWith(
      isSubmitting: true,
      clearError: true,
      clearSuccess: true,
      fieldErrors: const {},
    );

    final result = await _apiService.login(email: email, password: password);

    if (!result.isSuccess || result.data == null) {
      final message = result.message ?? 'Unable to login right now.';
      state = state.copyWith(
        isSubmitting: false,
        isAuthenticated: false,
        errorMessage: message,
        fieldErrors: result.fieldErrors,
      );
      return AuthActionResult.failure(message, fieldErrors: result.fieldErrors);
    }

    final tokens = _extractTokens(result.data!);
    if (tokens == null) {
      const message = 'Login succeeded but no auth token was returned.';
      state = state.copyWith(
        isSubmitting: false,
        isAuthenticated: false,
        errorMessage: message,
      );
      return const AuthActionResult.failure(message);
    }

    await _authService.saveSession(tokens);

    state = state.copyWith(
      isSubmitting: false,
      isAuthenticated: true,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      userId: _extractUserIdFromToken(tokens.accessToken),
      successMessage: result.message ?? 'Login successful.',
    );

    return AuthActionResult.success(result.message ?? 'Login successful.');
  }

  Future<AuthActionResult> register(RegisterRequest payload) async {
    state = state.copyWith(
      isSubmitting: true,
      clearError: true,
      clearSuccess: true,
      fieldErrors: const {},
    );

    final result = await _apiService.register(payload.toJson());

    if (!result.isSuccess) {
      final message = result.message ?? 'Unable to create account.';
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: message,
        fieldErrors: result.fieldErrors,
      );
      return AuthActionResult.failure(message, fieldErrors: result.fieldErrors);
    }

    state = state.copyWith(
      isSubmitting: false,
      successMessage: result.message ?? 'Account created successfully.',
      clearVerificationFlow: true,
    );

    return AuthActionResult.success(
      result.message ?? 'Account created successfully.',
    );
  }

  Future<AuthActionResult> sendVerificationCode(
    String email,
    VerificationPurpose purpose,
  ) async {
    state = state.copyWith(
      isSubmitting: true,
      clearError: true,
      clearSuccess: true,
      fieldErrors: const {},
    );

    final result = await _apiService.sendVerificationCode(email, purpose);

    if (!result.isSuccess) {
      final message = result.message ?? 'Unable to send verification code.';
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: message,
        fieldErrors: result.fieldErrors,
      );
      return AuthActionResult.failure(message, fieldErrors: result.fieldErrors);
    }

    state = state.copyWith(
      isSubmitting: false,
      clearVerificationFlow: true,
      verificationEmail: email,
      verificationPurpose: purpose,
      isVerificationCodeValid: false,
      successMessage: result.message ?? 'Verification code sent.',
    );

    return AuthActionResult.success(
      result.message ?? 'Verification code sent.',
    );
  }

  Future<AuthActionResult> verifyCode({
    required String email,
    required String code,
    required VerificationPurpose purpose,
  }) async {
    state = state.copyWith(
      isSubmitting: true,
      clearError: true,
      clearSuccess: true,
      fieldErrors: const {},
    );

    final result = await _apiService.verifyCode(
      email: email,
      code: code,
      purpose: purpose,
    );

    if (!result.isSuccess) {
      final message = result.message ?? 'Invalid verification code.';
      state = state.copyWith(
        isSubmitting: false,
        errorMessage: message,
        fieldErrors: result.fieldErrors,
      );
      return AuthActionResult.failure(message, fieldErrors: result.fieldErrors);
    }

    final data = result.data?['data'];
    final verificationToken = data is Map<String, dynamic>
        ? data['verificationToken']?.toString()
        : null;

    state = state.copyWith(
      isSubmitting: false,
      verificationEmail: email,
      verificationPurpose: purpose,
      verificationToken: verificationToken,
      isVerificationCodeValid: true,
      successMessage: result.message ?? 'Verification successful.',
    );

    return AuthActionResult.success(
      result.message ?? 'Verification successful.',
    );
  }

  Future<void> logout() async {
    final refreshToken = state.refreshToken;
    state = state.copyWith(
      isSubmitting: true,
      clearError: true,
      clearSuccess: true,
    );

    if (refreshToken != null && refreshToken.isNotEmpty) {
      await _apiService.logout(refreshToken);
    }

    await _authService.clearSession();

    state = state.copyWith(
      isSubmitting: false,
      isAuthenticated: false,
      isVerificationCodeValid: false,
      clearVerificationFlow: true,
      clearTokens: true,
    );
  }

  Future<void> clearSession() async {
    await _authService.clearSession();
    state = state.copyWith(
      isAuthenticated: false,
      clearTokens: true,
      clearError: true,
      clearSuccess: true,
      clearVerificationFlow: true,
    );
  }

  void clearFeedback() {
    state = state.copyWith(
      clearError: true,
      clearSuccess: true,
      fieldErrors: const {},
    );
  }

  void clearVerificationFlow() {
    state = state.copyWith(clearVerificationFlow: true);
  }

  String? _extractUserIdFromToken(String token) {
    try {
      final parts = token.split('.');
      if (parts.length != 3) return null;
      final payload = parts[1];
      final normalized = base64Url.normalize(payload);
      final decoded = utf8.decode(base64Url.decode(normalized));
      final map = jsonDecode(decoded) as Map<String, dynamic>;
      return (map['sub'] ?? map['userId'] ?? map['id'])?.toString();
    } catch (_) {
      return null;
    }
  }

  AuthSession? _extractTokens(Map<String, dynamic> response) {
    final dynamic data = response['data'];

    if (data is! Map<String, dynamic>) {
      return null;
    }

    final accessToken = (data['access_token'] ?? data['accessToken'])
        ?.toString();
    final refreshToken = (data['refresh_token'] ?? data['refreshToken'])
        ?.toString();

    if (accessToken == null || refreshToken == null) {
      return null;
    }

    if (accessToken.isEmpty || refreshToken.isEmpty) {
      return null;
    }

    return AuthSession(accessToken: accessToken, refreshToken: refreshToken);
  }
}

class AuthState {
  const AuthState({
    required this.isBootstrapping,
    required this.isAuthenticated,
    required this.isSubmitting,
    this.errorMessage,
    this.successMessage,
    this.fieldErrors = const {},
    this.accessToken,
    this.refreshToken,
    this.userId,
    this.verificationEmail,
    this.verificationPurpose,
    this.verificationToken,
    this.isVerificationCodeValid = false,
  });

  final bool isBootstrapping;
  final bool isAuthenticated;
  final bool isSubmitting;
  final String? errorMessage;
  final String? successMessage;
  final Map<String, String> fieldErrors;
  final String? accessToken;
  final String? refreshToken;
  final String? userId;
  final String? verificationEmail;
  final VerificationPurpose? verificationPurpose;
  final String? verificationToken;
  final bool isVerificationCodeValid;

  factory AuthState.initial() {
    return const AuthState(
      isBootstrapping: true,
      isAuthenticated: false,
      isSubmitting: false,
    );
  }

  AuthState copyWith({
    bool? isBootstrapping,
    bool? isAuthenticated,
    bool? isSubmitting,
    String? errorMessage,
    String? successMessage,
    Map<String, String>? fieldErrors,
    String? accessToken,
    String? refreshToken,
    String? userId,
    String? verificationEmail,
    VerificationPurpose? verificationPurpose,
    String? verificationToken,
    bool? isVerificationCodeValid,
    bool clearError = false,
    bool clearSuccess = false,
    bool clearTokens = false,
    bool clearVerificationFlow = false,
  }) {
    return AuthState(
      isBootstrapping: isBootstrapping ?? this.isBootstrapping,
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isSubmitting: isSubmitting ?? this.isSubmitting,
      errorMessage: clearError ? null : (errorMessage ?? this.errorMessage),
      successMessage: clearSuccess
          ? null
          : (successMessage ?? this.successMessage),
      fieldErrors: fieldErrors ?? this.fieldErrors,
      accessToken: clearTokens ? null : (accessToken ?? this.accessToken),
      refreshToken: clearTokens ? null : (refreshToken ?? this.refreshToken),
      userId: clearTokens ? null : (userId ?? this.userId),
      verificationEmail: clearVerificationFlow
          ? verificationEmail
          : (verificationEmail ?? this.verificationEmail),
      verificationPurpose: clearVerificationFlow
          ? verificationPurpose
          : (verificationPurpose ?? this.verificationPurpose),
      verificationToken: clearVerificationFlow
          ? verificationToken
          : (verificationToken ?? this.verificationToken),
      isVerificationCodeValid: clearVerificationFlow
          ? false
          : (isVerificationCodeValid ?? this.isVerificationCodeValid),
    );
  }
}

class AuthActionResult {
  const AuthActionResult._({
    required this.isSuccess,
    this.message,
    this.fieldErrors = const {},
  });

  final bool isSuccess;
  final String? message;
  final Map<String, String> fieldErrors;

  const AuthActionResult.success([String? message])
    : this._(isSuccess: true, message: message);

  const AuthActionResult.failure(
    String message, {
    Map<String, String> fieldErrors = const {},
  }) : this._(isSuccess: false, message: message, fieldErrors: fieldErrors);
}
