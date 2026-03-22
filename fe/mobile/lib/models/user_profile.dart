class UserProfile {
  const UserProfile({
    required this.id,
    required this.firstName,
    required this.lastName,
    required this.fullName,
    required this.email,
    required this.gender,
    required this.phoneNumber,
    required this.dateOfBirth,
    required this.role,
    required this.status,
  });

  final String id;
  final String firstName;
  final String lastName;
  final String fullName;
  final String email;
  final String gender;
  final String phoneNumber;
  final DateTime? dateOfBirth;
  final String role;
  final String status;

  String get displayName {
    final composed = [firstName, lastName]
        .where((value) => value.trim().isNotEmpty)
        .join(' ')
        .trim();
    if (composed.isNotEmpty) return composed;
    if (fullName.trim().isNotEmpty) return fullName.trim();
    return 'User';
  }

  String get initials {
    final source = [firstName, lastName]
        .where((value) => value.trim().isNotEmpty)
        .toList();
    if (source.isEmpty) {
      final fallback = displayName.trim();
      return fallback.isNotEmpty ? fallback.substring(0, 1).toUpperCase() : 'U';
    }

    final buffer = StringBuffer();
    for (final part in source.take(2)) {
      buffer.write(part.trim().substring(0, 1).toUpperCase());
    }
    return buffer.toString();
  }

  String get formattedDateOfBirth {
    if (dateOfBirth == null) return '';
    final year = dateOfBirth!.year.toString().padLeft(4, '0');
    final month = dateOfBirth!.month.toString().padLeft(2, '0');
    final day = dateOfBirth!.day.toString().padLeft(2, '0');
    return '$year-$month-$day';
  }

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: (json['id'] ?? json['_id'] ?? '').toString(),
      firstName: (json['firstName'] ?? '').toString().trim(),
      lastName: (json['lastName'] ?? '').toString().trim(),
      fullName: (json['fullName'] ?? '').toString().trim(),
      email: (json['email'] ?? '').toString().trim(),
      gender: (json['gender'] ?? 'not_specified').toString(),
      phoneNumber: (json['phoneNumber'] ?? '').toString().trim(),
      dateOfBirth: _parseDate(json['dateOfBirth']),
      role: (json['role'] ?? 'user').toString(),
      status: (json['status'] ?? 'active').toString(),
    );
  }

  static DateTime? _parseDate(dynamic value) {
    if (value == null) return null;
    return DateTime.tryParse(value.toString());
  }
}
