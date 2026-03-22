import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/app/routes.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';
import 'package:mobile/models/order.dart';
import 'package:mobile/providers/auth_provider.dart';
import 'package:mobile/providers/order_provider.dart';
import 'package:mobile/providers/product_provider.dart';
import 'package:mobile/widgets/app_button.dart';
import 'package:mobile/widgets/app_screen_header.dart';
import 'package:url_launcher/url_launcher.dart';

class OrdersScreen extends ConsumerStatefulWidget {
  const OrdersScreen({super.key});

  @override
  ConsumerState<OrdersScreen> createState() => _OrdersScreenState();
}

class _OrdersScreenState extends ConsumerState<OrdersScreen>
    with WidgetsBindingObserver {
  int _tabIndex = 0; // 0=Ongoing, 1=Completed

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    Future.microtask(() => ref.read(ordersProvider.notifier).loadOrders());
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      ref.read(ordersProvider.notifier).loadOrders();
    }
  }

  @override
  Widget build(BuildContext context) {
    final ordersState = ref.watch(ordersProvider);
    final ongoing = ordersState.ongoing;
    final completed = ordersState.completed;

    return Scaffold(
      backgroundColor: AppColors.primary0,
      body: SafeArea(
        child: Column(
          children: [
            AppScreenHeader(
              title: 'My Orders',
              leading: IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.arrow_back, size: 24),
              ),
              trailing: IconButton(
                onPressed: () => ref.read(ordersProvider.notifier).loadOrders(),
                icon: const Icon(Icons.refresh, size: 22),
              ),
            ),

            // Toggle tabs
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
              child: Container(
                height: 44,
                decoration: BoxDecoration(
                  color: AppColors.primary100.withValues(alpha: 0.4),
                  borderRadius: BorderRadius.circular(22),
                ),
                child: Row(
                  children: [
                    _TabButton(
                      label: 'Ongoing',
                      isActive: _tabIndex == 0,
                      onTap: () => setState(() => _tabIndex = 0),
                    ),
                    _TabButton(
                      label: 'Completed',
                      isActive: _tabIndex == 1,
                      onTap: () => setState(() => _tabIndex = 1),
                    ),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Content
            Expanded(
              child: ordersState.isLoading
                  ? const Center(child: CircularProgressIndicator())
                  : _tabIndex == 0
                  ? _buildOrdersList(ongoing, isOngoing: true)
                  : _buildOrdersList(completed, isOngoing: false),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOrdersList(List<Order> orders, {required bool isOngoing}) {
    if (orders.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.inventory_2_outlined,
              size: 64,
              color: AppColors.primary200,
            ),
            const SizedBox(height: 20),
            Text(
              isOngoing ? 'No Ongoing Orders!' : 'No Completed Orders!',
              style: AppTextStyles.b1Medium.copyWith(fontSize: 18),
            ),
          ],
        ),
      );
    }

    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      itemCount: orders.length,
      separatorBuilder: (context, index) => const SizedBox(height: 12),
      itemBuilder: (context, i) =>
          _OrderCard(order: orders[i], isOngoing: isOngoing),
    );
  }
}

class _TabButton extends StatelessWidget {
  const _TabButton({
    required this.label,
    required this.isActive,
    required this.onTap,
  });

  final String label;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          alignment: Alignment.center,
          decoration: BoxDecoration(
            color: isActive ? AppColors.primary900 : Colors.transparent,
            borderRadius: BorderRadius.circular(22),
          ),
          child: Text(
            label,
            style: AppTextStyles.b1Medium.copyWith(
              color: isActive ? AppColors.primary0 : AppColors.primary500,
              fontSize: 14,
            ),
          ),
        ),
      ),
    );
  }
}

class _OrderCard extends ConsumerWidget {
  const _OrderCard({required this.order, required this.isOngoing});

  final Order order;
  final bool isOngoing;

  bool get _requiresPayment => !order.paymentStatus.isPaid;
  bool get _canReview => order.status == OrderStatus.delivered;
  bool get _allItemsReviewed =>
      order.items.isNotEmpty && order.items.every((item) => item.hasReview);

