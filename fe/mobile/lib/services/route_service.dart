import 'dart:convert';
import 'dart:io';

import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:http/http.dart' as http;
import 'package:latlong2/latlong.dart';
import 'package:mobile/models/road_route.dart';
import 'package:mobile/services/polyline_decoder.dart';

class RouteService {
  RouteService({http.Client? client, RouteServiceConfig? config})
    : _client = client ?? http.Client(),
      _ownsClient = client == null,
      _config = config ?? RouteServiceConfig.fromEnv();

  final http.Client _client;
  final bool _ownsClient;
  final RouteServiceConfig _config;

  Future<RoadRoute> getRoute({
    required LatLng origin,
    required LatLng destination,
  }) async {
    final fallbackPoints = [origin, destination];

    if (!_isValidCoordinate(origin) || !_isValidCoordinate(destination)) {
      return RoadRoute.fallback(
        points: fallbackPoints,
        errorMessage: 'Invalid route coordinates.',
      );
    }

    try {
      final response = await _client
          .get(
            _config.buildRouteUri(origin: origin, destination: destination),
            headers: _config.headers,
          )
          .timeout(_config.timeout);

      if (response.statusCode < 200 || response.statusCode >= 300) {
        return RoadRoute.fallback(
          points: fallbackPoints,
          errorMessage:
              'Routing request failed with status '
              '${response.statusCode}.',
        );
      }

      final decoded = jsonDecode(response.body);
      if (decoded is! Map<String, dynamic>) {
        return RoadRoute.fallback(
          points: fallbackPoints,
          errorMessage: 'Unexpected routing response payload.',
        );
      }

      final responseCode = decoded['code']?.toString();
      if (responseCode != null && responseCode != 'Ok') {
        final message = decoded['message']?.toString();
        return RoadRoute.fallback(
          points: fallbackPoints,
          errorMessage: message == null || message.isEmpty
              ? 'Routing provider returned $responseCode.'
              : message,
        );
      }

      final routes = decoded['routes'];
      if (routes is! List || routes.isEmpty) {
        return RoadRoute.fallback(
          points: fallbackPoints,
          errorMessage: 'No road route was returned.',
        );
      }

      final route = routes.first;
      if (route is! Map<String, dynamic>) {
        return RoadRoute.fallback(
          points: fallbackPoints,
          errorMessage: 'Invalid routing result format.',
        );
      }

      final geometry = route['geometry'];
      if (geometry is! String || geometry.isEmpty) {
        return RoadRoute.fallback(
          points: fallbackPoints,
          errorMessage: 'Route geometry was missing.',
        );
      }

      final decodedPoints = decodeEncodedPolyline(
        geometry,
        precision: 6,
      ).where(_isValidCoordinate).toList(growable: false);

      if (decodedPoints.length < 2) {
        return RoadRoute.fallback(
          points: fallbackPoints,
          errorMessage: 'Decoded route geometry was empty.',
        );
      }

      return RoadRoute(
        points: _normalizeRouteEndpoints(
          origin: origin,
          destination: destination,
          points: decodedPoints,
        ),
        distanceMeters: _asDouble(route['distance']),
        duration: _durationFromSeconds(route['duration']),
      );
    } catch (error) {
      return RoadRoute.fallback(
        points: fallbackPoints,
        errorMessage: 'Unable to load a road route.',
      );
    }
  }

  void dispose() {
    if (_ownsClient) {
      _client.close();
    }
  }

  static bool _isValidCoordinate(LatLng point) {
    return point.latitude >= -90 &&
        point.latitude <= 90 &&
        point.longitude >= -180 &&
        point.longitude <= 180 &&
        (point.latitude != 0 || point.longitude != 0);
  }

  static List<LatLng> _normalizeRouteEndpoints({
    required LatLng origin,
    required LatLng destination,
    required List<LatLng> points,
  }) {
    final normalizedPoints = <LatLng>[];

    if (!_sameCoordinate(origin, points.first)) {
      normalizedPoints.add(origin);
    }

    normalizedPoints.addAll(points);

    if (!_sameCoordinate(destination, normalizedPoints.last)) {
      normalizedPoints.add(destination);
    }

    return List<LatLng>.unmodifiable(normalizedPoints);
  }

  static bool _sameCoordinate(LatLng a, LatLng b) {
    return (a.latitude - b.latitude).abs() <= 0.00001 &&
        (a.longitude - b.longitude).abs() <= 0.00001;
  }

  static double? _asDouble(dynamic value) {
    if (value is num) {
      return value.toDouble();
    }
    if (value is String) {
      return double.tryParse(value);
    }
    return null;
  }

  static Duration? _durationFromSeconds(dynamic value) {
    final seconds = _asDouble(value);
    if (seconds == null) {
      return null;
    }
    return Duration(milliseconds: (seconds * 1000).round());
  }
}

class RouteServiceConfig {
  RouteServiceConfig({
    required this.baseUrl,
    required this.profile,
    required this.timeout,
    this.userAgent = _defaultUserAgent,
  });

  static const String _defaultBaseUrl = 'https://router.project-osrm.org';
  static const String _defaultProfile = 'driving';
  static const String _defaultUserAgent = 'the-fashion-app/1.0 (road-routing)';

  final String baseUrl;
  final String profile;
  final Duration timeout;
  final String userAgent;

  factory RouteServiceConfig.fromEnv() {
    final configuredBaseUrl =
        (dotenv.env['ROUTING_BASE_URL'] ?? _defaultBaseUrl).trim();
    final baseUrl = _resolveBaseUrl(configuredBaseUrl);
    final configuredProfile = (dotenv.env['ROUTING_PROFILE'] ?? _defaultProfile)
        .trim();
    final timeoutSeconds = int.tryParse(
      (dotenv.env['ROUTING_TIMEOUT_SECONDS'] ?? '').trim(),
    );
    final boundedTimeoutSeconds = (timeoutSeconds ?? 12).clamp(5, 60).toInt();

    return RouteServiceConfig(
      baseUrl: baseUrl,
      profile: configuredProfile.isEmpty ? _defaultProfile : configuredProfile,
      timeout: Duration(seconds: boundedTimeoutSeconds),
    );
  }

  Uri buildRouteUri({required LatLng origin, required LatLng destination}) {
    final coordinates =
        '${origin.longitude},${origin.latitude};'
        '${destination.longitude},${destination.latitude}';

    return Uri.parse('$baseUrl/route/v1/$profile/$coordinates').replace(
      queryParameters: const {
        'overview': 'full',
        'alternatives': 'false',
        'steps': 'false',
        'geometries': 'polyline6',
      },
    );
  }

  Map<String, String> get headers => {
    'Accept': 'application/json',
    'User-Agent': userAgent,
  };

  static String _resolveBaseUrl(String rawBaseUrl) {
    final parsed = Uri.tryParse(rawBaseUrl);
    if (parsed == null || parsed.host.isEmpty || parsed.scheme.isEmpty) {
      return _defaultBaseUrl;
    }

    final resolved = _adaptAndroidHost(parsed);
    return resolved.endsWith('/')
        ? resolved.substring(0, resolved.length - 1)
        : resolved;
  }

  static String _adaptAndroidHost(Uri uri) {
    final isLocalHost = uri.host == 'localhost' || uri.host == '127.0.0.1';
    if (!kIsWeb && Platform.isAndroid && isLocalHost) {
      return uri.replace(host: '10.0.2.2').toString();
    }
    return uri.toString();
  }
}
