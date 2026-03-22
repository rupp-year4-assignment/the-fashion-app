import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/app/routes.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';
import 'package:mobile/providers/auth_provider.dart';
import 'package:mobile/providers/cart_provider.dart';
import 'package:mobile/providers/order_provider.dart';
import 'package:mobile/widgets/app_button.dart';
import 'package:mobile/widgets/app_screen_header.dart';

class PaymentReturnScreen extends ConsumerStatefulWidget {
  const PaymentReturnScreen({super.key, required this.uri});

  final Uri uri;

  @override
  ConsumerState<PaymentReturnScreen> createState() => _PaymentReturnScreenState();
}

class _PaymentReturnScreenState extends ConsumerState<PaymentReturnScreen> {
  bool _hasStartedSync = false;
  bool _isSyncing = false;
  bool _isPaid = false;
  String _title = 'Checking Payment';
  String _message = 'We are confirming your Stripe payment.';

  String get _orderId => widget.uri.queryParameters['orderId']?.trim() ?? '';
  bool get _isCancelRoute {
    final path = widget.uri.path.toLowerCase();
    return path.endsWith('/cancel') || path == '/cancel';
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);

    if (!_hasStartedSync &&
        !authState.isBootstrapping &&
        authState.isAuthenticated) {
      _hasStartedSync = true;
      unawaited(_handlePaymentReturn());
    }

    final icon = _isPaid
        ? Icons.check_circle
        : _isCancelRoute
        ? Icons.cancel_outlined
        : Icons.hourglass_top_rounded;
    final iconColor = _isPaid
        ? AppColors.success
        : _isCancelRoute
        ? AppColors.error
        : AppColors.primary900;

    return Scaffold(
      backgroundColor: AppColors.primary0,
      body: SafeArea(
        child: Column(
          children: [
            const AppScreenHeader(title: 'Payment Status'),
            Expanded(
              child: Center(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: Column(
                    children: [
                      Container(
                        width: 88,
                        height: 88,
                        decoration: BoxDecoration(
                          color: iconColor.withValues(alpha: 0.12),
                          shape: BoxShape.circle,
                        ),
                        child: Icon(icon, color: iconColor, size: 50),
                      ),
                      const SizedBox(height: 24),
                      Text(
                        _title,
                        style: AppTextStyles.h2SemiBold.copyWith(fontSize: 24),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 10),
                      Text(
                        _message,
                        style: AppTextStyles.b2Regular.copyWith(
                          color: AppColors.primary500,
                        ),
                        textAlign: TextAlign.center,
                      ),
                      const SizedBox(height: 28),
                      if (_isSyncing)
                        const CircularProgressIndicator(strokeWidth: 2)
                      else ...[
                        AppButton(
                          label: _isPaid ? 'View My Orders' : 'Go To Orders',
                          onPressed: () => Navigator.pushNamedAndRemoveUntil(
                            context,
                            AppRoutes.orders,
                            (route) => route.settings.name == AppRoutes.home,
                          ),
                        ),
                        if (!_isPaid && !_isCancelRoute) ...[
                          const SizedBox(height: 12),
                          AppButton(
                            label: 'Check Again',
                            backgroundColor: AppColors.primary0,
                            foregroundColor: AppColors.primary900,
                            borderSide: const BorderSide(
                              color: AppColors.primary900,
                            ),
                            onPressed: _handlePaymentReturn,
                          ),
                        ],
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handlePaymentReturn() async {
    if (_isSyncing || !mounted) return;

    if (_isCancelRoute) {
      setState(() {
        _title = 'Payment Cancelled';
        _message =
            'No charge was completed. You can reopen the order from My Orders and try payment again.';
      });
      return;
    }

    final authState = ref.read(authStateProvider);
    final token = authState.accessToken;

    if (token == null || _orderId.isEmpty) {
      setState(() {
        _title = 'Payment Return Received';
        _message =
            'The app reopened, but the order reference is missing. Open My Orders to verify payment status.';
      });
      return;
    }

    setState(() {
      _isSyncing = true;
      _title = 'Checking Payment';
      _message = 'Waiting for Stripe webhook confirmation.';
    });

    final api = ref.read(apiServiceProvider);

    for (var attempt = 0; attempt < 5; attempt++) {
      final result = await api.getOrderById(
        accessToken: token,
        refreshToken: authState.refreshToken,
        orderId: _orderId,
      );

      if (!mounted) return;

      if (result.isSuccess && result.data != null) {
        final rawOrder = result.data!['data'];
        if (rawOrder is Map<String, dynamic>) {
          final paymentStatus =
              rawOrder['paymentStatus']?.toString().toLowerCase() ?? 'pending';

          if (paymentStatus == 'completed') {
            await ref.read(cartProvider.notifier).clearCart();
            await ref.read(ordersProvider.notifier).loadOrders();

            if (!mounted) return;

            setState(() {
              _isSyncing = false;
              _isPaid = true;
              _title = 'Payment Confirmed';
              _message =
                  'Your Stripe payment was confirmed and the order is now marked as paid.';
            });
            return;
          }

          if (paymentStatus == 'failed') {
            setState(() {
              _isSyncing = false;
              _title = 'Payment Failed';
              _message =
                  'Stripe did not confirm the payment. Open My Orders and try payment again.';
            });
            return;
          }
        }
      }

      if (attempt < 4) {
        await Future<void>.delayed(const Duration(seconds: 2));
      }
    }

    if (!mounted) return;

    setState(() {
      _isSyncing = false;
      _title = 'Payment Processing';
      _message =
          'The app returned successfully, but Stripe webhook confirmation is still pending. Check again or open My Orders.';
    });
  }
}
