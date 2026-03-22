import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/app/routes.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';
import 'package:mobile/providers/address_provider.dart';
import 'package:mobile/providers/auth_provider.dart';
import 'package:mobile/providers/cart_provider.dart';
import 'package:mobile/providers/order_provider.dart';
import 'package:mobile/widgets/app_button.dart';
import 'package:mobile/widgets/app_screen_header.dart';
import 'package:url_launcher/url_launcher.dart';

class CheckoutScreen extends ConsumerStatefulWidget {
  const CheckoutScreen({super.key});

  @override
  ConsumerState<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends ConsumerState<CheckoutScreen>
    with WidgetsBindingObserver {
  bool _isPlacingOrder = false;
  bool _isCheckingStripeStatus = false;
  String? _pendingStripeOrderId;
  String? _pendingStripeCheckoutUrl;

  bool get _isAwaitingStripeConfirmation =>
      _pendingStripeOrderId != null && _pendingStripeOrderId!.isNotEmpty;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    Future.microtask(() async {
      await ref.read(addressBookProvider.notifier).loadAddresses();
    });
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed && _isAwaitingStripeConfirmation) {
      unawaited(_syncStripeOrderStatus(showPendingMessage: false));
    }
  }

  Future<void> _openStripeCheckout(String checkoutUrl) async {
    final uri = Uri.tryParse(checkoutUrl);
    if (uri == null) {
      _showMessage('Invalid Stripe checkout URL.');
      return;
    }

    final launched = await launchUrl(
      uri,
      mode: LaunchMode.externalApplication,
    );

    if (!mounted) return;

    if (!launched) {
      _showMessage('Unable to open Stripe Checkout.');
      return;
    }

    _showMessage(
      'Stripe Checkout opened. Complete payment in your browser, then return to the app.',
    );
  }

  Future<void> _startStripeCheckout({
    required String token,
    required String? refreshToken,
    required String orderId,
  }) async {
    final api = ref.read(apiServiceProvider);
    final result = await api.createStripeCheckoutSession(
      accessToken: token,
      refreshToken: refreshToken,
      orderId: orderId,
    );

    if (!mounted) return;

    if (!result.isSuccess || result.data == null) {
      setState(() => _isPlacingOrder = false);
      _showMessage(result.message ?? 'Failed to start Stripe checkout.');
      return;
    }

    final checkoutUrl = result.data!['checkoutUrl']?.toString() ?? '';
    if (checkoutUrl.isEmpty) {
      setState(() => _isPlacingOrder = false);
      _showMessage('Stripe checkout URL is missing.');
      return;
    }

    setState(() {
      _isPlacingOrder = false;
      _pendingStripeOrderId = orderId;
      _pendingStripeCheckoutUrl = checkoutUrl;
    });

    await _openStripeCheckout(checkoutUrl);
  }

  Future<void> _syncStripeOrderStatus({
    bool showPendingMessage = true,
  }) async {
    if (_isCheckingStripeStatus) return;

    final orderId = _pendingStripeOrderId;
    final auth = ref.read(authStateProvider);
    final token = auth.accessToken;
    final refreshToken = auth.refreshToken;

    if (orderId == null || orderId.isEmpty || token == null) {
      return;
    }

    setState(() => _isCheckingStripeStatus = true);

    try {
      final api = ref.read(apiServiceProvider);

      for (var attempt = 0; attempt < 4; attempt++) {
        final result = await api.getOrderById(
          accessToken: token,
          refreshToken: refreshToken,
          orderId: orderId,
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
                _isCheckingStripeStatus = false;
                _pendingStripeOrderId = null;
                _pendingStripeCheckoutUrl = null;
              });

              _showSuccessDialog();
              return;
            }

            if (paymentStatus == 'failed') {
              setState(() {
                _isCheckingStripeStatus = false;
                _pendingStripeOrderId = null;
                _pendingStripeCheckoutUrl = null;
              });
              _showMessage('Stripe payment failed. Please try again.');
              return;
            }
          }
        }

        if (attempt < 3) {
          await Future<void>.delayed(const Duration(seconds: 2));
        }
      }

      if (!mounted) return;
      setState(() => _isCheckingStripeStatus = false);
      if (showPendingMessage) {
        _showMessage(
          'Payment is still pending. Stripe confirms it by webhook, so check again in a moment.',
        );
      }
    } catch (_) {
      if (!mounted) return;
      setState(() => _isCheckingStripeStatus = false);
      _showMessage('Unable to refresh Stripe payment status right now.');
    }
  }

  Future<void> _reopenStripeCheckout() async {
    final checkoutUrl = _pendingStripeCheckoutUrl;
    if (checkoutUrl == null || checkoutUrl.isEmpty) {
      _showMessage('Stripe checkout session is no longer available.');
      return;
    }

    await _openStripeCheckout(checkoutUrl);
  }

  Future<void> _placeOrder() async {
    final auth = ref.read(authStateProvider);
    final token = auth.accessToken;
    final refreshToken = auth.refreshToken;
    final userId = auth.userId;
    final cart = ref.read(cartProvider).cart;
    final selectedAddress = ref.read(addressBookProvider).defaultAddress;

    if (cart.isEmpty || token == null || userId == null) {
      _showMessage('Please login and add items before checkout.');
      return;
    }

    if (selectedAddress == null) {
      _showMessage('Please add/select a delivery address first.');
      return;
    }

    setState(() => _isPlacingOrder = true);

    final api = ref.read(apiServiceProvider);
    final items = cart.items.map((item) => item.toJson()).toList();
    final delivery = {
      'courier': 'Standard',
      'address': {
        'street': selectedAddress.street,
        'city': selectedAddress.city,
        'state': selectedAddress.state,
        'postalCode': selectedAddress.postalCode,
        'country': selectedAddress.country,
        'location': {
          'type': 'Point',
          'coordinates': [selectedAddress.longitude, selectedAddress.latitude],
        },
      },
    };

    final orderResult = await api.createOrder(
      accessToken: token,
      refreshToken: refreshToken,
      body: {'userId': userId, 'item': items, 'delivery': delivery},
    );

    if (!mounted) return;

    if (!orderResult.isSuccess || orderResult.data == null) {
      setState(() => _isPlacingOrder = false);
      _showMessage(orderResult.message ?? 'Failed to create order.');
      return;
    }

    final orderData = orderResult.data!['data'];
    final orderId = orderData is Map<String, dynamic>
        ? (orderData['_id']?.toString() ?? orderData['id']?.toString() ?? '')
        : '';

    if (orderId.isEmpty) {
      setState(() => _isPlacingOrder = false);
      _showMessage('Order created but order id is missing.');
      return;
    }

    await ref.read(cartProvider.notifier).loadCart();

    await _startStripeCheckout(
      token: token,
      refreshToken: refreshToken,
      orderId: orderId,
    );
  }

  void _showMessage(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _showSuccessDialog() async {
    await showDialog<void>(
      context: context,
      barrierDismissible: false,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 78,
                height: 78,
                decoration: BoxDecoration(
                  color: AppColors.success.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.check_circle,
                  color: AppColors.success,
                  size: 48,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Payment Confirmed',
                style: AppTextStyles.h2SemiBold.copyWith(fontSize: 22),
              ),
              const SizedBox(height: 8),
              Text(
                'Your order has been placed and paid through Stripe.',
                style: AppTextStyles.b2Regular.copyWith(
                  color: AppColors.primary500,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 24),
              AppButton(
                label: 'Track My Order',
                onPressed: () {
                  Navigator.pop(ctx);
                  Navigator.pushReplacementNamed(context, AppRoutes.orders);
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cart = ref.watch(cartProvider).cart;
    final addressState = ref.watch(addressBookProvider);
    final selectedAddress = addressState.defaultAddress;

    return Scaffold(
      backgroundColor: AppColors.primary0,
      body: SafeArea(
        child: Column(
          children: [
            AppScreenHeader(
              title: 'Checkout',
              leading: IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.arrow_back, size: 24),
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const SizedBox(height: 16),
                    Text(
                      'Delivery Address',
                      style: AppTextStyles.b1Medium.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 12),
                    if (addressState.isLoading && selectedAddress == null)
                      const Padding(
                        padding: EdgeInsets.symmetric(vertical: 12),
                        child: Center(
                          child: CircularProgressIndicator(strokeWidth: 2),
                        ),
                      )
                    else if (selectedAddress == null)
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.primary100),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'No address selected.',
                              style: AppTextStyles.b2Regular,
                            ),
                            const SizedBox(height: 8),
                            TextButton(
                              onPressed: () async {
                                await Navigator.pushNamed(
                                  context,
                                  AppRoutes.address,
                                );
                                if (!mounted) return;
                                await ref
                                    .read(addressBookProvider.notifier)
                                    .loadAddresses();
                              },
                              child: const Text('Add Address'),
                            ),
                          ],
                        ),
                      )
                    else
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.primary100),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.location_on_outlined,
                              size: 24,
                              color: AppColors.primary500,
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    selectedAddress.label,
                                    style: AppTextStyles.b1Medium.copyWith(
                                      fontSize: 14,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    selectedAddress.fullAddress,
                                    style: AppTextStyles.b2Regular,
                                  ),
                                ],
                              ),
                            ),
                            TextButton(
                              onPressed: () async {
                                await Navigator.pushNamed(
                                  context,
                                  AppRoutes.address,
                                );
                                if (!mounted) return;
                                await ref
                                    .read(addressBookProvider.notifier)
                                    .loadAddresses();
                              },
                              child: const Text('Change'),
                            ),
                          ],
                        ),
                      ),
                    const SizedBox(height: 24),
                    Text(
                      'Payment',
                      style: AppTextStyles.b1Medium.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: AppColors.primary900),
                        color: AppColors.primary100.withValues(alpha: 0.18),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Container(
                                width: 36,
                                height: 36,
                                decoration: BoxDecoration(
                                  color: AppColors.primary900,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: const Icon(
                                  Icons.open_in_browser,
                                  color: AppColors.primary0,
                                  size: 20,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      'Stripe Checkout',
                                      style: AppTextStyles.b1Medium,
                                    ),
                                    Text(
                                      'Stripe is the only payment method for checkout. Payment is confirmed by webhook after you return from the browser.',
                                      style: AppTextStyles.b2Regular.copyWith(
                                        color: AppColors.primary500,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                          if (_isAwaitingStripeConfirmation) ...[
                            const SizedBox(height: 14),
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(14),
                              decoration: BoxDecoration(
                                borderRadius: BorderRadius.circular(12),
                                color: AppColors.primary0,
                                border: Border.all(
                                  color: AppColors.primary100,
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Stripe session ready',
                                    style: AppTextStyles.b1Medium.copyWith(
                                      fontSize: 14,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  Text(
                                    'If payment already finished in your browser, refresh the order status here.',
                                    style: AppTextStyles.b2Regular.copyWith(
                                      color: AppColors.primary500,
                                    ),
                                  ),
                                  const SizedBox(height: 10),
                                  Row(
                                    children: [
                                      Expanded(
                                        child: OutlinedButton(
                                          onPressed: _reopenStripeCheckout,
                                          style: OutlinedButton.styleFrom(
                                            side: const BorderSide(
                                              color: AppColors.primary900,
                                            ),
                                          ),
                                          child: const Text('Open Checkout'),
                                        ),
                                      ),
                                      const SizedBox(width: 10),
                                      Expanded(
                                        child: AppButton(
                                          label: 'Check Status',
                                          height: 44,
                                          isLoading: _isCheckingStripeStatus,
                                          onPressed: _isCheckingStripeStatus
                                              ? null
                                              : () => _syncStripeOrderStatus(),
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ],
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      'Order Summary',
                      style: AppTextStyles.b1Medium.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: 12),
                    _OrderSummaryRow(label: 'Sub-total', value: cart.subtotal),
                    const SizedBox(height: 8),
                    _OrderSummaryRow(label: 'VAT', value: cart.vat),
                    const SizedBox(height: 8),
                    _OrderSummaryRow(
                      label: 'Shipping',
                      value: cart.shippingFee,
                    ),
                    const Divider(height: 24, color: AppColors.primary100),
                    _OrderSummaryRow(
                      label: 'Total',
                      value: cart.total,
                      isBold: true,
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
              child: AppButton(
                label: _isAwaitingStripeConfirmation
                    ? 'I Completed Payment'
                    : 'Continue to Stripe',
                isLoading: _isPlacingOrder || _isCheckingStripeStatus,
                onPressed: _isAwaitingStripeConfirmation
                    ? () => _syncStripeOrderStatus()
                    : _placeOrder,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _OrderSummaryRow extends StatelessWidget {
  const _OrderSummaryRow({
    required this.label,
    required this.value,
    this.isBold = false,
  });

  final String label;
  final double value;
  final bool isBold;

  @override
  Widget build(BuildContext context) {
    final textStyle = isBold
        ? AppTextStyles.b1Medium.copyWith(fontWeight: FontWeight.w700)
        : AppTextStyles.b2Regular;

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: textStyle),
        Text(
          '\$${value.toStringAsFixed(2)}',
          style: textStyle,
        ),
      ],
    );
  }
}
