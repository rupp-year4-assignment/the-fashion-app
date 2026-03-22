import 'package:mobile/utils/media_url.dart';

class OrderItem {
  const OrderItem({
    required this.productId,
    required this.variantId,
    required this.productName,
    required this.size,
    required this.color,
    required this.price,
    required this.quantity,
    this.image,
    this.hasReview = false,
    this.reviewId,
    this.reviewRating,
    this.reviewComment,
  });

  final String productId;
  final String variantId;
  final String productName;
  final String size;
  final String color;
  final double price;
  final int quantity;
  final String? image;
  final bool hasReview;
  final String? reviewId;
  final int? reviewRating;
  final String? reviewComment;

  factory OrderItem.fromJson(Map<String, dynamic> json) {
    final resolvedImage = resolveMediaUrl(json['image']?.toString());

    return OrderItem(
      productId: json['productId']?.toString() ?? '',
      variantId: json['variantId']?.toString() ?? '',
      productName: json['productName']?.toString() ?? '',
      size: json['size']?.toString() ?? '',
      color: json['color']?.toString() ?? '',
      price: (json['price'] is num) ? (json['price'] as num).toDouble() : 0.0,
      quantity: (json['quantity'] is num)
          ? (json['quantity'] as num).toInt()
          : 1,
      image: resolvedImage.isEmpty ? null : resolvedImage,
      hasReview: json['hasReview'] == true,
      reviewId: json['reviewId']?.toString(),
      reviewRating: (json['reviewRating'] is num)
          ? (json['reviewRating'] as num).toInt()
          : null,
      reviewComment: json['reviewComment']?.toString(),
    );
  }

  Map<String, dynamic> toJson() => {
    'productId': productId,
    'variantId': variantId,
    'productName': productName,
    'size': size,
    'color': color,
    'price': price,
    'quantity': quantity,
  };
}

class OrderDelivery {
  const OrderDelivery({
    this.courier = '',
    this.pickupAddress = const OrderAddress(),
    this.destinationAddress = const OrderAddress(),
  });

  final String courier;
  final OrderAddress pickupAddress;
  final OrderAddress destinationAddress;

  String get fullAddress => destinationAddress.fullAddress;
  String get pickupFullAddress => pickupAddress.fullAddress;
  String get destinationFullAddress => destinationAddress.fullAddress;

  static OrderAddress _readAddress(dynamic value) {
    if (value is Map<String, dynamic>) {
      return OrderAddress.fromJson(value);
    }
    return const OrderAddress();
  }

  factory OrderDelivery.fromJson(Map<String, dynamic> json) {
    final fallbackAddress = _readAddress(json['address']);
    final destination = _readAddress(json['destinationAddress']);
    final pickup = _readAddress(json['pickupAddress']);

    final destinationAddress = destination.fullAddress.isNotEmpty
        ? destination
        : fallbackAddress;

    return OrderDelivery(
      courier: json['courier']?.toString() ?? '',
      pickupAddress: pickup,
      destinationAddress: destinationAddress,
    );
  }
}

class OrderAddress {
  const OrderAddress({
    this.street = '',
    this.city = '',
    this.state = '',
    this.postalCode = '',
    this.country = '',
    this.latitude = 0,
    this.longitude = 0,
  });

  final String street;
  final String city;
  final String state;
  final String postalCode;
  final String country;
  final double latitude;
  final double longitude;

  String get fullAddress => [
    street,
    city,
    state,
    postalCode,
    country,
  ].where((s) => s.isNotEmpty).join(', ');

