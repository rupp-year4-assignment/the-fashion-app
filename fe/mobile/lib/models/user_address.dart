class UserAddress {
  const UserAddress({
    required this.id,
    required this.addressType,
    required this.label,
    required this.street,
    required this.city,
    required this.state,
    required this.postalCode,
    required this.country,
    required this.latitude,
    required this.longitude,
    required this.isDefault,
  });

  final String id;
  final String addressType;
  final String label;
  final String street;
  final String city;
  final String state;
  final String postalCode;
  final String country;
  final double latitude;
  final double longitude;
  final bool isDefault;

  String get fullAddress => [
    street,
    city,
    state,
    postalCode,
    country,
  ].where((part) => part.trim().isNotEmpty).join(', ');

  factory UserAddress.fromJson(Map<String, dynamic> json) {
    final location = json['location'];
    double latitude = 0;
    double longitude = 0;

    if (location is Map<String, dynamic>) {
      final coordinates = location['coordinates'];
      if (coordinates is List && coordinates.length >= 2) {
        longitude = _asDouble(coordinates[0], fallback: 0);
        latitude = _asDouble(coordinates[1], fallback: 0);
      }
    } else {
      latitude = _asDouble(json['latitude'], fallback: 0);
      longitude = _asDouble(json['longitude'], fallback: 0);
    }

    return UserAddress(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      addressType: json['addressType']?.toString() ?? 'USER_DELIVERY',
      label: json['label']?.toString().trim().isNotEmpty == true
          ? json['label'].toString().trim()
          : 'Home',
      street: json['street']?.toString() ?? '',
      city: json['city']?.toString() ?? '',
      state: json['state']?.toString() ?? '',
      postalCode: (json['postalCode'] ?? json['zip'])?.toString() ?? '',
      country: json['country']?.toString() ?? '',
      latitude: latitude,
      longitude: longitude,
      isDefault: json['isDefault'] == true || json['isDefualt'] == true,
    );
  }

  static double _asDouble(dynamic value, {required double fallback}) {
    if (value is num) {
      return value.toDouble();
    }

    if (value is String) {
      return double.tryParse(value) ?? fallback;
    }

    return fallback;
  }
}
