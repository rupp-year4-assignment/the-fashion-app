import 'package:latlong2/latlong.dart';

List<LatLng> decodeEncodedPolyline(String encoded, {int precision = 5}) {
  if (encoded.isEmpty) {
    return const [];
  }

  final coordinates = <LatLng>[];
  final factor = _precisionFactor(precision);
  var index = 0;
  var latitude = 0;
  var longitude = 0;

  while (index < encoded.length) {
    final (latitudeDelta, nextLatitudeIndex) = _decodeValue(encoded, index);
    final (longitudeDelta, nextLongitudeIndex) = _decodeValue(
      encoded,
      nextLatitudeIndex,
    );

    latitude += latitudeDelta;
    longitude += longitudeDelta;
    index = nextLongitudeIndex;

    coordinates.add(LatLng(latitude / factor, longitude / factor));
  }

  return coordinates;
}

(int, int) _decodeValue(String encoded, int startIndex) {
  var index = startIndex;
  var result = 0;
  var shift = 0;
  int byte;

  do {
    if (index >= encoded.length) {
      throw const FormatException('Invalid encoded polyline');
    }

    byte = encoded.codeUnitAt(index) - 63;
    index += 1;
    result |= (byte & 0x1f) << shift;
    shift += 5;
  } while (byte >= 0x20);

  final value = (result & 1) != 0 ? ~(result >> 1) : (result >> 1);
  return (value, index);
}

double _precisionFactor(int precision) {
  if (precision < 0) {
    throw ArgumentError.value(
      precision,
      'precision',
      'Polyline precision must be zero or greater',
    );
  }

  var factor = 1.0;
  for (var i = 0; i < precision; i += 1) {
    factor *= 10;
  }
  return factor;
}
