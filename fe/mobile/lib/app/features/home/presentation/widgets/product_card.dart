import 'package:flutter/material.dart';
import 'package:mobile/core/resource/radius.dart';
import 'package:mobile/core/resource/app_size.dart';
import 'package:mobile/core/resource/spacing.dart';

class ProductCard extends StatelessWidget {
  final bool isFavorited;
  final String? imageUri;
  final String productName;
  final double price;
  final String currency;

  const ProductCard({
    super.key,
    this.isFavorited = false,
    this.imageUri,
    this.productName = "Product Name",
    this.price = 0.0,
    this.currency = "\$",
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: .start,
      spacing: Spacing.xs,
      children: [
        Card(
          color: Colors.grey.shade100,
          child: Stack(
            children: [
              Image.network(
                imageUri ??
                    "https://zandokh.com/image/cache/catalog/products/2025-12/21225111486/STU_8251-cr-450x672.jpg",
                fit: .contain,
              ),
              Positioned(
                top: 12,
                right: 12,
                child: Container(
                  padding: .all(AppSize.xs - 4),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(
                      AppRadius.defaultRadius,
                    ),
                  ),
                  child: Icon(
                    isFavorited ? Icons.favorite : Icons.favorite_border,
                    color: isFavorited ? Colors.red : Colors.grey,
                  ),
                ),
              ),
            ],
          ),
        ),
        Text(productName, style: Theme.of(context).textTheme.labelMedium),
        Text("$currency$price", style: Theme.of(context).textTheme.labelMedium),
      ],
    );
  }
}
