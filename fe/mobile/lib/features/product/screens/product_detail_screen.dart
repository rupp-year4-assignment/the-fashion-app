import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/app/routes.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';
import 'package:mobile/models/product.dart';
import 'package:mobile/models/product_review.dart';
import 'package:mobile/providers/cart_provider.dart';
import 'package:mobile/providers/product_provider.dart';
import 'package:mobile/providers/wishlist_provider.dart';
import 'package:mobile/widgets/app_button.dart';

class ProductDetailScreen extends ConsumerStatefulWidget {
  const ProductDetailScreen({super.key, required this.productId});

  final String productId;

  @override
  ConsumerState<ProductDetailScreen> createState() =>
      _ProductDetailScreenState();
}

class _ProductDetailScreenState extends ConsumerState<ProductDetailScreen> {
  String? _selectedSize;
  String? _selectedColor;
  int _quantity = 1;
  int _currentImageIndex = 0;
  bool _isDescriptionExpanded = false;

  @override
  Widget build(BuildContext context) {
    final productAsync = ref.watch(productDetailProvider(widget.productId));
    final wishlistState = ref.watch(wishlistProvider);

    return Scaffold(
      backgroundColor: AppColors.primary0,
      body: productAsync.when(
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (error, _) => Center(child: Text('Error: $error')),
        data: (product) {
          if (product == null) {
            return const Center(child: Text('Product not found'));
          }

          final isSaved = wishlistState.containsProduct(product.id);
          return _buildContent(product, isSaved);
        },
      ),
    );
  }

