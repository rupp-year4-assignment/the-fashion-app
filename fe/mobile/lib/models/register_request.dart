import 'package:json_annotation/json_annotation.dart';
import 'package:mobile/models/oauth_provider.dart';
import 'package:mobile/models/address.dart';

part 'register_request.g.dart';

// ============================================
// 📝 REGISTER REQUEST MODEL
// Data structure for user registration
// ============================================

@JsonSerializable()
class RegisterRequest {
  final String firstName;
  final String lastName;
  final String email;
  final String? emailVerificationToken;
  final String password;
  final String confirmPassword;

  @JsonKey(name: 'gender')
  final Gender gender;

  @JsonKey(name: 'role')
  final UserRole role;

  final String? status;
  final List<OauthProvider>? oauthProviders;
  final List<Address>? addresses;

  const RegisterRequest({
    required this.firstName,
    required this.lastName,
    required this.email,
    this.emailVerificationToken,
    required this.password,
    required this.confirmPassword,
    this.gender = Gender.notSpecified,
    this.role = UserRole.user,
    this.status = 'active',
    this.oauthProviders,
    this.addresses,
  });

  factory RegisterRequest.fromJson(Map<String, dynamic> json) =>
      _$RegisterRequestFromJson(json);

  Map<String, dynamic> toJson() => _$RegisterRequestToJson(this);

  RegisterRequest copyWith({
    String? firstName,
    String? lastName,
    String? email,
    String? emailVerificationToken,
    String? password,
    String? confirmPassword,
    Gender? gender,
    UserRole? role,
    String? status,
    List<OauthProvider>? oauthProviders,
    List<Address>? addresses,
  }) {
    return RegisterRequest(
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      email: email ?? this.email,
      emailVerificationToken:
          emailVerificationToken ?? this.emailVerificationToken,
      password: password ?? this.password,
      confirmPassword: confirmPassword ?? this.confirmPassword,
      gender: gender ?? this.gender,
      role: role ?? this.role,
      status: status ?? this.status,
      oauthProviders: oauthProviders ?? this.oauthProviders,
      addresses: addresses ?? this.addresses,
    );
  }
}

// ============================================
// 📊 ENUMS
// ============================================

@JsonEnum()
enum Gender {
  @JsonValue('male')
  male,

  @JsonValue('female')
  female,

  @JsonValue('not_specified')
  notSpecified,
}

@JsonEnum()
enum UserRole {
  @JsonValue('user')
  user,

  @JsonValue('admin')
  admin,
}

@JsonEnum()
enum UserStatus {
  @JsonValue('active')
  active,

  @JsonValue('banned')
  banned,

  @JsonValue('pending')
  pending,
}

// ============================================
// 🌟 EXTENSION METHODS
// ============================================

extension GenderExtension on Gender {
  String get displayName {
    switch (this) {
      case Gender.male:
        return 'Male';
      case Gender.female:
        return 'Female';
      case Gender.notSpecified:
        return 'Prefer not to say';
    }
  }
}
