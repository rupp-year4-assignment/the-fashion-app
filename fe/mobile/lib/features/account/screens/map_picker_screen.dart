import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:http/http.dart' as http;
import 'package:latlong2/latlong.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';
import 'package:mobile/widgets/app_button.dart';
import 'package:mobile/widgets/app_screen_header.dart';

class MapPickResult {
  const MapPickResult({
    required this.latitude,
    required this.longitude,
    this.displayName,
    this.street,
    this.city,
    this.state,
    this.postalCode,
    this.country,
  });

  final double latitude;
  final double longitude;
  final String? displayName;
  final String? street;
  final String? city;
  final String? state;
  final String? postalCode;
  final String? country;
}

class MapPickerScreen extends StatefulWidget {
  const MapPickerScreen({
    super.key,
    this.initialLatitude,
    this.initialLongitude,
  });

  final double? initialLatitude;
  final double? initialLongitude;

  @override
  State<MapPickerScreen> createState() => _MapPickerScreenState();
}

class _MapPickerScreenState extends State<MapPickerScreen> {
  late LatLng _selectedPoint;
  bool _isResolving = false;
  String? _resolvedAddress;
  MapPickResult? _resolvedResult;

  @override
  void initState() {
    super.initState();
    _selectedPoint = LatLng(
      widget.initialLatitude ?? 11.5564,
      widget.initialLongitude ?? 104.9282,
    );
    Future.microtask(() => _reverseGeocode(_selectedPoint));
  }

  Future<void> _reverseGeocode(LatLng point) async {
    setState(() => _isResolving = true);

    try {
      final uri = Uri.parse(
        'https://nominatim.openstreetmap.org/reverse'
        '?format=jsonv2&addressdetails=1&lat=${point.latitude}&lon=${point.longitude}',
      );

      final response = await http.get(
        uri,
        headers: const {
          'Accept': 'application/json',
          'User-Agent': 'the-fashion-app/1.0 (address-picker)',
        },
      );

      if (!mounted) return;

      if (response.statusCode < 200 || response.statusCode >= 300) {
        setState(() {
          _isResolving = false;
          _resolvedAddress = null;
          _resolvedResult = null;
        });
        return;
      }

      final decoded = jsonDecode(response.body);
      if (decoded is! Map<String, dynamic>) {
        setState(() {
          _isResolving = false;
          _resolvedAddress = null;
          _resolvedResult = null;
        });
        return;
      }

      final address = decoded['address'];
      final addressMap = address is Map<String, dynamic> ? address : null;
      final street = _firstNonEmpty([
        addressMap?['road'],
        addressMap?['residential'],
        addressMap?['pedestrian'],
      ]);
      final city = _firstNonEmpty([
        addressMap?['city'],
        addressMap?['town'],
        addressMap?['municipality'],
        addressMap?['county'],
      ]);
      final state = _firstNonEmpty([
        addressMap?['state'],
        addressMap?['region'],
      ]);
      final postalCode = _firstNonEmpty([addressMap?['postcode']]);
      final country = _firstNonEmpty([addressMap?['country']]);
      final displayName = decoded['display_name']?.toString();

      setState(() {
        _isResolving = false;
        _resolvedAddress = displayName;
        _resolvedResult = MapPickResult(
          latitude: point.latitude,
          longitude: point.longitude,
          displayName: displayName,
          street: street,
          city: city,
          state: state,
          postalCode: postalCode,
          country: country,
        );
      });
    } catch (_) {
      if (!mounted) return;
      setState(() {
        _isResolving = false;
        _resolvedAddress = null;
        _resolvedResult = null;
      });
    }
  }

  String? _firstNonEmpty(List<dynamic> values) {
    for (final value in values) {
      if (value == null) continue;
      final text = value.toString().trim();
      if (text.isNotEmpty) return text;
    }
    return null;
  }

  void _selectPoint(LatLng point) {
    setState(() => _selectedPoint = point);
    _reverseGeocode(point);
  }

  void _confirmSelection() {
    Navigator.pop(
      context,
      _resolvedResult ??
          MapPickResult(
            latitude: _selectedPoint.latitude,
            longitude: _selectedPoint.longitude,
          ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary0,
      body: SafeArea(
        child: Column(
          children: [
            AppScreenHeader(
              title: 'Pick Location',
              leading: IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.arrow_back, size: 24),
              ),
            ),
            Expanded(
              child: FlutterMap(
                options: MapOptions(
                  initialCenter: _selectedPoint,
                  initialZoom: 14,
                  onTap: (_, point) => _selectPoint(point),
                ),
                children: [
                  TileLayer(
                    urlTemplate:
                        'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                    userAgentPackageName: 'com.example.mobile',
                  ),
                  MarkerLayer(
                    markers: [
                      Marker(
                        point: _selectedPoint,
                        width: 46,
                        height: 46,
                        child: const Icon(
                          Icons.location_pin,
                          size: 46,
                          color: AppColors.error,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 16),
              decoration: BoxDecoration(
                color: AppColors.primary0,
                border: Border(top: BorderSide(color: AppColors.primary100)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Selected Coordinates',
                    style: AppTextStyles.b1Medium.copyWith(fontSize: 14),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${_selectedPoint.latitude.toStringAsFixed(6)}, '
                    '${_selectedPoint.longitude.toStringAsFixed(6)}',
                    style: AppTextStyles.b2Regular,
                  ),
                  const SizedBox(height: 10),
                  if (_isResolving)
                    Row(
                      children: [
                        const SizedBox(
                          width: 14,
                          height: 14,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Resolving address...',
                          style: AppTextStyles.b2Regular,
                        ),
                      ],
                    )
                  else if (_resolvedAddress != null &&
                      _resolvedAddress!.trim().isNotEmpty)
                    Text(_resolvedAddress!, style: AppTextStyles.b2Regular)
                  else
                    Text(
                      'Tap on map to choose exact location.',
                      style: AppTextStyles.b2Regular,
                    ),
                  const SizedBox(height: 12),
                  AppButton(
                    label: 'Use This Location',
                    onPressed: _confirmSelection,
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
