import 'package:flutter/material.dart';
import 'checkout_screen.dart';
import 'product_details_screen.dart';

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  bool isCartEmpty = false;
  int quantity = 1;

  // 💰 PRICE VARIABLES
  final double price = 1190; // price per item
  final double vatRate = 0.10; // 10% VAT
  final double shippingFee = 20;

  // ✅ COMPUTED GETTERS
  double get subTotal => price * quantity;
  double get vat => subTotal * vatRate;
  double get total => subTotal + vat + shippingFee;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Cart'),
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.notifications_none),
                onPressed: () {},
              ),
              Positioned(
                right: 10,
                top: 10,
                child: Container(
                  width: 8,
                  height: 8,
                  decoration: const BoxDecoration(
                    color: Colors.red,
                    shape: BoxShape.circle,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: isCartEmpty ? _emptyCart() : _cartItem(context),
      ),
    );
  }

  Widget _cartItem(BuildContext context) {
  return Column(
    crossAxisAlignment: CrossAxisAlignment.stretch,
    children: [
      // CART ITEM WITH BORDER
      Container(
        decoration: BoxDecoration(
          border: Border.all(color: Colors.black),
          borderRadius: BorderRadius.circular(8),
        ),
        padding: const EdgeInsets.all(8),
        child: ListTile(
          contentPadding: const EdgeInsets.all(0),
          leading: Container(
            width: 60,
            height: 60,
            color: Colors.grey[300],
          ),
          title: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text('Regular Fit Slogan'),
              IconButton(
                icon: const Icon(Icons.delete_outline),
                onPressed: () {
                  setState(() {
                    isCartEmpty = true;
                  });
                },
              ),
            ],
          ),
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 4),
              const Text('Size: L'),
              const SizedBox(height: 4),
              Text('\$${price.toStringAsFixed(0)}'),
              // QUANTITY SELECTOR
              Row(
                children: [
                  IconButton(
                    icon: const Icon(Icons.remove),
                    onPressed: () {
                      setState(() {
                        if (quantity > 1) quantity--;
                      });
                    },
                    splashRadius: 20,
                  ),
                  Text(
                    quantity.toString(),
                    style: const TextStyle(fontSize: 16),
                  ),
                  IconButton(
                    icon: const Icon(Icons.add),
                    onPressed: () {
                      setState(() {
                        quantity++;
                      });
                    },
                    splashRadius: 20,
                  ),
                ],
              ),
            ],
          ),
          onTap: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const ProductDetailsScreen(),
              ),
            );
          },
        ),
      ),
        const SizedBox(height: 240),

        // ORDER SUMMARY
        Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            _SummaryRow(title: 'Sub-total', value: '\$${subTotal.toStringAsFixed(0)}'),
            const SizedBox(height: 8),
            _SummaryRow(title: 'VAT (10%)', value: '\$${vat.toStringAsFixed(0)}'),
            const SizedBox(height: 8),
            _SummaryRow(title: 'Shipping fee', value: '\$${shippingFee.toStringAsFixed(0)}'),
            const SizedBox(height: 8),
            _SummaryRow(title: 'Total', value: '\$${total.toStringAsFixed(0)}', isBold: true),
          ],
        ),

        const SizedBox(height: 20),

        // CHECKOUT BUTTON
        OutlinedButton(
          style: OutlinedButton.styleFrom(
            minimumSize: const Size(double.infinity, 48),
            side: const BorderSide(color: Colors.black),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(5),
            ),
          ),
          onPressed: () {
            Navigator.push(
              context,
              MaterialPageRoute(
                builder: (_) => const CheckoutScreen(),
              ),
            );
          },
          child: Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center, // center everything
              children: [
                const Text(
                  'Go To Checkout',
                  style: TextStyle(color: Colors.black, fontSize: 16), // text white
                ),
                const SizedBox(width: 12), // spacing between text and icon
                IconButton(
                  icon: const Icon(Icons.arrow_forward, color: Colors.black), // icon white
                  onPressed: () => Navigator.pop(context),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }

  Widget _emptyCart() {
    return Center(
      child: Container(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: const [
            Icon(
              Icons.shopping_cart_outlined,
              size: 80,
              color: Colors.grey,
            ),
            SizedBox(height: 16),
            Text(
              'Your Cart Is Empty!',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
              ),
            ),
            SizedBox(height: 8),
            Text(
              'When you add products, they’ll \n appear here.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.grey, fontSize: 14),
            ),
          ],
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String title;
  final String value;
  final bool isBold;

  const _SummaryRow({
    required this.title,
    required this.value,
    this.isBold = false,
  });

  @override
  Widget build(BuildContext context) {
    final style = TextStyle(
      fontSize: 14,
      color: Colors.black,
      fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
    );

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: style),
        Text(value, style: style),
      ],
    );
  }
}
