import 'package:mobile/utils/media_url.dart';

class CartItem {
  const CartItem({
    required this.productId,
    required this.variantId,
    required this.name,
    required this.size,
    required this.color,
    required this.price,
    required this.quantity,
    this.image,
  });

  final String productId;
  final String variantId;
  final String name;
  final String size;
  final String color;
  final double price;
  final int quantity;
  final String? image;

  double get total => price * quantity;

  CartItem copyWith({int? quantity}) {
    return CartItem(
      productId: productId,
      variantId: variantId,
      name: name,
      size: size,
      color: color,
      price: price,
      quantity: quantity ?? this.quantity,
      image: image,
    );
  }

  factory CartItem.fromJson(Map<String, dynamic> json) {
    final product = json['product'];
    String? productName;
    String? productImage;

    if (product is Map<String, dynamic>) {
      productName = product['name']?.toString();
      final images = product['images'];
      if (images is List && images.isNotEmpty && images.first is String) {
        productImage = resolveMediaUrl(images.first as String);
      }
    }

    final resolvedImage = resolveMediaUrl(
      json['image']?.toString() ?? productImage,
    );

    return CartItem(
      productId: json['productId']?.toString() ?? '',
      variantId: json['variantId']?.toString() ?? '',
      name:
          json['productName']?.toString() ??
          json['name']?.toString() ??
          productName ??
          'Product',
      size: json['size']?.toString() ?? '',
      color: json['color']?.toString() ?? '',
      price: (json['price'] is num) ? (json['price'] as num).toDouble() : 0.0,
      quantity: (json['quantity'] is num)
          ? (json['quantity'] as num).toInt()
          : 1,
      image: resolvedImage.isEmpty ? null : resolvedImage,
    );
  }

  Map<String, dynamic> toJson() => {
    'productId': productId,
    'variantId': variantId,
    'productName': name,
    'size': size,
    'color': color,
    'price': price,
    'quantity': quantity,
  };
}

class Cart {
  const Cart({this.items = const []});

  final List<CartItem> items;

  double get subtotal => items.fold(0, (sum, item) => sum + item.total);

  double get vat => 0.0;
  double get shippingFee => items.isEmpty ? 0.0 : 0.10;
  double get total => subtotal + vat + shippingFee;

  bool get isEmpty => items.isEmpty;
  int get itemCount => items.length;

  factory Cart.fromJson(Map<String, dynamic> json) {
    final itemsList = <CartItem>[];
    final rawItems = (json['items'] is List)
        ? json['items']
        : (json['item'] is List ? json['item'] : null);

    if (rawItems is List) {
      for (final item in rawItems) {
        if (item is Map<String, dynamic>) {
          itemsList.add(CartItem.fromJson(item));
        }
      }
    }
    return Cart(items: itemsList);
  }
}
