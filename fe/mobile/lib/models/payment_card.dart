class PaymentCard {
  const PaymentCard({
    required this.id,
    required this.holderName,
    required this.network,
    required this.last4,
    required this.expiryMonth,
    required this.expiryYear,
  });

  final String id;
  final String holderName;
  final String network;
  final String last4;
  final int expiryMonth;
  final int expiryYear;

  String get maskedNumber => '**** **** **** $last4';
  String get expiryLabel =>
      '${expiryMonth.toString().padLeft(2, '0')}/$expiryYear';

  factory PaymentCard.fromJson(Map<String, dynamic> json) {
    return PaymentCard(
      id: json['id']?.toString() ?? json['_id']?.toString() ?? '',
      holderName: json['holderName']?.toString() ?? '',
      network: json['network']?.toString() ?? '',
      last4: json['last4']?.toString() ?? '',
      expiryMonth: (json['expiryMonth'] is num)
          ? (json['expiryMonth'] as num).toInt()
          : 0,
      expiryYear: (json['expiryYear'] is num)
          ? (json['expiryYear'] as num).toInt()
          : 0,
    );
  }
}
