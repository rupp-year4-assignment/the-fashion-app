import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/app/routes.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';
import 'package:mobile/features/auth/screens/verification_screen.dart';
import 'package:mobile/models/register_request.dart';
import 'package:mobile/models/verification_flow.dart';
import 'package:mobile/providers/auth_provider.dart';
import 'package:mobile/widgets/app_button.dart';
import 'package:mobile/widgets/app_text_field.dart';
import 'package:mobile/widgets/social_auth_button.dart';

class RegisterScreen extends ConsumerStatefulWidget {
  const RegisterScreen({super.key});

  @override
  ConsumerState<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends ConsumerState<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _obscurePassword = true;

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _onInputChanged(String _) {
    ref.read(authStateProvider.notifier).clearFeedback();
    setState(() {});
  }

  String? _validateFullName(String? value) {
    final input = value?.trim() ?? '';
    if (input.isEmpty) {
      return 'Full name is required';
    }

    final parts = input.split(RegExp(r'\s+'));
    if (parts.length < 2) {
      return 'Enter first and last name';
    }

    if (parts.any((part) => part.length < 2)) {
      return 'Each name must be at least 2 characters';
    }

    return null;
  }

  String? _validateEmail(String? value) {
    final input = value?.trim() ?? '';
    if (input.isEmpty) {
      return 'Email is required';
    }

    const pattern = r'^[^@\s]+@[^@\s]+\.[^@\s]+$';
    if (!RegExp(pattern).hasMatch(input)) {
      return 'Enter a valid email address';
    }

    return null;
  }

  String? _validatePassword(String? value) {
    final input = value ?? '';
    if (input.isEmpty) {
      return 'Password is required';
    }

    if (input.length < 6) {
      return 'Password must be at least 6 characters';
    }

    return null;
  }

  RegisterRequest _toRegisterPayload() {
    final parts = _fullNameController.text.trim().split(RegExp(r'\s+'));
    final firstName = parts.first;
    final lastName = parts.sublist(1).join(' ');

    return RegisterRequest(
      firstName: firstName,
      lastName: lastName,
      email: _emailController.text.trim(),
      password: _passwordController.text,
      confirmPassword: _passwordController.text,
      gender: Gender.notSpecified,
      role: UserRole.user,
      status: 'active',
    );
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();

    if (!_formKey.currentState!.validate()) {
      return;
    }

    final result = await ref
        .read(authStateProvider.notifier)
        .sendVerificationCode(
          _emailController.text.trim(),
          VerificationPurpose.register,
        );

    if (!mounted || !result.isSuccess) {
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(result.message ?? 'Verification code sent.'),
        backgroundColor: AppColors.success,
      ),
    );

