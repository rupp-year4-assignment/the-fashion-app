import 'package:mobile/models/product_review.dart';
import 'package:mobile/utils/media_url.dart';

class ProductVariant {
  const ProductVariant({
    required this.variantId,
    required this.size,
    required this.color,
    required this.sku,
    required this.price,
    required this.stock,
  });

  final String variantId;
  final String size;
  final String color;
  final String sku;
  final double price;
  final int stock;

  factory ProductVariant.fromJson(Map<String, dynamic> json) {
    return ProductVariant(
      variantId: json['variantId']?.toString() ?? json['_id']?.toString() ?? '',
      size: json['size']?.toString() ?? '',
      color: json['color']?.toString() ?? '',
      sku: json['sku']?.toString() ?? '',
      price: (json['price'] is num) ? (json['price'] as num).toDouble() : 0.0,
      stock: (json['stock'] is num) ? (json['stock'] as num).toInt() : 0,
    );
  }

  Map<String, dynamic> toJson() => {
    'variantId': variantId,
    'size': size,
    'color': color,
    'sku': sku,
    'price': price,
    'stock': stock,
  };
}

class Product {
  const Product({
    required this.id,
    this.productId,
    required this.name,
    required this.description,
    required this.brand,
    required this.category,
    required this.status,
    required this.variants,
    this.images = const [],
    this.rating = 0.0,
    this.reviewCount = 0,
    this.reviews = const [],
    this.createdAt,
  });

  final String id;
  final String? productId;
  final String name;
  final String description;
  final String brand;
  final String category;
  final String status;
  final List<ProductVariant> variants;
  final List<String> images;
  final double rating;
  final int reviewCount;
  final List<ProductReview> reviews;
  final DateTime? createdAt;

  double get minPrice {
    if (variants.isEmpty) return 0;
    return variants.map((v) => v.price).reduce((a, b) => a < b ? a : b);
  }

  double get maxPrice {
    if (variants.isEmpty) return 0;
    return variants.map((v) => v.price).reduce((a, b) => a > b ? a : b);
  }

  List<String> get availableSizes =>
      variants.map((v) => v.size).toSet().toList();
  List<String> get availableColors =>
      variants.map((v) => v.color).toSet().toList();

  factory Product.fromJson(Map<String, dynamic> json) {
    final variantsList = (json['variants'] as List<dynamic>?)
            ?.map((v) => ProductVariant.fromJson(v as Map<String, dynamic>))
            .toList() ??
        [];

    final imagesList = <String>[];
    if (json['images'] is List) {
      for (final img in json['images'] as List) {
        if (img is String) {
          final resolved = resolveMediaUrl(img);
          if (resolved.isNotEmpty) {
            imagesList.add(resolved);
          }
        }
      }
    }

    return Product(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      productId: json['productId']?.toString(),
      name: json['name']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      brand: json['brand']?.toString() ?? '',
      category: json['category']?.toString() ?? '',
      status: json['status']?.toString() ?? 'available',
      variants: variantsList,
      images: imagesList,
      rating: (json['rating'] is num)
          ? (json['rating'] as num).toDouble()
          : 0.0,
      reviewCount: (json['reviewCount'] is num)
          ? (json['reviewCount'] as num).toInt()
          : 0,
      reviews: (json['reviews'] is List)
          ? (json['reviews'] as List)
                .whereType<Map<String, dynamic>>()
                .map(ProductReview.fromJson)
                .toList()
          : const [],
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
    );
  }
}
