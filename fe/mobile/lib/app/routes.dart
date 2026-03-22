import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/features/account/screens/account_screen.dart';
import 'package:mobile/features/account/screens/address_screen.dart';
import 'package:mobile/features/account/screens/customer_service_screen.dart';
import 'package:mobile/features/account/screens/faqs_screen.dart';
import 'package:mobile/features/account/screens/help_center_screen.dart';
import 'package:mobile/features/account/screens/my_details_screen.dart';
import 'package:mobile/features/account/screens/notifications_settings_screen.dart';
import 'package:mobile/features/account/screens/payment_methods_screen.dart';
import 'package:mobile/features/auth/screens/forgot_password_screen.dart';
import 'package:mobile/features/auth/screens/login_screen.dart';
import 'package:mobile/features/auth/screens/onboarding_screen.dart';
import 'package:mobile/features/auth/screens/register_screen.dart';
import 'package:mobile/features/auth/screens/reset_password_screen.dart';
import 'package:mobile/features/auth/screens/splash_screen.dart';
import 'package:mobile/features/auth/screens/verification_screen.dart';
import 'package:mobile/features/cart/screens/cart_screen.dart';
import 'package:mobile/features/cart/screens/checkout_screen.dart';
import 'package:mobile/features/cart/screens/payment_return_screen.dart';
import 'package:mobile/features/main_shell.dart';
import 'package:mobile/features/orders/screens/orders_screen.dart';
import 'package:mobile/features/orders/screens/track_order_screen.dart';
import 'package:mobile/features/product/screens/product_detail_screen.dart';
import 'package:mobile/features/saved/screens/saved_items_screen.dart';
import 'package:mobile/features/search/screens/search_screen.dart';
import 'package:mobile/models/order.dart';
import 'package:mobile/models/verification_flow.dart';
import 'package:mobile/providers/auth_provider.dart';

class AppRoutes {
  const AppRoutes._();

  static const String splash = '/';
  static const String onboarding = '/onboarding';
  static const String login = '/login';
  static const String register = '/register';
  static const String forgotPassword = '/forgot-password';
  static const String verification = '/verification';
  static const String resetPassword = '/reset-password';
  static const String home = '/home';
  static const String search = '/search';
  static const String productDetail = '/product-detail';
  static const String cart = '/cart';
  static const String checkout = '/checkout';
  static const String orders = '/orders';
  static const String trackOrder = '/track-order';
  static const String account = '/account';
  static const String savedItems = '/saved-items';
  static const String myDetails = '/my-details';
  static const String address = '/address';
  static const String notificationsSettings = '/notifications-settings';
  static const String paymentMethods = '/payment-methods';
  static const String notifications = '/notifications';
  static const String faqs = '/faqs';
  static const String helpCenter = '/help-center';
  static const String customerService = '/customer-service';

  static const String initialRoute = splash;

