import 'package:flutter/gestures.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/app/routes.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';
import 'package:mobile/providers/auth_provider.dart';
import 'package:mobile/widgets/app_button.dart';
import 'package:mobile/widgets/app_text_field.dart';
import 'package:mobile/widgets/social_auth_button.dart';

class LoginScreen extends ConsumerStatefulWidget {
  const LoginScreen({super.key});

  @override
  ConsumerState<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends ConsumerState<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();

  bool _obscurePassword = true;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  void _onInputChanged(String _) {
    ref.read(authStateProvider.notifier).clearFeedback();
    setState(() {});
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

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();

    if (!_formKey.currentState!.validate()) {
      return;
    }

    final result = await ref
        .read(authStateProvider.notifier)
        .login(
          email: _emailController.text.trim(),
          password: _passwordController.text,
        );

    if (!mounted || !result.isSuccess) {
      return;
    }

    Navigator.of(context).pushNamedAndRemoveUntil(AppRoutes.home, (_) => false);
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final isSubmitting = authState.isSubmitting;

    final canSubmit =
        _emailController.text.trim().isNotEmpty &&
        _passwordController.text.isNotEmpty &&
        !isSubmitting;

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
                Text('Login to your account', style: AppTextStyles.h2SemiBold),
                const SizedBox(height: 10),
                Text(
                  "It's great to see you again.",
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
                  label: 'Email',
                  controller: _emailController,
                  hintText: 'Enter your email',
                  keyboardType: TextInputType.emailAddress,
                  enabled: !isSubmitting,
                  validator: _validateEmail,
                  onChanged: _onInputChanged,
                  errorText: authState.fieldErrors['email'],
                ),
                const SizedBox(height: 16),
                AppTextField(
                  label: 'Password',
                  controller: _passwordController,
                  hintText: 'Enter your password',
                  obscureText: _obscurePassword,
                  enabled: !isSubmitting,
                  validator: _validatePassword,
                  onChanged: _onInputChanged,
                  textInputAction: TextInputAction.done,
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
                const SizedBox(height: 12),
                Align(
                  alignment: Alignment.centerRight,
                  child: RichText(
                    text: TextSpan(
                      style: AppTextStyles.b2Regular.copyWith(
                        color: AppColors.primary500,
                      ),
                      children: [
                        const TextSpan(text: 'Forgot your password? '),
                        TextSpan(
                          text: 'Reset your password',
                          style: AppTextStyles.b2Regular.copyWith(
                            color: AppColors.primary900,
                            decoration: TextDecoration.underline,
                          ),
                          recognizer: TapGestureRecognizer()
                            ..onTap = () {
                              if (isSubmitting) {
                                return;
                              }
                              Navigator.of(
                                context,
                              ).pushNamed(AppRoutes.forgotPassword);
                            },
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),
                AppButton(
                  label: 'Login',
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
                  label: 'Login with Google',
                  icon: Icons.g_mobiledata,
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Google login coming soon.'),
                      ),
                    );
                  },
                ),
                const SizedBox(height: 12),
                SocialAuthButton(
                  label: 'Login with Facebook',
                  icon: Icons.facebook,
                  onTap: () {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('Facebook login coming soon.'),
                      ),
                    );
                  },
                  backgroundColor: AppColors.facebookBlue,
                  textColor: AppColors.primary0,
                  borderColor: AppColors.facebookBlue,
                ),
                const SizedBox(height: 26),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(
                      "Don't have an account? ",
                      style: AppTextStyles.b2Regular,
                    ),
                    GestureDetector(
                      onTap: isSubmitting
                          ? null
                          : () {
                              Navigator.of(
                                context,
                              ).pushNamed(AppRoutes.register);
                            },
                      child: Text(
                        'Join',
                        style: AppTextStyles.b2Regular.copyWith(
                          color: AppColors.primary900,
                          decoration: TextDecoration.underline,
                        ),
                      ),
                    ),
                  ],
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