  Future<void> _continueStripePayment(
    BuildContext context,
    WidgetRef ref,
  ) async {
    final auth = ref.read(authStateProvider);
    final token = auth.accessToken;
    if (token == null) {
      _showMessage(context, 'Please login first.');
      return;
    }

    final api = ref.read(apiServiceProvider);
    final result = await api.createStripeCheckoutSession(
      accessToken: token,
      refreshToken: auth.refreshToken,
      orderId: order.id,
    );

    if (!context.mounted) return;

    if (!result.isSuccess || result.data == null) {
      _showMessage(
        context,
        result.message ?? 'Failed to open Stripe checkout.',
      );
      return;
    }

    final checkoutUrl = result.data!['checkoutUrl']?.toString() ?? '';
    final uri = Uri.tryParse(checkoutUrl);

    if (uri == null) {
      _showMessage(context, 'Invalid Stripe checkout URL.');
      return;
    }

    final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);

    if (!context.mounted) return;

    if (!launched) {
      _showMessage(context, 'Unable to open Stripe checkout.');
      return;
    }

    _showMessage(
      context,
      'Stripe Checkout opened. Complete payment in your browser and return to the app.',
    );
  }

  void _showMessage(BuildContext context, String message) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  Future<void> _openReviewFlow(BuildContext context, WidgetRef ref) async {
    if (!_canReview) {
      _showMessage(
        context,
        'Reviews are available only after the order is delivered.',
      );
      return;
    }

    if (order.items.isEmpty) {
      _showMessage(context, 'No product found in this order.');
      return;
    }

    if (order.items.length == 1) {
      await _showReviewEditorSheet(context, ref, order.items.first);
      return;
    }

    if (!context.mounted) return;

    await showModalBottomSheet<void>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(24, 24, 24, 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'Select Item To Review',
                    style: AppTextStyles.b1Medium.copyWith(fontSize: 18),
                  ),
                  IconButton(
                    onPressed: () => Navigator.pop(ctx),
                    icon: const Icon(Icons.close),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              ...order.items.map(
                (item) => Container(
                  margin: const EdgeInsets.only(top: 12),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.primary100),
                  ),
                  child: Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              item.productName,
                              style: AppTextStyles.b1Medium.copyWith(
                                fontSize: 14,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              '${item.color} • ${item.size}',
                              style: AppTextStyles.b2Regular.copyWith(
                                color: AppColors.primary500,
                              ),
                            ),
                            if (item.hasReview) ...[
                              const SizedBox(height: 4),
                              Text(
                                'Current rating: ${item.reviewRating ?? 0}/5',
                                style: AppTextStyles.b2Regular.copyWith(
                                  color: AppColors.success,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(width: 12),
                      OutlinedButton(
                        onPressed: () {
                          Navigator.pop(ctx);
                          if (!context.mounted) return;
                          unawaited(
                            _showReviewEditorSheet(context, ref, item),
                          );
                        },
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppColors.primary900),
                        ),
                        child: Text(item.hasReview ? 'Edit' : 'Review'),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Future<void> _showReviewEditorSheet(
    BuildContext context,
    WidgetRef ref,
    OrderItem item,
  ) async {
    final commentController = TextEditingController(
      text: item.reviewComment ?? '',
    );
    int selectedRating = item.reviewRating ?? 0;
    bool isSubmitting = false;

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheetState) => Padding(
          padding: EdgeInsets.only(
            left: 24,
            right: 24,
            top: 24,
            bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
          ),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    item.hasReview ? 'Edit Review' : 'Leave a Review',
                    style: AppTextStyles.b1Medium.copyWith(fontSize: 18),
                  ),
                  GestureDetector(
                    onTap: () => Navigator.pop(ctx),
                    child: const Icon(Icons.close),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                item.productName,
                style: AppTextStyles.b1Medium.copyWith(fontSize: 14),
              ),
              const SizedBox(height: 4),
              Text(
                '${item.color} • ${item.size}',
                style: AppTextStyles.b2Regular.copyWith(
                  color: AppColors.primary500,
                ),
              ),
              const SizedBox(height: 16),
              Text(
                'How was this product?',
                style: AppTextStyles.b2Regular.copyWith(
                  color: AppColors.primary500,
                ),
              ),
              const SizedBox(height: 12),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  5,
                  (i) => GestureDetector(
                    onTap: () => setSheetState(() => selectedRating = i + 1),
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 4),
                      child: Icon(
                        i < selectedRating ? Icons.star : Icons.star_border,
                        color: Colors.amber,
                        size: 36,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: commentController,
                maxLines: 4,
                decoration: InputDecoration(
                  hintText: 'Write your review...',
                  hintStyle: AppTextStyles.b2Regular.copyWith(
                    color: AppColors.primary400,
                  ),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.primary100),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.primary100),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              AppButton(
                label: isSubmitting ? 'Saving...' : 'Submit Review',
                isLoading: isSubmitting,
                onPressed: selectedRating > 0 && !isSubmitting
                    ? () async {
                        final auth = ref.read(authStateProvider);
                        final token = auth.accessToken;
                        if (token == null) {
                          _showMessage(context, 'Please login first.');
                          return;
                        }

                        final comment = commentController.text.trim();
                        if (comment.length < 3) {
                          _showMessage(
                            context,
                            'Please write a short review comment.',
                          );
                          return;
                        }

                        setSheetState(() => isSubmitting = true);

                        final api = ref.read(apiServiceProvider);
                        final result = await api.submitProductReview(
                          accessToken: token,
                          refreshToken: auth.refreshToken,
                          productId: item.productId,
                          body: {
                            'orderId': order.id,
                            'rating': selectedRating,
                            'comment': comment,
                          },
                        );

                        if (!context.mounted) return;

                        if (!result.isSuccess) {
                          setSheetState(() => isSubmitting = false);
                          _showMessage(
                            context,
                            result.message ?? 'Failed to submit review.',
                          );
                          return;
                        }

                        Navigator.pop(ctx);
                        await ref.read(ordersProvider.notifier).loadOrders();
                        ref.invalidate(productDetailProvider(item.productId));

                        if (!context.mounted) return;

                        _showMessage(context, 'Review saved successfully.');
                      }
                    : null,
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final firstItem = order.items.isNotEmpty ? order.items.first : null;

    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.primary100),
      ),
      child: Column(
        children: [
          Row(
            children: [
              // Image
              Container(
                width: 65,
                height: 87,
                decoration: BoxDecoration(
                  color: AppColors.primary100.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: firstItem?.image != null
                    ? ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.network(
                          firstItem!.image!,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) =>
                              const Icon(Icons.image_outlined),
                        ),
                      )
                    : const Icon(
                        Icons.image_outlined,
                        color: AppColors.primary200,
                      ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      firstItem?.productName ?? 'Order',
                      style: AppTextStyles.b1Medium.copyWith(fontSize: 14),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    if (firstItem != null)
                      Text(
                        'Size ${firstItem.size}',
                        style: AppTextStyles.b2Regular.copyWith(fontSize: 13),
                      ),
                    const SizedBox(height: 4),
                    // Status badge
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 10,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: _statusColor.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        order.status.label,
                        style: TextStyle(
                          fontFamily: 'Poppins',
                          fontSize: 12,
                          fontWeight: FontWeight.w500,
                          color: _statusColor,
                        ),
                      ),
                    ),
                    if (_requiresPayment) ...[
                      const SizedBox(height: 6),
                      Text(
                        order.paymentStatus.label,
                        style: AppTextStyles.b2Regular.copyWith(
                          fontSize: 12,
                          color: AppColors.error,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Text(
                    '\$ ${order.totalAmount.toStringAsFixed(2)}',
                    style: AppTextStyles.b1Medium.copyWith(fontSize: 14),
                  ),
                ],
              ),
            ],
          ),
          const SizedBox(height: 12),
          // Action button
          if (isOngoing)
            SizedBox(
              width: double.infinity,
              child: OutlinedButton(
                onPressed: () => _requiresPayment
                    ? _continueStripePayment(context, ref)
                    : Navigator.pushNamed(
                        context,
                        AppRoutes.trackOrder,
                        arguments: order,
                      ),
                style: OutlinedButton.styleFrom(
                  side: const BorderSide(color: AppColors.primary900),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 10),
                ),
                child: Text(
                  _requiresPayment ? 'Complete Payment' : 'Track Order',
                  style: AppTextStyles.b2Regular.copyWith(
                    color: AppColors.primary900,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            )
          else
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: _canReview
                    ? () => _openReviewFlow(context, ref)
                    : null,
                icon: Icon(
                  _canReview ? Icons.star : Icons.block,
                  size: 16,
                  color: _canReview ? Colors.amber : AppColors.primary400,
                ),
                label: Text(
                  _canReview
                      ? (_allItemsReviewed ? 'Edit Review' : 'Leave a Review')
                      : 'Review Unavailable',
                  style: AppTextStyles.b2Regular.copyWith(
                    color: _canReview
                        ? AppColors.primary900
                        : AppColors.primary400,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                style: OutlinedButton.styleFrom(
                  side: BorderSide(
                    color: _canReview
                        ? AppColors.primary900
                        : AppColors.primary200,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(10),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 10),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Color get _statusColor {
    switch (order.status) {
      case OrderStatus.delivered:
        return AppColors.success;
      case OrderStatus.cancelled:
        return AppColors.error;
      default:
        return Colors.amber.shade700;
    }
  }

}
