enum VerificationPurpose {
  register('register'),
  passwordReset('password_reset');

  const VerificationPurpose(this.apiValue);

  final String apiValue;

  String get title {
    switch (this) {
      case VerificationPurpose.register:
        return 'Verify your email';
      case VerificationPurpose.passwordReset:
        return 'Reset password';
    }
  }
}
