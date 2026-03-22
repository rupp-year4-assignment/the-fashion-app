import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/app/routes.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';
import 'package:mobile/models/cart.dart';
import 'package:mobile/providers/cart_provider.dart';
import 'package:mobile/widgets/app_button.dart';
import 'package:mobile/widgets/app_screen_header.dart';

class CartScreen extends ConsumerStatefulWidget {
  const CartScreen({super.key});

  @override
  ConsumerState<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends ConsumerState<CartScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(cartProvider.notifier).loadCart());
  }

  @override
  Widget build(BuildContext context) {
    final cartState = ref.watch(cartProvider);
    final cart = cartState.cart;

    return Scaffold(
      backgroundColor: AppColors.primary0,
      body: SafeArea(
        child: Column(
          children: [
            AppScreenHeader(
              title: 'My Cart',
              padding: const EdgeInsets.fromLTRB(24, 12, 24, 0),
              leading: const SizedBox.shrink(),
              trailing: IconButton(
                onPressed: () =>
                    Navigator.pushNamed(context, AppRoutes.notifications),
                icon: const Icon(Icons.notifications_none, size: 24),
              ),
            ),

            // Content
            Expanded(
              child: cartState.isLoading && cart.isEmpty
                  ? const Center(child: CircularProgressIndicator())
                  : cart.isEmpty
                  ? _buildEmptyCart()
                  : _buildCartContent(cart),
            ),

            // Checkout button
            if (!cart.isEmpty)
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
                child: AppButton(
                  label: 'Proceed to Checkout',
                  onPressed: () =>
                      Navigator.pushNamed(context, AppRoutes.checkout),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyCart() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(
            Icons.shopping_cart_outlined,
            size: 64,
            color: AppColors.primary200,
          ),
          const SizedBox(height: 20),
          Text(
            'Your Cart Is Empty!',
            style: AppTextStyles.b1Medium.copyWith(fontSize: 18),
          ),
          const SizedBox(height: 8),
          Text(
            'When you add products, they\'ll\nappear here.',
            textAlign: TextAlign.center,
            style: AppTextStyles.b2Regular,
          ),
        ],
      ),
    );
  }

  Widget _buildCartContent(Cart cart) {
    return SingleChildScrollView(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          // Cart items
          ...cart.items.map((item) => _CartItemCard(item: item)),
          const SizedBox(height: 24),
          // Order summary
          _SummaryRow(label: 'Sub-total', value: cart.subtotal),
          const SizedBox(height: 12),
          _SummaryRow(label: 'VAT', value: cart.vat),
          const SizedBox(height: 12),
          _SummaryRow(label: 'Shipping', value: cart.shippingFee),
          const Divider(height: 24, color: AppColors.primary100),
          _SummaryRow(label: 'Total', value: cart.total, isBold: true),
          const SizedBox(height: 24),
        ],
      ),
    );
  }
}

class _CartItemCard extends ConsumerWidget {
  const _CartItemCard({required this.item});

  final CartItem item;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.primary0,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.primary100),
      ),
      child: Row(
        children: [
          // Image
          Container(
            width: 73,
            height: 87,
            decoration: BoxDecoration(
              color: AppColors.primary100.withValues(alpha: 0.3),
              borderRadius: BorderRadius.circular(8),
            ),
            child: item.image != null
                ? ClipRRect(
                    borderRadius: BorderRadius.circular(8),
                    child: Image.network(
                      item.image!,
                      fit: BoxFit.cover,
                      errorBuilder: (_, __, ___) =>
                          const Icon(Icons.image_outlined),
                    ),
                  )
                : const Icon(Icons.image_outlined, color: AppColors.primary200),
          ),
          const SizedBox(width: 16),
          // Info
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            item.name,
                            style: AppTextStyles.b1Medium.copyWith(
                              fontSize: 14,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            'Size ${item.size}',
                            style: AppTextStyles.b2Regular.copyWith(
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ),
                    GestureDetector(
                      onTap: () => ref
                          .read(cartProvider.notifier)
                          .removeItem(item.variantId),
                      child: const Icon(
                        Icons.delete_outline,
                        size: 18,
                        color: AppColors.primary400,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '\$ ${item.price.toStringAsFixed(2)}',
                      style: AppTextStyles.b1Medium.copyWith(fontSize: 14),
                    ),
                    // Quantity control
                    Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.primary100),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          GestureDetector(
                            onTap: item.quantity > 1
                                ? () => ref
                                      .read(cartProvider.notifier)
                                      .updateQuantity(
                                        productId: item.productId,
                                        variantId: item.variantId,
                                        quantity: item.quantity - 1,
                                      )
                                : null,
                            child: Padding(
                              padding: const EdgeInsets.all(6),
                              child: Icon(
                                Icons.remove,
                                size: 14,
                                color: item.quantity > 1
                                    ? AppColors.primary900
                                    : AppColors.primary200,
                              ),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 8),
                            child: Text(
                              '${item.quantity}',
                              style: const TextStyle(
                                fontFamily: 'Poppins',
                                fontWeight: FontWeight.w500,
                                fontSize: 13,
                              ),
                            ),
                          ),
                          GestureDetector(
                            onTap: () => ref
                                .read(cartProvider.notifier)
                                .updateQuantity(
                                  productId: item.productId,
                                  variantId: item.variantId,
                                  quantity: item.quantity + 1,
                                ),
                            child: const Padding(
                              padding: EdgeInsets.all(6),
                              child: Icon(Icons.add, size: 14),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  const _SummaryRow({
    required this.label,
    required this.value,
    this.isBold = false,
  });

  final String label;
  final double value;
  final bool isBold;

  @override
  Widget build(BuildContext context) {
    final style = isBold
        ? AppTextStyles.b1Medium
        : AppTextStyles.b1Regular.copyWith(color: AppColors.primary500);
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: style),
        Text('\$ ${value.toStringAsFixed(2)}', style: style),
      ],
    );
  }
}
