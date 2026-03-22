import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/models/user_profile.dart';
import 'package:mobile/providers/auth_provider.dart';

final profileProvider =
    StateNotifierProvider<ProfileNotifier, ProfileState>((ref) {
      return ProfileNotifier(ref);
    });

class ProfileState {
  const ProfileState({
    this.profile,
    this.isLoading = false,
    this.isSaving = false,
    this.error,
  });

  final UserProfile? profile;
  final bool isLoading;
  final bool isSaving;
  final String? error;

  ProfileState copyWith({
    UserProfile? profile,
    bool? isLoading,
    bool? isSaving,
    String? error,
    bool clearError = false,
  }) {
    return ProfileState(
      profile: profile ?? this.profile,
      isLoading: isLoading ?? this.isLoading,
      isSaving: isSaving ?? this.isSaving,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

class ProfileNotifier extends StateNotifier<ProfileState> {
  ProfileNotifier(this._ref) : super(const ProfileState());

  final Ref _ref;

  String? get _token => _ref.read(authStateProvider).accessToken;
  String? get _refreshToken => _ref.read(authStateProvider).refreshToken;

  Future<void> loadProfile({bool forceRefresh = false}) async {
    final token = _token;
    if (token == null || token.isEmpty) {
      state = const ProfileState();
      return;
    }

    if (state.isLoading) return;
    if (!forceRefresh && state.profile != null) return;

    state = state.copyWith(isLoading: true, clearError: true);
    final result = await _ref.read(apiServiceProvider).getProfile(
      accessToken: token,
      refreshToken: _refreshToken,
    );

    if (!mounted) return;

    if (!result.isSuccess || result.data == null) {
      state = state.copyWith(
        isLoading: false,
        error: result.message ?? 'Failed to load profile.',
      );
      return;
    }

    final raw = result.data!['data'];
    final payload = raw is Map<String, dynamic>
        ? (raw['user'] is Map<String, dynamic> ? raw['user'] : raw)
        : null;

    if (payload == null) {
      state = state.copyWith(
        isLoading: false,
        error: 'Invalid profile response.',
      );
      return;
    }

    state = state.copyWith(
      isLoading: false,
      profile: UserProfile.fromJson(payload),
    );
  }

  Future<bool> updateProfile({
    required String firstName,
    required String lastName,
    required String gender,
    required String phoneNumber,
    DateTime? dateOfBirth,
  }) async {
    final token = _token;
    if (token == null || token.isEmpty) return false;

    state = state.copyWith(isSaving: true, clearError: true);

    final result = await _ref.read(apiServiceProvider).updateProfile(
      accessToken: token,
      refreshToken: _refreshToken,
      body: {
        'firstName': firstName.trim(),
        'lastName': lastName.trim(),
        'gender': gender,
        'phoneNumber': phoneNumber.trim().isEmpty ? null : phoneNumber.trim(),
        'dateOfBirth': dateOfBirth?.toIso8601String(),
      },
    );

    if (!mounted) return false;

    if (!result.isSuccess || result.data == null) {
      state = state.copyWith(
        isSaving: false,
        error: result.message ?? 'Failed to update profile.',
      );
      return false;
    }

    final raw = result.data!['data'];
    if (raw is! Map<String, dynamic>) {
      state = state.copyWith(
        isSaving: false,
        error: 'Invalid profile response.',
      );
      return false;
    }

    state = state.copyWith(
      isSaving: false,
      profile: UserProfile.fromJson(raw),
    );
    return true;
  }
}
