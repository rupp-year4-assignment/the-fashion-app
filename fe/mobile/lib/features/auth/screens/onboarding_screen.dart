import 'package:flutter/material.dart';
import 'package:mobile/app/routes.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';
import 'package:mobile/features/auth/widgets/auth_pattern_background.dart';
import 'package:mobile/widgets/app_button.dart';

class OnboardingScreen extends StatelessWidget {
  const OnboardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final size = MediaQuery.of(context).size;

    return Scaffold(
      backgroundColor: AppColors.primary0,
      body: SafeArea(
        child: AuthPatternBackground(
          child: Column(
            children: [
              Expanded(
                child: Stack(
                  children: [
                    Positioned(
                      left: 24,
                      top: 26,
                      right: size.width * 0.35,
                      child: Text(
                        'Define\nyourself in\nyour unique\nway.',
                        style: AppTextStyles.h1SemiBold.copyWith(height: 0.92),
                      ),
                    ),
                    Positioned(
                      right: -16,
                      bottom: 0,
                      child: Image.asset(
                        'assets/images/onboarding_person.png',
                        width: size.width * 0.72,
                        fit: BoxFit.contain,
                      ),
                    ),
                  ],
                ),
              ),
              Container(
                width: double.infinity,
                padding: const EdgeInsets.fromLTRB(24, 18, 24, 26),
                decoration: const BoxDecoration(
                  color: AppColors.primary0,
                  border: Border(top: BorderSide(color: AppColors.primary100)),
                ),
                child: AppButton(
                  label: 'Get Started',
                  onPressed: () {
                    Navigator.of(context).pushReplacementNamed(AppRoutes.login);
                  },
                  leading: const Icon(Icons.arrow_forward, size: 18),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