  static Route<dynamic> generateRoute(RouteSettings settings) {
    final deepLinkRoute = _buildPaymentReturnRoute(settings);
    if (deepLinkRoute != null) {
      return deepLinkRoute;
    }

    switch (settings.name) {
      case splash:
        return _buildRoute(const SplashScreen(), settings);
      case onboarding:
        return _buildRoute(
          const GuestGuard(child: OnboardingScreen()),
          settings,
        );
      case login:
        return _buildRoute(const GuestGuard(child: LoginScreen()), settings);
      case register:
        return _buildRoute(const GuestGuard(child: RegisterScreen()), settings);
      case forgotPassword:
        return _buildRoute(
          const GuestGuard(child: ForgotPasswordScreen()),
          settings,
        );
      case verification:
        final VerificationArgs? args = _verificationArgsFromArgs(
          settings.arguments,
        );
        return _buildRoute(
          GuestGuard(child: VerificationScreen(args: args)),
          settings,
        );
      case resetPassword:
        return _buildRoute(
          const GuestGuard(child: ResetPasswordScreen()),
          settings,
        );
      case home:
        return _buildRoute(const AuthGuard(child: MainShell()), settings);
      case search:
        return _buildRoute(const AuthGuard(child: SearchScreen()), settings);
      case productDetail:
        final productId = settings.arguments as String? ?? '';
        return _buildRoute(
          AuthGuard(child: ProductDetailScreen(productId: productId)),
          settings,
        );
      case cart:
        return _buildRoute(const AuthGuard(child: CartScreen()), settings);
      case checkout:
        return _buildRoute(const AuthGuard(child: CheckoutScreen()), settings);
      case orders:
        return _buildRoute(const AuthGuard(child: OrdersScreen()), settings);
      case trackOrder:
        final order = settings.arguments as Order?;
        if (order != null) {
          return _buildRoute(
            AuthGuard(child: TrackOrderScreen(order: order)),
            settings,
          );
        }
        return _buildRoute(
          const Scaffold(body: Center(child: Text('Order not found'))),
          settings,
        );
      case account:
        return _buildRoute(const AuthGuard(child: AccountScreen()), settings);
      case savedItems:
        return _buildRoute(
          const AuthGuard(child: SavedItemsScreen()),
          settings,
        );
      case myDetails:
        return _buildRoute(const AuthGuard(child: MyDetailsScreen()), settings);
      case address:
        return _buildRoute(const AuthGuard(child: AddressScreen()), settings);
      case notificationsSettings:
        return _buildRoute(
          const AuthGuard(child: NotificationsSettingsScreen()),
          settings,
        );
      case paymentMethods:
        return _buildRoute(
          const AuthGuard(child: PaymentMethodsScreen()),
          settings,
        );
      case notifications:
        // Placeholder notifications screen
        return _buildRoute(
          const AuthGuard(child: _NotificationsPlaceholder()),
          settings,
        );
      case faqs:
        return _buildRoute(const AuthGuard(child: FAQsScreen()), settings);
      case helpCenter:
        return _buildRoute(
          const AuthGuard(child: HelpCenterScreen()),
          settings,
        );
      case customerService:
        return _buildRoute(
          const AuthGuard(child: CustomerServiceScreen()),
          settings,
        );
      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(child: Text('No route defined for ${settings.name}')),
          ),
          settings: settings,
        );
    }
  }

  static MaterialPageRoute<dynamic> _buildRoute(
    Widget child,
    RouteSettings settings,
  ) {
    return MaterialPageRoute(builder: (_) => child, settings: settings);
  }

  static MaterialPageRoute<dynamic>? _buildPaymentReturnRoute(
    RouteSettings settings,
  ) {
    final name = settings.name;
    if (name == null || name.isEmpty) {
      return null;
    }

    Uri? uri;
    try {
      uri = Uri.parse(name);
    } catch (_) {
      return null;
    }

    final path = uri.path.toLowerCase();
    final isPaymentReturn =
        path == '/success' ||
        path == '/cancel' ||
        path == '/payment/success' ||
        path == '/payment/cancel' ||
        (uri.scheme == 'fashionapp' &&
            (path.endsWith('/success') || path.endsWith('/cancel')));

    if (!isPaymentReturn) {
      return null;
    }

    return _buildRoute(
      AuthGuard(child: PaymentReturnScreen(uri: uri)),
      settings,
    );
  }

  static VerificationArgs? _verificationArgsFromArgs(Object? arguments) {
    if (arguments is VerificationArgs) {
      return arguments;
    }

    if (arguments is Map<String, dynamic>) {
      final value = arguments['email'];
      if (value == null) {
        return null;
      }

      return VerificationArgs(
        email: value.toString(),
        purpose: VerificationPurpose.passwordReset,
      );
    }

    return null;
  }
}

class AuthGuard extends ConsumerWidget {
  const AuthGuard({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);

    if (authState.isBootstrapping) {
      return const _GuardLoading();
    }

    if (!authState.isAuthenticated) {
      _redirect(context, AppRoutes.onboarding);
      return const _GuardLoading();
    }

    return child;
  }
}

class GuestGuard extends ConsumerWidget {
  const GuestGuard({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authStateProvider);

    if (authState.isBootstrapping) {
      return const _GuardLoading();
    }

    if (authState.isAuthenticated) {
      _redirect(context, AppRoutes.home);
      return const _GuardLoading();
    }

    return child;
  }
}

class _GuardLoading extends StatelessWidget {
  const _GuardLoading();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      backgroundColor: AppColors.primary0,
      body: Center(
        child: CircularProgressIndicator(color: AppColors.primary900),
      ),
    );
  }
}

void _redirect(BuildContext context, String route) {
  WidgetsBinding.instance.addPostFrameCallback((_) {
    if (!context.mounted) {
      return;
    }

    Navigator.of(context).pushNamedAndRemoveUntil(route, (_) => false);
  });
}

class _NotificationsPlaceholder extends StatelessWidget {
  const _NotificationsPlaceholder();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary0,
      body: SafeArea(
        child: Column(
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(8, 12, 24, 0),
              child: Row(
                children: [
                  IconButton(
                    onPressed: () => Navigator.pop(context),
                    icon: const Icon(Icons.arrow_back, size: 24),
                  ),
                  const Expanded(
                    child: Center(
                      child: Text(
                        'Notifications',
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 20,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 48),
                ],
              ),
            ),
            const Divider(color: AppColors.primary100),
            const Expanded(child: Center(child: Text('No notifications yet'))),
          ],
        ),
      ),
    );
  }
}