    Navigator.of(context).pushNamed(
      AppRoutes.verification,
      arguments: VerificationArgs(
        email: _emailController.text.trim(),
        purpose: VerificationPurpose.register,
        pendingRegistration: _toRegisterPayload(),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final isSubmitting = authState.isSubmitting;

    final canSubmit =
        _fullNameController.text.trim().isNotEmpty &&
        _emailController.text.trim().isNotEmpty &&
        _passwordController.text.isNotEmpty &&
        !isSubmitting;

    final serverNameError =
        authState.fieldErrors['fullName'] ??
        authState.fieldErrors['firstName'] ??
        authState.fieldErrors['lastName'];

    return Scaffold(
      backgroundColor: AppColors.primary0,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 20, 24, 24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Create an account', style: AppTextStyles.h2SemiBold),
                const SizedBox(height: 10),
                Text(
                  "Let's create your account.",
                  style: AppTextStyles.b1Regular.copyWith(
                    color: AppColors.primary500,
                  ),
                ),
                const SizedBox(height: 30),
                if (authState.errorMessage != null) ...[
                  _InlineMessage(
                    text: authState.errorMessage!,
                    color: AppColors.error,
                  ),
                  const SizedBox(height: 16),
                ],
                AppTextField(
                  label: 'Full Name',
                  controller: _fullNameController,
                  hintText: 'Enter your full name',
                  enabled: !isSubmitting,
                  onChanged: _onInputChanged,
                  validator: _validateFullName,
                  errorText: serverNameError,
                ),
                const SizedBox(height: 16),
                AppTextField(
                  label: 'Email',
                  controller: _emailController,
                  hintText: 'Enter your email',
                  keyboardType: TextInputType.emailAddress,
                  enabled: !isSubmitting,
                  onChanged: _onInputChanged,
                  validator: _validateEmail,
                  errorText: authState.fieldErrors['email'],
                ),
                const SizedBox(height: 16),
                AppTextField(
                  label: 'Password',
                  controller: _passwordController,
                  hintText: 'Create your password',
                  obscureText: _obscurePassword,
                  enabled: !isSubmitting,
                  onChanged: _onInputChanged,
                  validator: _validatePassword,
                  errorText: authState.fieldErrors['password'],
                  suffixIcon: IconButton(
                    onPressed: isSubmitting
                        ? null
                        : () => setState(() {
                            _obscurePassword = !_obscurePassword;
                          }),
                    icon: Icon(
                      _obscurePassword
                          ? Icons.visibility_off
                          : Icons.visibility,
                      color: AppColors.primary500,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                RichText(
                  text: TextSpan(
                    style: AppTextStyles.b2Regular.copyWith(
                      color: AppColors.primary500,
                    ),
                    children: [
                      const TextSpan(
                        text: 'By creating an account, you agree to our ',
                      ),
                      TextSpan(
                        text: 'Terms & Conditions',
                        style: AppTextStyles.b2Regular.copyWith(
                          color: AppColors.primary900,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                      const TextSpan(text: ' and '),
                      TextSpan(
                        text: 'Privacy Policy',
                        style: AppTextStyles.b2Regular.copyWith(
                          color: AppColors.primary900,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                      const TextSpan(text: '.'),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                AppButton(
                  label: 'Continue',
                  onPressed: _submit,
                  isLoading: isSubmitting,
                  enabled: canSubmit,
                ),
                const SizedBox(height: 26),
                Row(
                  children: [
                    const Expanded(child: Divider()),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text(
                        'Or',
                        style: AppTextStyles.b2Regular.copyWith(
                          color: AppColors.primary500,
                        ),
                      ),
                    ),
                    const Expanded(child: Divider()),
                  ],
                ),
                const SizedBox(height: 22),
                SocialAuthButton(
                  label: 'Sign up with Google',
                  icon: Icons.g_mobiledata,
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Google sign-up coming soon.'),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 12),
                SocialAuthButton(
                  label: 'Sign up with Facebook',
                  icon: Icons.facebook,
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Facebook sign-up coming soon.'),
                      ),
                    );
                  },
                  backgroundColor: AppColors.facebookBlue,
                  textColor: AppColors.primary0,
                  borderColor: AppColors.facebookBlue,
                ),
                const SizedBox(height: 26),
                Align(
                  child: RichText(
                    text: TextSpan(
                      style: AppTextStyles.b2Regular.copyWith(
                        color: AppColors.primary500,
                      ),
                      children: [
                        const TextSpan(text: 'Already have an account? '),
                        TextSpan(
                          text: 'Log In',
                          style: AppTextStyles.b2Regular.copyWith(
                            color: AppColors.primary900,
                            decoration: TextDecoration.underline,
                          ),
                          recognizer: TapGestureRecognizer()
                            ..onTap = () {
                              if (isSubmitting) {
                                return;
                              }
                              Navigator.of(context).pushNamedAndRemoveUntil(
                                AppRoutes.login,
                                (_) => false,
                              );
                            },
                        ),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _InlineMessage extends StatelessWidget {
  const _InlineMessage({required this.text, required this.color});

  final String text;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.08),
        border: Border.all(color: color.withValues(alpha: 0.2)),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Text(text, style: AppTextStyles.b2Regular.copyWith(color: color)),
    );
  }
}
