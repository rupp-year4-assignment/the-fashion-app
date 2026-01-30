import 'package:flutter/material.dart';
import 'reviews_screen.dart';
import 'saved_items_data.dart';

class ProductDetailsScreen extends StatefulWidget {
  const ProductDetailsScreen({super.key});

  @override
  State<ProductDetailsScreen> createState() => _ProductDetailsScreenState();
}

class _ProductDetailsScreenState extends State<ProductDetailsScreen> {
  String size = 'M';
  int selectedImageIndex = 0;
  bool isLoved = false;

  final List<Color> imageColors = [
    Colors.grey,
    Colors.blueGrey,
    Colors.brown,
    Colors.black26,
  ];

  late SavedItem product;

  @override
  void initState() {
    super.initState();

    product = SavedItem(
      title: 'Regular Fit Slogan',
      price: '\$1,190',
      color: imageColors[0],
    );

    // check if already saved
    isLoved = savedItems.any((item) => item.title == product.title);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Product Details'),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // IMAGE SECTION
            Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Column(
                  children: List.generate(4, (index) {
                    return GestureDetector(
                      onTap: () {
                        setState(() {
                          selectedImageIndex = index;
                          product = SavedItem(
                            title: product.title,
                            price: product.price,
                            color: imageColors[index],
                          );
                        });
                      },
                      child: Container(
                        margin: const EdgeInsets.only(bottom: 10),
                        height: 80,
                        width: 70,
                        decoration: BoxDecoration(
                          color: imageColors[index],
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                            color: selectedImageIndex == index
                                ? Colors.black
                                : Colors.transparent,
                            width: 2,
                          ),
                        ),
                      ),
                    );
                  }),
                ),

                const SizedBox(width: 12),

                Expanded(
                  child: Stack(
                    children: [
                      Container(
                        height: 350,
                        decoration: BoxDecoration(
                          color: imageColors[selectedImageIndex],
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      Positioned(
                        top: 12,
                        right: 12,
                        child: GestureDetector(
                          onTap: () {
                            setState(() {
                              isLoved = !isLoved;

                              if (isLoved) {
                                savedItems.add(product);
                              } else {
                                savedItems.removeWhere(
                                  (item) => item.title == product.title,
                                );
                              }
                            });
                          },
                          child: Container(
                            height: 36,
                            width: 36,
                            decoration: BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Icon(
                              Icons.favorite,
                              color: isLoved ? Colors.red : Colors.grey,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),

            const SizedBox(height: 16),
            const Text(
              'Regular Fit Slogan',
              style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
            ),
            const Text('⭐ 4.0/5 (45 reviews)'),
            const SizedBox(height: 8),
            const Text(
              'The name says it all, the right size slightly\n'
              'snugs the body leaving enough room for\n'
              'comfort in the sleeves and waist.',
            ),

            const SizedBox(height: 16),

            // SIZE
            const Text(
              'Choose size',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 8),
            Row(
              children: ['S', 'M', 'L'].map((s) {
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: ChoiceChip(
                    label: Text(s),
                    selected: size == s,
                    onSelected: (_) {
                      setState(() {
                        size = s;
                      });
                    },
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: 12),

            // SEE REVIEWS
            TextButton(
              onPressed: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const ReviewsScreen()),
                );
              },
              child: const Text('See Reviews'),
            ),
            const SizedBox(height: 12),
                 Row(
              children: [
                // Price Column
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text(
                      'Price',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    SizedBox(height: 4),
                    Text(
                      '\$1,190', // replace with your product price variable
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),

                const Spacer(), // pushes the button to the right

                // Add to Cart Button
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.black,
                    foregroundColor: Colors.white,
                    minimumSize: const Size(150, 48), // width 150, height 48
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                  ),
                  onPressed: () {},
                  child: const Text('Add to Cart'),
                ),
              ],
            )
          ],
        ),
      ),
    );
  }
}
