import 'package:json_annotation/json_annotation.dart';

part 'address.g.dart';

// ============================================
// 📍 ADDRESS MODEL
// User's delivery addresses
// ============================================

@JsonSerializable()
class Address {
  final String? id;
  final String street;
  final String city;
  final String state;
  final String postalCode;
  final String country;
  final String? label; // "Home", "Work", etc.
  final bool isDefault;
  final double? latitude;
  final double? longitude;

  const Address({
    this.id,
    required this.street,
    required this.city,
    required this.state,
    required this.postalCode,
    required this.country,
    this.label,
    this.isDefault = false,
    this.latitude,
    this.longitude,
  });

  factory Address.fromJson(Map<String, dynamic> json) =>
      _$AddressFromJson(json);

  Map<String, dynamic> toJson() => _$AddressToJson(this);
}