  Widget _buildContent(Product product, bool isSaved) {
    final selectedVariant = _getSelectedVariant(product);
    final price = selectedVariant?.price ?? product.minPrice;

    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildImageCarousel(product, isSaved),
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 16, 24, 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        product.name,
                        style: AppTextStyles.h2SemiBold.copyWith(fontSize: 20),
                      ),
                      const SizedBox(height: 8),
                      Row(
                        children: [
                          ...List.generate(
                            5,
                            (i) => Icon(
                              i < product.rating.round()
                                  ? Icons.star
                                  : Icons.star_border,
                              size: 18,
                              color: Colors.amber,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            '(${product.reviewCount} reviews)',
                            style: AppTextStyles.b2Regular,
                          ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      Text(
                        '\$ ${price.toStringAsFixed(2)}',
                        style: AppTextStyles.h2SemiBold.copyWith(fontSize: 24),
                      ),
                      const SizedBox(height: 20),
                      if (product.availableSizes.isNotEmpty) ...[
                        Text('Size', style: AppTextStyles.b1Medium),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 10,
                          runSpacing: 10,
                          children: product.availableSizes.map((size) {
                            final defaultSize = product.availableSizes.first;
                            final isSelected =
                                (_selectedSize ?? defaultSize) == size;

                            return GestureDetector(
                              onTap: () => setState(() => _selectedSize = size),
                              child: Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 18,
                                  vertical: 10,
                                ),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? AppColors.primary900
                                      : AppColors.primary0,
                                  borderRadius: BorderRadius.circular(10),
                                  border: Border.all(
                                    color: isSelected
                                        ? AppColors.primary900
                                        : AppColors.primary100,
                                  ),
                                ),
                                child: Text(
                                  size,
                                  style: AppTextStyles.b2Regular.copyWith(
                                    color: isSelected
                                        ? AppColors.primary0
                                        : AppColors.primary900,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 20),
                      ],
                      if (product.availableColors.isNotEmpty) ...[
                        Text('Color', style: AppTextStyles.b1Medium),
                        const SizedBox(height: 10),
                        Wrap(
                          spacing: 12,
                          runSpacing: 12,
                          children: product.availableColors.map((colorName) {
                            final defaultColor = product.availableColors.first;
                            final isSelected =
                                (_selectedColor ?? defaultColor) == colorName;

                            return GestureDetector(
                              onTap: () =>
                                  setState(() => _selectedColor = colorName),
                              child: Container(
                                width: 38,
                                height: 38,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  border: Border.all(
                                    color: isSelected
                                        ? AppColors.primary900
                                        : AppColors.primary100,
                                    width: isSelected ? 2 : 1,
                                  ),
                                ),
                                child: Center(
                                  child: Container(
                                    width: 28,
                                    height: 28,
                                    decoration: BoxDecoration(
                                      shape: BoxShape.circle,
                                      color: _resolveColor(colorName),
                                    ),
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                        const SizedBox(height: 20),
                      ],
                      Text('Description', style: AppTextStyles.b1Medium),
                      const SizedBox(height: 8),
                      Text(
                        product.description,
                        style: AppTextStyles.b2Regular.copyWith(height: 1.6),
                        maxLines: _isDescriptionExpanded ? null : 3,
                        overflow: _isDescriptionExpanded
                            ? TextOverflow.visible
                            : TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 2),
                      TextButton(
                        onPressed: () => setState(
                          () =>
                              _isDescriptionExpanded = !_isDescriptionExpanded,
                        ),
                        style: TextButton.styleFrom(
                          padding: EdgeInsets.zero,
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                        child: Text(
                          _isDescriptionExpanded ? 'Show less' : 'Read more',
                          style: AppTextStyles.b2Regular.copyWith(
                            color: AppColors.primary900,
                            decoration: TextDecoration.underline,
                          ),
                        ),
                      ),
                      const SizedBox(height: 20),
                      _buildReviewsSection(product),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
        _buildBottomBar(product, price),
      ],
    );
  }

  Widget _buildImageCarousel(Product product, bool isSaved) {
    final images = product.images;

    return SizedBox(
      height: 390,
      child: Stack(
        children: [
          if (images.isNotEmpty)
            PageView.builder(
              itemCount: images.length,
              onPageChanged: (i) => setState(() => _currentImageIndex = i),
              itemBuilder: (_, i) => Image.network(
                images[i],
                fit: BoxFit.cover,
                width: double.infinity,
                errorBuilder: (context, error, stackTrace) => Container(
                  color: AppColors.primary100.withValues(alpha: 0.3),
                  child: const Center(
                    child: Icon(
                      Icons.image_outlined,
                      size: 60,
                      color: AppColors.primary200,
                    ),
                  ),
                ),
              ),
            )
          else
            Container(
              color: AppColors.primary100.withValues(alpha: 0.3),
              child: const Center(
                child: Icon(
                  Icons.image_outlined,
                  size: 60,
                  color: AppColors.primary200,
                ),
              ),
            ),
          Positioned(
            top: MediaQuery.of(context).padding.top + 12,
            left: 24,
            right: 24,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _CircleIconButton(
                  icon: Icons.arrow_back,
                  onTap: () => Navigator.pop(context),
                ),
                _CircleIconButton(
                  icon: Icons.notifications_none,
                  onTap: () =>
                      Navigator.pushNamed(context, AppRoutes.notifications),
                ),
              ],
            ),
          ),
          Positioned(
            top: MediaQuery.of(context).padding.top + 60,
            right: 24,
            child: _CircleIconButton(
              icon: isSaved ? Icons.favorite : Icons.favorite_outline,
              iconColor: isSaved ? Colors.red : AppColors.primary900,
              onTap: () =>
                  ref.read(wishlistProvider.notifier).toggleWishlist(product),
            ),
          ),
          if (images.length > 1)
            Positioned(
              bottom: 16,
              left: 0,
              right: 0,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  images.length,
                  (i) => Container(
                    width: i == _currentImageIndex ? 24 : 8,
                    height: 8,
                    margin: const EdgeInsets.symmetric(horizontal: 3),
                    decoration: BoxDecoration(
                      color: i == _currentImageIndex
                          ? AppColors.primary900
                          : AppColors.primary200,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildReviewsSection(Product product) {
    final hasReviews = product.reviewCount > 0 || product.rating > 0;
    if (!hasReviews) {
      return const SizedBox.shrink();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Reviews', style: AppTextStyles.b1Medium),
            Text(
              '${product.rating.toStringAsFixed(1)} / 5  (${product.reviewCount})',
              style: AppTextStyles.b2Regular.copyWith(
                color: AppColors.primary500,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        if (product.reviews.isEmpty)
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.primary100),
            ),
            child: Text(
              'Ratings are available, but written reviews have not been loaded yet.',
              style: AppTextStyles.b2Regular.copyWith(
                color: AppColors.primary500,
              ),
            ),
          )
        else
          ...product.reviews.map((review) => _ReviewCard(review: review)),
      ],
    );
  }

  Widget _buildBottomBar(Product product, double price) {
    final cartState = ref.watch(cartProvider);

    return Container(
      padding: const EdgeInsets.fromLTRB(24, 12, 24, 24),
      decoration: BoxDecoration(
        color: AppColors.primary0,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 8,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: AppColors.primary100),
              ),
              child: Row(
                children: [
                  IconButton(
                    onPressed: _quantity > 1
                        ? () => setState(() => _quantity--)
                        : null,
                    icon: const Icon(Icons.remove, size: 18),
                    constraints: const BoxConstraints(
                      minWidth: 36,
                      minHeight: 36,
                    ),
                  ),
                  Text(
                    '$_quantity',
                    style: AppTextStyles.b1Medium.copyWith(fontSize: 16),
                  ),
                  IconButton(
                    onPressed: () => setState(() => _quantity++),
                    icon: const Icon(Icons.add, size: 18),
                    constraints: const BoxConstraints(
                      minWidth: 36,
                      minHeight: 36,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: AppButton(
                label: 'Add to Cart',
                isLoading: cartState.isLoading,
                onPressed: cartState.isLoading
                    ? null
                    : () => _addToCart(product, price),
              ),
            ),
          ],
        ),
      ),
    );
  }

  ProductVariant? _getSelectedVariant(Product product) {
    if (product.variants.isEmpty) {
      return null;
    }

    final resolvedSize =
        _selectedSize ??
        (product.availableSizes.isNotEmpty
            ? product.availableSizes.first
            : null);
    final resolvedColor =
        _selectedColor ??
        (product.availableColors.isNotEmpty
            ? product.availableColors.first
            : null);

    return product.variants.firstWhere(
      (v) =>
          (resolvedSize == null || v.size == resolvedSize) &&
          (resolvedColor == null || v.color == resolvedColor),
      orElse: () => product.variants.first,
    );
  }

  Color _resolveColor(String value) {
    final normalized = value.toLowerCase().trim();

    if (normalized.contains('black')) return Colors.black;
    if (normalized.contains('white')) return Colors.white;
    if (normalized.contains('red')) return Colors.red;
    if (normalized.contains('blue')) return Colors.blue;
    if (normalized.contains('green')) return Colors.green;
    if (normalized.contains('yellow')) return Colors.yellow.shade700;
    if (normalized.contains('orange')) return Colors.orange;
    if (normalized.contains('brown')) return const Color(0xFF8D6E63);
    if (normalized.contains('gray') || normalized.contains('grey')) {
      return Colors.grey;
    }

    return AppColors.primary500;
  }

  Future<void> _addToCart(Product product, double price) async {
    final variant = _getSelectedVariant(product);
    if (variant == null) {
      return;
    }

    final success = await ref
        .read(cartProvider.notifier)
        .addToCart(
          productId: product.id,
          variantId: variant.variantId,
          size: variant.size,
          color: variant.color,
          price: price,
          quantity: _quantity,
        );

    if (!mounted) {
      return;
    }

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(success ? 'Added to cart!' : 'Failed to add to cart'),
        backgroundColor: success ? AppColors.success : AppColors.error,
      ),
    );
  }
}

class _CircleIconButton extends StatelessWidget {
  const _CircleIconButton({
    required this.icon,
    required this.onTap,
    this.iconColor = AppColors.primary900,
  });

  final IconData icon;
  final VoidCallback onTap;
  final Color iconColor;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: 40,
        height: 40,
        decoration: BoxDecoration(
          color: AppColors.primary0.withValues(alpha: 0.84),
          shape: BoxShape.circle,
        ),
        child: Icon(icon, size: 22, color: iconColor),
      ),
    );
  }
}

class _ReviewCard extends StatelessWidget {
  const _ReviewCard({required this.review});

  final ProductReview review;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.primary100),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          CircleAvatar(
            radius: 16,
            backgroundColor: AppColors.primary100,
            child: Text(
              review.userName.isNotEmpty
                  ? review.userName[0].toUpperCase()
                  : '?',
              style: AppTextStyles.b2Regular.copyWith(
                color: AppColors.primary900,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        review.userName,
                        style: AppTextStyles.b2Regular.copyWith(
                          color: AppColors.primary900,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    if (review.updatedAt != null)
                      Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: Text(
                          _formatDate(review.updatedAt!),
                          style: AppTextStyles.b2Regular.copyWith(
                            color: AppColors.primary400,
                            fontSize: 11,
                          ),
                        ),
                      ),
                    Row(
                      children: List.generate(
                        5,
                        (index) => Icon(
                          index < review.rating
                              ? Icons.star
                              : Icons.star_border,
                          color: Colors.amber,
                          size: 14,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                Text(
                  review.comment,
                  style: AppTextStyles.b2Regular.copyWith(
                    color: AppColors.primary500,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  static String _formatDate(DateTime date) {
    final month = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ][date.month - 1];
    return '$month ${date.day}, ${date.year}';
  }
}
