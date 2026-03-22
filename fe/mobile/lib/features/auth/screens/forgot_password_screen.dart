import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/app/routes.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';
import 'package:mobile/features/auth/screens/verification_screen.dart';
import 'package:mobile/models/verification_flow.dart';
import 'package:mobile/providers/auth_provider.dart';
import 'package:mobile/widgets/app_button.dart';
import 'package:mobile/widgets/app_text_field.dart';

class ForgotPasswordScreen extends ConsumerStatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  ConsumerState<ForgotPasswordScreen> createState() =>
      _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends ConsumerState<ForgotPasswordScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();

  @override
  void dispose() {
    _emailController.dispose();
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

  Future<void> _submit() async {
    FocusScope.of(context).unfocus();

    if (!_formKey.currentState!.validate()) {
      return;
    }

    final email = _emailController.text.trim();
    final result = await ref
        .read(authStateProvider.notifier)
        .sendVerificationCode(email, VerificationPurpose.passwordReset);

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
        email: email,
        purpose: VerificationPurpose.passwordReset,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final isSubmitting = authState.isSubmitting;

    final canSubmit = _emailController.text.trim().isNotEmpty && !isSubmitting;

    return Scaffold(
      backgroundColor: AppColors.primary0,
      appBar: AppBar(
        backgroundColor: AppColors.primary0,
        elevation: 0,
        leading: IconButton(
          onPressed: isSubmitting ? null : () => Navigator.of(context).pop(),
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
                Text('Forgot password', style: AppTextStyles.h2SemiBold),
                const SizedBox(height: 10),
                Text(
                  'Enter your email for the verification process.\nWe will send a code to your inbox.',
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
                const SizedBox(height: 30),
                AppButton(
                  label: 'Continue',
                  onPressed: _submit,
                  isLoading: isSubmitting,
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
