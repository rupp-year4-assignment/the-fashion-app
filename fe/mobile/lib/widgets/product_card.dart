import 'package:flutter/material.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';
import 'package:mobile/models/product.dart';

class ProductCard extends StatelessWidget {
  const ProductCard({
    super.key,
    required this.product,
    this.onTap,
    this.onFavoriteTap,
    this.isFavorite = false,
    this.discountText,
  });

  final Product product;
  final VoidCallback? onTap;
  final VoidCallback? onFavoriteTap;
  final bool isFavorite;
  final String? discountText;

  @override
  Widget build(BuildContext context) {
    final image = product.images.isNotEmpty ? product.images.first : null;

    return GestureDetector(
      onTap: onTap,
      child: SizedBox(
        width: 161,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Image container
            Container(
              width: 161,
              height: 174,
              decoration: BoxDecoration(
                color: AppColors.primary100.withValues(alpha: 0.4),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Stack(
                children: [
                  if (image != null)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(10),
                      child: Image.network(
                        image,
                        width: 161,
                        height: 174,
                        fit: BoxFit.cover,
                        errorBuilder: (_, __, ___) => const Center(
                          child: Icon(
                            Icons.image_outlined,
                            size: 40,
                            color: AppColors.primary200,
                          ),
                        ),
                      ),
                    )
                  else
                    const Center(
                      child: Icon(
                        Icons.image_outlined,
                        size: 40,
                        color: AppColors.primary200,
                      ),
                    ),
                  // Heart icon
                  Positioned(
                    top: 12,
                    right: 12,
                    child: GestureDetector(
                      onTap: onFavoriteTap,
                      child: Container(
                        width: 34,
                        height: 34,
                        decoration: BoxDecoration(
                          color: AppColors.primary0,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(alpha: 0.08),
                              blurRadius: 4,
                              offset: const Offset(0, 2),
                            ),
                          ],
                        ),
                        child: Icon(
                          isFavorite ? Icons.favorite : Icons.favorite_outline,
                          size: 18,
                          color: isFavorite ? Colors.red : AppColors.primary900,
                        ),
                      ),
                    ),
                  ),
                  if (discountText != null && discountText!.isNotEmpty)
                    Positioned(
                      top: 12,
                      left: 12,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primary900,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Text(
                          discountText!,
                          style: AppTextStyles.b2Regular.copyWith(
                            color: AppColors.primary0,
                            fontSize: 11,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            // Product name
            Text(
              product.name,
              style: AppTextStyles.b2Regular.copyWith(
                color: AppColors.primary900,
                fontSize: 13,
              ),
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: 3),
            // Price
            Text(
              '\$ ${product.minPrice.toStringAsFixed(product.minPrice.truncateToDouble() == product.minPrice ? 0 : 2)}',
              style: AppTextStyles.b2Regular.copyWith(
                color: AppColors.primary900,
                fontSize: 14,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
