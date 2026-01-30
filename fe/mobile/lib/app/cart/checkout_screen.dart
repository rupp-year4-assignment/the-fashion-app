import 'package:flutter/material.dart';

class CheckoutScreen extends StatefulWidget {
  const CheckoutScreen({super.key});

  @override
  State<CheckoutScreen> createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  int selectedPayment = 0; // 0: Card, 1: Cash, 2: Wing, 3: ABA

  String deliveryAddress = '123 Street Name, City';

  final TextEditingController visaController = TextEditingController();
  final TextEditingController promoController = TextEditingController();

  bool isEditingVisa = false; // controls if the field is editable
  final FocusNode visaFocusNode = FocusNode();

  double subTotal = 100;
  double vat = 10;
  double shippingFee = 5;

  String cachedCardNumber = '';
  String cachedCashAmount = '';
  String appliedPromo = '';

  @override
  void dispose() {
    visaController.dispose();
    visaFocusNode.dispose();
    promoController.dispose();
    super.dispose();
  }

  double get total {
    double discount = appliedPromo.isNotEmpty ? 10 : 0; // example: $10 off promo
    return subTotal + vat + shippingFee - discount;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Checkout'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Delivery Address',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),

            // DELIVERY ADDRESS ROW WITH ICON
            GestureDetector(
              onTap: () async {
                final newAddress = await _showAddressDialog();
                if (newAddress != null && newAddress.isNotEmpty) {
                  setState(() {
                    deliveryAddress = newAddress;
                  });
                }
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.grey),
                  borderRadius: BorderRadius.circular(5),
                  color: Colors.white,
                ),
                child: Row(
                  children: [
                    const Icon(Icons.location_on, color: Colors.blue),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        deliveryAddress,
                        style: const TextStyle(fontSize: 16),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    const Icon(Icons.edit, size: 18, color: Colors.grey),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 20),

            const Text(
              'Payment Method',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),

            // HORIZONTAL SCROLLABLE PAYMENT OPTIONS
            SizedBox(
              height: 50,
              child: ListView(
                scrollDirection: Axis.horizontal,
                shrinkWrap: true,
                children: [
                  _paymentOption(index: 0, icon: Icons.credit_card, label: 'Card'),
                  _paymentOption(index: 1, icon: Icons.money, label: 'Cash'),
                  _paymentOption(index: 2, icon: Icons.account_balance_wallet, label: 'Wing'),
                  _paymentOption(index: 3, icon: Icons.account_balance, label: 'ABA'),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // VISA INPUT BOX - ALWAYS SHOW
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                border: Border.all(color: Colors.grey),
                borderRadius: BorderRadius.circular(5),
                color: Colors.white,
              ),
              child: Row(
                children: [
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      controller: visaController,
                      focusNode: visaFocusNode,
                      enabled: isEditingVisa,
                      keyboardType: TextInputType.number,
                      decoration: const InputDecoration(
                        hintText: 'VISA',
                        hintStyle: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                        border: InputBorder.none,
                      ),
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                      ),
                    ),
                  ),
                  GestureDetector(
                    onTap: () {
                      setState(() {
                        isEditingVisa = true;
                      });
                      visaFocusNode.requestFocus();
                    },
                    child: const Icon(Icons.edit, size: 18, color: Colors.grey),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 16),
            // SUMMARY
            Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text(
                  'Order Summary',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 12),
                _SummaryRow(title: 'Sub-total', value: '\$${subTotal.toStringAsFixed(0)}'),
                const SizedBox(height: 8),
                _SummaryRow(title: 'VAT (10%)', value: '\$${vat.toStringAsFixed(0)}'),
                const SizedBox(height: 8),
                _SummaryRow(title: 'Shipping fee', value: '\$${shippingFee.toStringAsFixed(0)}'),
                if (appliedPromo.isNotEmpty) ...[
                  const SizedBox(height: 8),
                  _SummaryRow(title: 'Discount', value: '-\$10'),
                ],
                const SizedBox(height: 15),
                _SummaryRow(title: 'Total', value: '\$${total.toStringAsFixed(0)}', isBold: true),
              ],
            ),
            const SizedBox(height: 16),
            // PROMO CODE INPUT
            Row(
              children: [
                Expanded(
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      border: Border.all(color: Colors.grey),
                      borderRadius: BorderRadius.circular(5),
                      color: Colors.white,
                    ),
                    child: TextField(
                      controller: promoController,
                      decoration: const InputDecoration(
                        hintText: 'Enter Promo Code',
                        border: InputBorder.none,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                SizedBox(
                  height: 52, // match the height of the promo code box
                  child: ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.black, // black background
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(5), // same border radius
                      ),
                    ),
                    onPressed: () {
                      setState(() {
                        appliedPromo = promoController.text;
                      });
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Promo code applied: $appliedPromo')),
                      );
                    },
                    child: const Text(
                      'Add',
                      style: TextStyle(color: Colors.white), // white text
                    ),
                  ),
                ),
              ],
            ),
            const Spacer(),

            ElevatedButton(
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 48),
              ),
              onPressed: () {
                // Cache the Visa or Cash value depending on selection
                if (selectedPayment == 0) {
                  cachedCardNumber = visaController.text;
                  debugPrint('Card number saved: $cachedCardNumber');
                } else if (selectedPayment == 1) {
                  cachedCashAmount = 'Cash selected';
                  debugPrint('Cash payment selected');
                }
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text(
                      selectedPayment == 0
                          ? 'Card saved: $cachedCardNumber'
                          : 'Payment method selected: ${['Card', 'Cash', 'Wing', 'ABA'][selectedPayment]}',
                    ),
                  ),
                );
              },
              child: const Text('Place Order'),
            ),
          ],
        ),
      ),
    );
  }

  // PAYMENT OPTION WIDGET
  Widget _paymentOption({
    required int index,
    required IconData icon,
    required String label,
  }) {
    final isSelected = selectedPayment == index;

    return Padding(
      padding: const EdgeInsets.only(right: 12),
      child: GestureDetector(
        onTap: () {
          setState(() {
            selectedPayment = index;
          });
        },
        child: Container(
          width: 100,
          decoration: BoxDecoration(
            border: Border.all(color: isSelected ? Colors.blue : Colors.grey),
            borderRadius: BorderRadius.circular(5),
            color: Colors.white,
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: isSelected ? Colors.blue : Colors.black),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  color: isSelected ? Colors.blue : Colors.black,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  // DIALOG TO CHANGE ADDRESS
  Future<String?> _showAddressDialog() {
    final controller = TextEditingController(text: deliveryAddress);
    return showDialog<String>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Change Address'),
        content: TextField(
          controller: controller,
          decoration: const InputDecoration(hintText: 'Enter new address'),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, controller.text),
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }
}

// SUMMARY ROW WIDGET
class _SummaryRow extends StatelessWidget {
  final String title;
  final String value;
  final bool isBold;

  const _SummaryRow({required this.title, required this.value, this.isBold = false});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: TextStyle(fontWeight: isBold ? FontWeight.bold : FontWeight.normal)),
        Text(value, style: TextStyle(fontWeight: isBold ? FontWeight.bold : FontWeight.normal)),
      ],
    );
  }
}
