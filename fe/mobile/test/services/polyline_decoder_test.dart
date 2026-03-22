import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/services/polyline_decoder.dart';

void main() {
  test('decodeEncodedPolyline decodes encoded route geometry', () {
    final points = decodeEncodedPolyline('_p~iF~ps|U_ulLnnqC_mqNvxq`@');

    expect(points, hasLength(3));
    expect(points[0].latitude, closeTo(38.5, 0.000001));
    expect(points[0].longitude, closeTo(-120.2, 0.000001));
    expect(points[1].latitude, closeTo(40.7, 0.000001));
    expect(points[1].longitude, closeTo(-120.95, 0.000001));
    expect(points[2].latitude, closeTo(43.252, 0.000001));
    expect(points[2].longitude, closeTo(-126.453, 0.000001));
  });
}
