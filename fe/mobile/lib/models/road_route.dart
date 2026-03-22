import 'package:latlong2/latlong.dart';

class RoadRoute {
  RoadRoute({
    required List<LatLng> points,
    this.distanceMeters,
    this.duration,
    this.isFallback = false,
    this.errorMessage,
  }) : points = List<LatLng>.unmodifiable(points);

  factory RoadRoute.fallback({
    required List<LatLng> points,
    String? errorMessage,
  }) {
    return RoadRoute(
      points: points,
      isFallback: true,
      errorMessage: errorMessage,
    );
  }

  final List<LatLng> points;
  final double? distanceMeters;
  final Duration? duration;
  final bool isFallback;
  final String? errorMessage;
}
