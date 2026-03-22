import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/app/routes.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';
import 'package:mobile/providers/auth_provider.dart';
import 'package:mobile/widgets/app_button.dart';
import 'package:mobile/widgets/app_text_field.dart';

class ResetPasswordScreen extends ConsumerStatefulWidget {
  const ResetPasswordScreen({super.key});

  @override
  ConsumerState<ResetPasswordScreen> createState() =>
      _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends ConsumerState<ResetPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _newPasswordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();

  bool _obscureNewPassword = true;
  bool _obscureConfirmPassword = true;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _newPasswordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
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

  String? _validateConfirmPassword(String? value) {
    final input = value ?? '';
    if (input.isEmpty) {
      return 'Please confirm your password';
    }

    if (input != _newPasswordController.text) {
      return 'Passwords do not match';
    }

    return null;
  }

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();

    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isSubmitting = true;
    });

    await Future<void>.delayed(const Duration(milliseconds: 700));

    if (!mounted) {
      return;
    }

    setState(() {
      _isSubmitting = false;
    });

    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (context) {
        return AlertDialog(
          backgroundColor: AppColors.primary0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          contentPadding: const EdgeInsets.fromLTRB(20, 20, 20, 18),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(
                Icons.check_circle,
                color: AppColors.success,
                size: 70,
              ),
              const SizedBox(height: 14),
              Text(
                'Password Changed!',
                style: AppTextStyles.h2SemiBold.copyWith(fontSize: 24),
              ),
              const SizedBox(height: 10),
              Text(
                'Your password has been updated successfully.',
                textAlign: TextAlign.center,
                style: AppTextStyles.b2Regular,
              ),
              const SizedBox(height: 20),
              AppButton(
                label: 'OK',
                onPressed: () {
                  Navigator.of(context).pop();
                },
              ),
            ],
          ),
        );
      },
    );

    if (!mounted) {
      return;
    }

    ref.read(authStateProvider.notifier).clearVerificationFlow();

    Navigator.of(
      context,
    ).pushNamedAndRemoveUntil(AppRoutes.login, (_) => false);
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);

    if (!authState.isVerificationCodeValid) {
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (!mounted) {
          return;
        }
        Navigator.of(
          context,
        ).pushNamedAndRemoveUntil(AppRoutes.forgotPassword, (_) => false);
      });

      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(color: AppColors.primary900),
        ),
      );
    }

    final canSubmit =
        _newPasswordController.text.isNotEmpty &&
        _confirmPasswordController.text.isNotEmpty &&
        !_isSubmitting;

    return Scaffold(
      backgroundColor: AppColors.primary0,
      appBar: AppBar(
        backgroundColor: AppColors.primary0,
        elevation: 0,
        leading: IconButton(
          onPressed: _isSubmitting ? null : () => Navigator.of(context).pop(),
          icon: const Icon(Icons.arrow_back, color: AppColors.primary900),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.fromLTRB(24, 6, 24, 24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Reset Password', style: AppTextStyles.h2SemiBold),
                const SizedBox(height: 10),
                Text(
                  'Create a new password for your account.',
                  style: AppTextStyles.b1Regular.copyWith(
                    color: AppColors.primary500,
                  ),
                ),
                const SizedBox(height: 30),
                AppTextField(
                  label: 'New Password',
                  controller: _newPasswordController,
                  hintText: 'Enter new password',
                  obscureText: _obscureNewPassword,
                  enabled: !_isSubmitting,
                  onChanged: (_) => setState(() {}),
                  validator: _validatePassword,
                  suffixIcon: IconButton(
                    onPressed: _isSubmitting
                        ? null
                        : () => setState(() {
                            _obscureNewPassword = !_obscureNewPassword;
                          }),
                    icon: Icon(
                      _obscureNewPassword
                          ? Icons.visibility_off
                          : Icons.visibility,
                      color: AppColors.primary500,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                AppTextField(
                  label: 'Confirm Password',
                  controller: _confirmPasswordController,
                  hintText: 'Confirm new password',
                  obscureText: _obscureConfirmPassword,
                  enabled: !_isSubmitting,
                  onChanged: (_) => setState(() {}),
                  validator: _validateConfirmPassword,
                  suffixIcon: IconButton(
                    onPressed: _isSubmitting
                        ? null
                        : () => setState(() {
                            _obscureConfirmPassword = !_obscureConfirmPassword;
                          }),
                    icon: Icon(
                      _obscureConfirmPassword
                          ? Icons.visibility_off
                          : Icons.visibility,
                      color: AppColors.primary500,
                    ),
                  ),
                ),
                const SizedBox(height: 30),
                AppButton(
                  label: 'Continue',
                  onPressed: _submit,
                  isLoading: _isSubmitting,
                  enabled: canSubmit,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
