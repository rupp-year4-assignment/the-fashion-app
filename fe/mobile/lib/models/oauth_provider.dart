import 'package:json_annotation/json_annotation.dart';

part 'oauth_provider.g.dart';

// ============================================
// 🔐 OAUTH PROVIDER MODEL
// Represents social login providers (Google, Apple, etc.)
// ============================================

@JsonSerializable()
class OauthProvider {
  final String provider;
  final String providerId;
  final String? accessToken;
  final String? refreshToken;
  final DateTime? expiresAt;

  const OauthProvider({
    required this.provider,
    required this.providerId,
    this.accessToken,
    this.refreshToken,
    this.expiresAt,
  });

  factory OauthProvider.fromJson(Map<String, dynamic> json) =>
      _$OauthProviderFromJson(json);

  Map<String, dynamic> toJson() => _$OauthProviderToJson(this);
}
