import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

const _fallbackApiBaseUrl = 'http://localhost:3000/api/v1';

bool _isLocalHost(String host) => host == 'localhost' || host == '127.0.0.1';

Uri _apiBaseUri() {
  final configured = (dotenv.env['API_BASE_URL'] ?? _fallbackApiBaseUrl).trim();
  final parsed = Uri.tryParse(configured);
  final fallback = Uri.parse(_fallbackApiBaseUrl);
  final source =
      parsed == null || parsed.host.isEmpty || parsed.scheme.isEmpty
      ? fallback
      : parsed;

  if (!kIsWeb && Platform.isAndroid && _isLocalHost(source.host)) {
    return source.replace(host: '10.0.2.2');
  }

  return source;
}

String _originFromUri(Uri uri) {
  final port = uri.hasPort ? ':${uri.port}' : '';
  return '${uri.scheme}://${uri.host}$port';
}

String resolveMediaUrl(String? value) {
  final raw = value?.trim() ?? '';
  if (raw.isEmpty) return '';

  final parsed = Uri.tryParse(raw);
  if (parsed != null && parsed.hasScheme) {
    if (!kIsWeb && Platform.isAndroid && _isLocalHost(parsed.host)) {
      return parsed.replace(host: '10.0.2.2').toString();
    }
    return parsed.toString();
  }

  final origin = _originFromUri(_apiBaseUri());
  return raw.startsWith('/') ? '$origin$raw' : '$origin/$raw';
}
