import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/app/routes.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';
import 'package:mobile/features/auth/widgets/auth_pattern_background.dart';
import 'package:mobile/providers/auth_provider.dart';

class SplashScreen extends ConsumerStatefulWidget {
  const SplashScreen({super.key});

  @override
  ConsumerState<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends ConsumerState<SplashScreen> {
  bool _minimumDelayCompleted = false;
  bool _didNavigate = false;

  @override
  void initState() {
    super.initState();
    Future<void>.delayed(const Duration(seconds: 2), () {
      if (!mounted) {
        return;
      }
      setState(() {
        _minimumDelayCompleted = true;
      });
      _navigateIfReady();
    });
  }

  void _navigateIfReady() {
    if (_didNavigate || !_minimumDelayCompleted) {
      return;
    }

    final authState = ref.read(authStateProvider);
    if (authState.isBootstrapping) {
      return;
    }

    _didNavigate = true;

    final target = authState.isAuthenticated
        ? AppRoutes.home
        : AppRoutes.onboarding;
    Navigator.of(context).pushReplacementNamed(target);
  }

  @override
  Widget build(BuildContext context) {
    ref.listen<AuthState>(authStateProvider, (previous, next) {
      if (previous?.isBootstrapping != next.isBootstrapping) {
        _navigateIfReady();
      }
    });

    return Scaffold(
      backgroundColor: AppColors.primary0,
      body: SafeArea(
        child: AuthPatternBackground(
          child: Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                Container(
                  width: 86,
                  height: 86,
                  decoration: BoxDecoration(
                    color: AppColors.primary900,
                    borderRadius: BorderRadius.circular(24),
                  ),
                  child: const Icon(
                    Icons.shopping_bag_outlined,
                    color: AppColors.primary0,
                    size: 42,
                  ),
                ),
                const SizedBox(height: 24),
                Text(
                  'THE FASHION',
                  style: AppTextStyles.b1Medium.copyWith(
                    letterSpacing: 3,
                    fontSize: 18,
                  ),
                ),
                const SizedBox(height: 24),
                const SizedBox(
                  width: 24,
                  height: 24,
                  child: CircularProgressIndicator(
                    strokeWidth: 2,
                    color: AppColors.primary900,
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
