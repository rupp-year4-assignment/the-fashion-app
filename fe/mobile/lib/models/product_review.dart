class ProductReview {
  const ProductReview({
    required this.id,
    required this.userId,
    required this.userName,
    required this.productId,
    required this.orderId,
    required this.rating,
    required this.comment,
    this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String userId;
  final String userName;
  final String productId;
  final String orderId;
  final int rating;
  final String comment;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  factory ProductReview.fromJson(Map<String, dynamic> json) {
    return ProductReview(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      userId: json['userId']?.toString() ?? '',
      userName: json['userName']?.toString() ?? 'Customer',
      productId: json['productId']?.toString() ?? '',
      orderId: json['orderId']?.toString() ?? '',
      rating: (json['rating'] is num) ? (json['rating'] as num).toInt() : 0,
      comment: json['comment']?.toString() ?? '',
      createdAt: json['createdAt'] != null
          ? DateTime.tryParse(json['createdAt'].toString())
          : null,
      updatedAt: json['updatedAt'] != null
          ? DateTime.tryParse(json['updatedAt'].toString())
          : null,
    );
  }
}
