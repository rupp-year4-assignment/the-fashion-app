import 'package:go_router/go_router.dart';
import 'package:mobile/app/features/authentication/presentation/view/forgot_password_screen.dart';
import 'package:mobile/app/features/authentication/presentation/view/login_screen.dart';
import 'package:mobile/app/features/authentication/presentation/view/reset_password_screen.dart';
import 'package:mobile/app/features/authentication/presentation/view/send_otp_screen.dart';
import 'package:mobile/app/features/authentication/presentation/view/signup_screen.dart';
import 'package:mobile/app/features/boarding/presentation/view/boarding_screen.dart';
import 'package:mobile/app/features/home/presentation/view/home_screen.dart';
import 'package:mobile/app/features/splash/presentation/view/splash_screen.dart';
import 'package:mobile/app/features/not-found/presentation/view/not_found_page.dart';

class AppRouter {
  static const String splash = "/splash";
  static const String home = '/';
  static const String notFound = '/404';
  static const String boarding = '/boarding';
  static const String signup = '/auth/signup';
  static const String login = '/auth/login';
  static const String forgotPassword = '/auth/forgot-password';
  static const String resetPassword = '/auth/reset-password';
  static const String otp = '/auth/otp';

  static final GoRouter router = GoRouter(
    initialLocation: home,
    routes: [
      GoRoute(
        path: resetPassword,
        name: "reset-password",
        builder: (context, state) {
          return const ResetPasswordScreen();
        },
      ),
      GoRoute(
        path: otp,
        name: "otp",
        builder: (context, state) {
          return const SendOtpScreen();
        },
      ),
      GoRoute(
        path: forgotPassword,
        name: "forgot-password",
        builder: (context, state) {
          return const ForgotPasswordScreen();
        },
      ),
      GoRoute(
        path: login,
        name: "login",
        builder: (context, state) {
          return const LoginScreen();
        },
      ),
      GoRoute(
        name: "signup",
        path: signup,
        builder: (context, state) => const SignUpScreen(),
      ),
      GoRoute(
        name: "boarding",
        path: boarding,
        builder: (context, state) => const BoardingScreen(),
      ),
      GoRoute(
        name: "splash",
        path: splash,
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: home,
        name: "home",
        builder: (context, state) => const HomeScreen(),
      ),
    ],
    errorBuilder: (context, state) => const NotFoundPage(),
  );
}