  factory OrderAddress.fromJson(Map<String, dynamic> json) {
    final location = json['location'];
    double latitude = 0;
    double longitude = 0;

    if (location is Map<String, dynamic>) {
      final coordinates = location['coordinates'];
      if (coordinates is List && coordinates.length >= 2) {
        longitude = _asDouble(coordinates[0]);
        latitude = _asDouble(coordinates[1]);
      }
    } else {
      latitude = _asDouble(json['latitude']);
      longitude = _asDouble(json['longitude']);
    }

    return OrderAddress(
      street: (json['street'] ?? '').toString(),
      city: (json['city'] ?? '').toString(),
      state: (json['state'] ?? '').toString(),
      postalCode: (json['postalCode'] ?? '').toString(),
      country: (json['country'] ?? '').toString(),
      latitude: latitude,
      longitude: longitude,
    );
  }

  static double _asDouble(dynamic value) {
    if (value is num) {
      return value.toDouble();
    }
    if (value is String) {
      return double.tryParse(value) ?? 0;
    }
    return 0;
  }
}

enum OrderStatus {
  pending,
  processing,
  shipped,
  delivered,
  cancelled;

  static OrderStatus fromString(String value) {
    switch (value.toLowerCase()) {
      case 'processing':
        return OrderStatus.processing;
      case 'shipped':
        return OrderStatus.shipped;
      case 'delivered':
        return OrderStatus.delivered;
      case 'cancelled':
        return OrderStatus.cancelled;
      default:
        return OrderStatus.pending;
    }
  }

  String get label {
    switch (this) {
      case OrderStatus.pending:
        return 'Pending';
      case OrderStatus.processing:
        return 'Processing';
      case OrderStatus.shipped:
        return 'Ongoing';
      case OrderStatus.delivered:
        return 'Delivered';
      case OrderStatus.cancelled:
        return 'Cancelled';
    }
  }

  bool get isOngoing =>
      this == OrderStatus.pending ||
      this == OrderStatus.processing ||
      this == OrderStatus.shipped;

  bool get isCompleted =>
      this == OrderStatus.delivered || this == OrderStatus.cancelled;
}

enum OrderPaymentStatus {
  pending,
  completed,
  failed;

  static OrderPaymentStatus fromString(String value) {
    switch (value.toLowerCase()) {
      case 'completed':
        return OrderPaymentStatus.completed;
      case 'failed':
        return OrderPaymentStatus.failed;
      default:
        return OrderPaymentStatus.pending;
    }
  }

  String get label {
    switch (this) {
      case OrderPaymentStatus.pending:
        return 'Payment Pending';
      case OrderPaymentStatus.completed:
        return 'Paid';
      case OrderPaymentStatus.failed:
        return 'Payment Failed';
    }
  }

  bool get isPaid => this == OrderPaymentStatus.completed;
}

class Order {
  const Order({
    required this.id,
    required this.userId,
    required this.items,
    required this.status,
    required this.paymentStatus,
    required this.delivery,
    this.totalAmount = 0,
    this.createdAt,
  });

  final String id;
  final String userId;
  final List<OrderItem> items;
  final OrderStatus status;
  final OrderPaymentStatus paymentStatus;
  final OrderDelivery delivery;
  final double totalAmount;
  final DateTime? createdAt;

  factory Order.fromJson(Map<String, dynamic> json) {
    final itemsList = <OrderItem>[];
    final rawItems = json['item'] ?? json['items'];
    if (rawItems is List) {
      for (final item in rawItems) {
        if (item is Map<String, dynamic>) {
          itemsList.add(OrderItem.fromJson(item));
        }
      }
    }

    return Order(
      id: json['_id']?.toString() ?? json['id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      items: itemsList,
      status: OrderStatus.fromString(
        json['orderStatus']?.toString() ??
            json['status']?.toString() ??
            'pending',
      ),
      paymentStatus: OrderPaymentStatus.fromString(
        json['paymentStatus']?.toString() ?? 'pending',
      ),
      delivery: json['delivery'] is Map<String, dynamic>
          ? OrderDelivery.fromJson(json['delivery'] as Map<String, dynamic>)
          : const OrderDelivery(),
      totalAmount: (json['totalAmount'] is num)
          ? (json['totalAmount'] as num).toDouble()
          : 0.0,
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
    );
  }
}
