// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'oauth_provider.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

OauthProvider _$OauthProviderFromJson(Map<String, dynamic> json) =>
    OauthProvider(
      provider: json['provider'] as String,
      providerId: json['providerId'] as String,
      accessToken: json['accessToken'] as String?,
      refreshToken: json['refreshToken'] as String?,
      expiresAt: json['expiresAt'] == null
          ? null
          : DateTime.parse(json['expiresAt'] as String),
    );

Map<String, dynamic> _$OauthProviderToJson(OauthProvider instance) =>
    <String, dynamic>{
      'provider': instance.provider,
      'providerId': instance.providerId,
      'accessToken': instance.accessToken,
      'refreshToken': instance.refreshToken,
      'expiresAt': instance.expiresAt?.toIso8601String(),
    };
