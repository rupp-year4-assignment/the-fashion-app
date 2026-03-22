// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'address.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

Address _$AddressFromJson(Map<String, dynamic> json) => Address(
  id: json['id'] as String?,
  street: json['street'] as String,
  city: json['city'] as String,
  state: json['state'] as String,
  postalCode: json['postalCode'] as String,
  country: json['country'] as String,
  label: json['label'] as String?,
  isDefault: json['isDefault'] as bool? ?? false,
  latitude: (json['latitude'] as num?)?.toDouble(),
  longitude: (json['longitude'] as num?)?.toDouble(),
);

Map<String, dynamic> _$AddressToJson(Address instance) => <String, dynamic>{
  'id': instance.id,
  'street': instance.street,
  'city': instance.city,
  'state': instance.state,
  'postalCode': instance.postalCode,
  'country': instance.country,
  'label': instance.label,
  'isDefault': instance.isDefault,
  'latitude': instance.latitude,
  'longitude': instance.longitude,
};
