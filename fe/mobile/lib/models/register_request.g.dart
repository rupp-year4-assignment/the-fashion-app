// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'register_request.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

RegisterRequest _$RegisterRequestFromJson(Map<String, dynamic> json) =>
    RegisterRequest(
      firstName: json['firstName'] as String,
      lastName: json['lastName'] as String,
      email: json['email'] as String,
      emailVerificationToken: json['emailVerificationToken'] as String?,
      password: json['password'] as String,
      confirmPassword: json['confirmPassword'] as String,
      gender:
          $enumDecodeNullable(_$GenderEnumMap, json['gender']) ??
          Gender.notSpecified,
      role:
          $enumDecodeNullable(_$UserRoleEnumMap, json['role']) ?? UserRole.user,
      status: json['status'] as String? ?? 'active',
      oauthProviders: (json['oauthProviders'] as List<dynamic>?)
          ?.map((e) => OauthProvider.fromJson(e as Map<String, dynamic>))
          .toList(),
      addresses: (json['addresses'] as List<dynamic>?)
          ?.map((e) => Address.fromJson(e as Map<String, dynamic>))
          .toList(),
    );

Map<String, dynamic> _$RegisterRequestToJson(RegisterRequest instance) =>
    <String, dynamic>{
      'firstName': instance.firstName,
      'lastName': instance.lastName,
      'email': instance.email,
      'emailVerificationToken': instance.emailVerificationToken,
      'password': instance.password,
      'confirmPassword': instance.confirmPassword,
      'gender': _$GenderEnumMap[instance.gender]!,
      'role': _$UserRoleEnumMap[instance.role]!,
      'status': instance.status,
      'oauthProviders': instance.oauthProviders,
      'addresses': instance.addresses,
    };

const _$GenderEnumMap = {
  Gender.male: 'male',
  Gender.female: 'female',
  Gender.notSpecified: 'not_specified',
};

const _$UserRoleEnumMap = {UserRole.user: 'user', UserRole.admin: 'admin'};
