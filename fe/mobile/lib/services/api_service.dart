import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:mobile/models/verification_flow.dart';

class ApiService {
  ApiService({http.Client? client}) : _client = client ?? http.Client();

  static const String _fallbackBaseUrl = 'http://localhost:3000/api/v1';
  static const int _timeoutSeconds = 20;

  final http.Client _client;

  Map<String, String> get _headers => const {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  String get baseUrl {
    final configured = (dotenv.env['API_BASE_URL'] ?? _fallbackBaseUrl).trim();
    final parsed = Uri.tryParse(configured);

    if (parsed == null || parsed.host.isEmpty || parsed.scheme.isEmpty) {
      return _normalizeBaseUrl(_adaptAndroidHost(Uri.parse(_fallbackBaseUrl)));
    }

    return _normalizeBaseUrl(_adaptAndroidHost(parsed));
  }

  bool _isLocalHost(String host) => host == 'localhost' || host == '127.0.0.1';

  String _adaptAndroidHost(Uri uri) {
    if (!kIsWeb && Platform.isAndroid && _isLocalHost(uri.host)) {
      return uri.replace(host: '10.0.2.2').toString();
    }
    return uri.toString();
  }

  String _normalizeBaseUrl(String raw) {
    return raw.endsWith('/') ? raw.substring(0, raw.length - 1) : raw;
  }

  Uri _buildUri(String path) {
    final normalizedPath = path.startsWith('/') ? path : '/$path';
    return Uri.parse('$baseUrl$normalizedPath');
  }

  Future<ApiResult<Map<String, dynamic>>> register(
    Map<String, dynamic> payload,
  ) {
    return _post('/auth/register', body: payload);
  }

  Future<ApiResult<Map<String, dynamic>>> login({
    required String email,
    required String password,
  }) {
    return _post('/auth/login', body: {'email': email, 'password': password});
  }

  Future<ApiResult<Map<String, dynamic>>> refreshToken(String refreshToken) {
    return _post('/auth/refresh', headers: {'x-refresh-token': refreshToken});
  }

  Future<ApiResult<Map<String, dynamic>>> logout(String refreshToken) {
    return _post('/auth/logout', headers: {'x-refresh-token': refreshToken});
  }

  Future<ApiResult<Map<String, dynamic>>> sendVerificationCode(
    String email,
    VerificationPurpose purpose,
  ) {
    return _post(
      '/send-verification-code',
      body: {'email': email, 'purpose': purpose.apiValue},
    );
  }

  Future<ApiResult<Map<String, dynamic>>> verifyCode({
    required String email,
    required String code,
    required VerificationPurpose purpose,
  }) {
    return _post(
      '/verify-code',
      body: {'email': email, 'code': code, 'purpose': purpose.apiValue},
    );
  }

  Future<ApiResult<Map<String, dynamic>>> getProducts({
    int page = 1,
    int limit = 10,
    String sortBy = 'createdAt',
    String sortOrder = 'desc',
  }) {
    return _get(
      '/products?page=$page&limit=$limit&sortBy=$sortBy&sortOrder=$sortOrder',
    );
  }

  Future<ApiResult<Map<String, dynamic>>> getProductById(String productId) {
    return _get('/products/$productId');
  }

  Future<ApiResult<Map<String, dynamic>>> submitProductReview({
    required String accessToken,
    String? refreshToken,
    required String productId,
    required Map<String, dynamic> body,
  }) {
    return _post(
      '/products/$productId/reviews',
      body: body,
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> addToCart({
    required String accessToken,
    String? refreshToken,
    required Map<String, dynamic> body,
  }) {
    return _post(
      '/cart',
      body: body,
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> getCart({
    required String accessToken,
    String? refreshToken,
    required String userId,
  }) {
    return _get(
      '/cart/$userId',
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> updateCartQuantity({
    required String accessToken,
    String? refreshToken,
    required Map<String, dynamic> body,
  }) {
    return _put(
      '/cart',
      body: body,
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> removeCartItem({
    required String accessToken,
    String? refreshToken,
    required Map<String, dynamic> body,
  }) {
    return _delete(
      '/cart',
      body: body,
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> clearCart({
    required String accessToken,
    String? refreshToken,
    required String userId,
  }) {
    return _delete(
      '/cart/clear',
      body: {'userId': userId},
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> createOrder({
    required String accessToken,
    String? refreshToken,
    required Map<String, dynamic> body,
  }) {
    return _post(
      '/order',
      body: body,
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> getOrdersByUser({
    required String accessToken,
    String? refreshToken,
    required String userId,
  }) {
    return _get(
      '/order/users/$userId',
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> getOrderById({
    required String accessToken,
    String? refreshToken,
    required String orderId,
  }) {
    return _get(
      '/order/$orderId',
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> getWishlist({
    required String accessToken,
    String? refreshToken,
  }) {
    return _get(
      '/wishlist',
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> addToWishlist({
    required String accessToken,
    String? refreshToken,
    required String productId,
    required String variantId,
  }) {
    return _post(
      '/wishlist',
      body: {'productId': productId, 'variantId': variantId},
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> removeFromWishlist({
    required String accessToken,
    String? refreshToken,
    required String productId,
  }) {
    return _delete(
      '/wishlist',
      body: {'productId': productId},
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> createPayment({
    required String accessToken,
    String? refreshToken,
    required Map<String, dynamic> body,
  }) {
    return _post(
      '/payment',
      body: body,
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> createStripeCheckoutSession({
    required String accessToken,
    String? refreshToken,
    required String orderId,
  }) {
    return _post(
      '/payments/create-checkout-session',
      body: {'orderId': orderId},
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> getPaymentCards({
    required String accessToken,
    String? refreshToken,
  }) {
    return _get(
      '/cards',
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> addPaymentCard({
    required String accessToken,
    String? refreshToken,
    required Map<String, dynamic> body,
  }) {
    return _post(
      '/cards',
      body: body,
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> removePaymentCard({
    required String accessToken,
    String? refreshToken,
    required String cardId,
  }) {
    return _delete(
      '/cards/$cardId',
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> getPaymentByOrder({
    required String accessToken,
    String? refreshToken,
    required String orderId,
  }) {
    return _get(
      '/payment/order/$orderId',
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> completePayment({
    required String accessToken,
    String? refreshToken,
    required String paymentId,
    required String transactionRef,
  }) {
    return _post(
      '/payment/$paymentId/complete',
      body: {'transactionRef': transactionRef},
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> getAddresses({
    required String accessToken,
    String? refreshToken,
  }) {
    return _get(
      '/addresses',
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> addAddress({
    required String accessToken,
    String? refreshToken,
    required Map<String, dynamic> body,
  }) {
    return _post(
      '/addresses',
      body: body,
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> updateAddress({
    required String accessToken,
    String? refreshToken,
    required String addressId,
    required Map<String, dynamic> body,
  }) {
    return _patch(
      '/addresses/$addressId',
      body: body,
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> removeAddress({
    required String accessToken,
    String? refreshToken,
    required String addressId,
  }) {
    return _delete(
      '/addresses/$addressId',
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> setDefaultAddress({
    required String accessToken,
    String? refreshToken,
    required String addressId,
  }) {
    return _patch(
      '/addresses/$addressId/default',
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> getProfile({
    required String accessToken,
    String? refreshToken,
  }) {
    return _get(
      '/profile',
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Future<ApiResult<Map<String, dynamic>>> updateProfile({
    required String accessToken,
    String? refreshToken,
    required Map<String, dynamic> body,
  }) {
    return _patch(
      '/profile',
      body: body,
      headers: _authHeader(accessToken, refreshToken: refreshToken),
    );
  }

  Map<String, String> _authHeader(String token, {String? refreshToken}) => {
    'Authorization': 'Bearer $token',
    if (refreshToken != null && refreshToken.trim().isNotEmpty)
      'x-refresh-token': refreshToken.trim(),
  };

  Future<ApiResult<Map<String, dynamic>>> _get(
    String path, {
    Map<String, String>? headers,
  }) async {
    final uri = _buildUri(path);
    try {
      _logRequest('GET', uri);
      final response = await _client
          .get(uri, headers: {..._headers, if (headers != null) ...headers})
          .timeout(const Duration(seconds: _timeoutSeconds));
      return _parseResponse(response, method: 'GET', uri: uri);
    } on SocketException {
      return ApiResult.error(_networkErrorMessage(uri));
    } on http.ClientException catch (error) {
      return ApiResult.error('Failed to reach API service: ${error.message}');
    } catch (error) {
      return ApiResult.error('Unexpected error: $error');
    }
  }

  Future<ApiResult<Map<String, dynamic>>> _put(
    String path, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
  }) async {
    final uri = _buildUri(path);
    try {
      _logRequest('PUT', uri, body: body);
      final response = await _client
          .put(
            uri,
            headers: {..._headers, if (headers != null) ...headers},
            body: body == null ? null : jsonEncode(body),
          )
          .timeout(const Duration(seconds: _timeoutSeconds));
      return _parseResponse(response, method: 'PUT', uri: uri);
    } on SocketException {
      return ApiResult.error(_networkErrorMessage(uri));
    } on http.ClientException catch (error) {
      return ApiResult.error('Failed to reach API service: ${error.message}');
    } catch (error) {
      return ApiResult.error('Unexpected error: $error');
    }
  }

  Future<ApiResult<Map<String, dynamic>>> _patch(
    String path, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
  }) async {
    final uri = _buildUri(path);
    try {
      _logRequest('PATCH', uri, body: body);
      final response = await _client
          .patch(
            uri,
            headers: {..._headers, if (headers != null) ...headers},
            body: body == null ? null : jsonEncode(body),
          )
          .timeout(const Duration(seconds: _timeoutSeconds));
      return _parseResponse(response, method: 'PATCH', uri: uri);
    } on SocketException {
      return ApiResult.error(_networkErrorMessage(uri));
    } on http.ClientException catch (error) {
      return ApiResult.error('Failed to reach API service: ${error.message}');
    } catch (error) {
      return ApiResult.error('Unexpected error: $error');
    }
  }

  Future<ApiResult<Map<String, dynamic>>> _delete(
    String path, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
  }) async {
    final uri = _buildUri(path);
    try {
      _logRequest('DELETE', uri, body: body);
      final request = http.Request('DELETE', uri);
      request.headers.addAll({..._headers, if (headers != null) ...headers});
      if (body != null) {
        request.body = jsonEncode(body);
      }

      final streamed = await _client
          .send(request)
          .timeout(const Duration(seconds: _timeoutSeconds));
      final response = await http.Response.fromStream(streamed);
      return _parseResponse(response, method: 'DELETE', uri: uri);
    } on SocketException {
      return ApiResult.error(_networkErrorMessage(uri));
    } on http.ClientException catch (error) {
      return ApiResult.error('Failed to reach API service: ${error.message}');
    } catch (error) {
      return ApiResult.error('Unexpected error: $error');
    }
  }

  Future<ApiResult<Map<String, dynamic>>> _post(
    String path, {
    Map<String, dynamic>? body,
    Map<String, String>? headers,
  }) async {
    final uri = _buildUri(path);
    try {
      _logRequest('POST', uri, body: body);
      final response = await _client
          .post(
            uri,
            headers: {..._headers, if (headers != null) ...headers},
            body: body == null ? null : jsonEncode(body),
          )
          .timeout(const Duration(seconds: _timeoutSeconds));
      return _parseResponse(response, method: 'POST', uri: uri);
    } on SocketException {
      return ApiResult.error(_networkErrorMessage(uri));
    } on http.ClientException catch (error) {
      return ApiResult.error('Failed to reach API service: ${error.message}');
    } catch (error) {
      return ApiResult.error('Unexpected error: $error');
    }
  }

  ApiResult<Map<String, dynamic>> _parseResponse(
    http.Response response, {
    required String method,
    required Uri uri,
  }) {
    final body = response.body;
    final contentType = (response.headers['content-type'] ?? '').toLowerCase();
    final isLikelyJson =
        _isJsonContentType(contentType) || _looksLikeJson(body);
    final isHtml = _looksLikeHtml(body);

    _logResponse(method, uri, response, contentType: contentType);

    Map<String, dynamic> jsonBody = {};

    if (body.isNotEmpty && isLikelyJson) {
      try {
        final decoded = jsonDecode(body);
        if (decoded is Map<String, dynamic>) {
          jsonBody = decoded;
        }
      } on FormatException {
        final snippet = _bodySnippet(body);
        return ApiResult.error(
          'Invalid JSON response from API (${response.statusCode}) at $uri. '
          'content-type=$contentType body="$snippet"',
          statusCode: response.statusCode,
          rawData: {
            'url': uri.toString(),
            'method': method,
            'contentType': contentType,
            'bodySnippet': snippet,
          },
        );
      }
    }

    final ok = response.statusCode >= 200 && response.statusCode < 300;

    if (isHtml) {
      final snippet = _bodySnippet(body);
      return ApiResult.error(
        'API returned HTML instead of JSON at $uri '
        '(${response.statusCode}, content-type=$contentType). '
        'Check API_BASE_URL, endpoint path, backend route, and proxy setup. '
        'body="$snippet"',
        statusCode: response.statusCode,
        rawData: {
          'url': uri.toString(),
          'method': method,
          'contentType': contentType,
          'bodySnippet': snippet,
        },
      );
    }

    if (ok) {
      return ApiResult.success(
        data: jsonBody,
        message: _extractMessage(jsonBody) ?? 'Success',
      );
    }

    if (jsonBody.isNotEmpty) {
      return ApiResult.error(
        _extractMessage(jsonBody) ?? 'Request failed (${response.statusCode})',
        statusCode: response.statusCode,
        fieldErrors: _extractFieldErrors(jsonBody),
        rawData: jsonBody,
      );
    }

    return ApiResult.error(
      _buildNonJsonErrorMessage(
        uri: uri,
        statusCode: response.statusCode,
        contentType: contentType,
        body: body,
      ),
      statusCode: response.statusCode,
      rawData: {
        'url': uri.toString(),
        'method': method,
        'contentType': contentType,
        'bodySnippet': _bodySnippet(body),
      },
    );
  }

  bool _isJsonContentType(String contentType) {
    return contentType.contains('application/json') ||
        contentType.contains('application/problem+json') ||
        contentType.contains('+json');
  }

  bool _looksLikeJson(String body) {
    final trimmed = body.trimLeft();
    return trimmed.startsWith('{') || trimmed.startsWith('[');
  }

  bool _looksLikeHtml(String body) {
    final trimmed = body.trimLeft().toLowerCase();
    return trimmed.startsWith('<!doctype html') ||
        trimmed.startsWith('<html') ||
        trimmed.startsWith('<head') ||
        trimmed.startsWith('<body');
  }

  String _bodySnippet(String body) {
    final compact = body.replaceAll(RegExp(r'\s+'), ' ').trim();
    if (compact.isEmpty) {
      return '';
    }
    if (compact.length <= 220) {
      return compact;
    }
    return '${compact.substring(0, 220)}...';
  }

  String _buildNonJsonErrorMessage({
    required Uri uri,
    required int statusCode,
    required String contentType,
    required String body,
  }) {
    final snippet = _bodySnippet(body);
    final base = 'Request failed ($statusCode) at $uri';
    if (snippet.isEmpty) {
      return '$base. content-type=$contentType';
    }
    return '$base. content-type=$contentType body="$snippet"';
  }

  String _networkErrorMessage(Uri uri) {
    return 'Unable to connect to API at $uri. '
        'If running on Android emulator, use 10.0.2.2 instead of localhost.';
  }

  void _logRequest(String method, Uri uri, {Object? body}) {
    if (!kDebugMode) {
      return;
    }

    final sanitizedBody = body == null ? null : _sanitizeForLog(body);
    final bodyLog = sanitizedBody == null
        ? ''
        : ' body=${jsonEncode(sanitizedBody)}';
    debugPrint('[ApiService] --> $method $uri$bodyLog');
  }

  Object? _sanitizeForLog(Object? value) {
    if (value == null) {
      return null;
    }

    if (value is Map<String, dynamic>) {
      final sanitized = <String, dynamic>{};
      for (final entry in value.entries) {
        final key = entry.key.toLowerCase();
        if (_isSensitiveKey(key)) {
          sanitized[entry.key] = '***';
        } else {
          sanitized[entry.key] = _sanitizeForLog(entry.value);
        }
      }
      return sanitized;
    }

    if (value is List) {
      return value.map((item) => _sanitizeForLog(item)).toList();
    }

    return value;
  }

  bool _isSensitiveKey(String key) {
    return key == 'password' ||
        key == 'confirmpassword' ||
        key == 'cardnumber' ||
        key == 'cvv' ||
        key == 'refreshtoken' ||
        key == 'token' ||
        key.contains('secret');
  }

  void _logResponse(
    String method,
    Uri uri,
    http.Response response, {
    required String contentType,
  }) {
    if (!kDebugMode) {
      return;
    }

    final snippet = _bodySnippet(response.body);
    debugPrint(
      '[ApiService] <-- $method $uri '
      'status=${response.statusCode} content-type=$contentType '
      'body="$snippet"',
    );
  }

  String? _extractMessage(Map<String, dynamic> body) {
    final message = body['message'] ?? body['error'];

    if (message is String && message.trim().isNotEmpty) {
      return message;
    }

    if (message is List) {
      return message.join(', ');
    }

    return null;
  }

  Map<String, String> _extractFieldErrors(Map<String, dynamic> body) {
    final errors = body['errors'];

    if (errors is List) {
      final fieldErrors = <String, String>{};
      for (final entry in errors) {
        if (entry is Map<String, dynamic>) {
          final field = (entry['field'] ?? entry['path'] ?? '').toString();
          final message = (entry['message'] ?? entry['msg'] ?? '').toString();
          if (field.isNotEmpty && message.isNotEmpty) {
            fieldErrors[field] = message;
          }
        }
      }
      return fieldErrors;
    }

    if (errors is Map<String, dynamic>) {
      return errors.map((key, value) => MapEntry(key, value.toString()));
    }

    return {};
  }
}

class ApiResult<T> {
  const ApiResult._({
    required this.isSuccess,
    this.data,
    this.message,
    this.statusCode,
    this.fieldErrors = const {},
    this.rawData,
  });

  final bool isSuccess;
  final T? data;
  final String? message;
  final int? statusCode;
  final Map<String, String> fieldErrors;
  final Map<String, dynamic>? rawData;

  factory ApiResult.success({required T data, String? message}) {
    return ApiResult._(isSuccess: true, data: data, message: message);
  }

  factory ApiResult.error(
    String message, {
    int? statusCode,
    Map<String, String> fieldErrors = const {},
    Map<String, dynamic>? rawData,
  }) {
    return ApiResult._(
      isSuccess: false,
      message: message,
      statusCode: statusCode,
      fieldErrors: fieldErrors,
      rawData: rawData,
    );
  }
}
