import 'package:flutter/material.dart';

class ReviewsScreen extends StatefulWidget {
  const ReviewsScreen({super.key});

  @override
  State<ReviewsScreen> createState() => _ReviewsScreenState();
}

class _ReviewsScreenState extends State<ReviewsScreen> {
  final List<Map<String, String>> reviews = [
    {
      'text': 'The item is very good, my son likes it very much and plays every day.',
      'user': 'Wade Warren',
      'time': '6 days ago',
    },
    {
      'text': 'The seller is very fast in sending packet, I just bought it and the item arrived in just 1 day!',
      'user': 'Guy Hawkins',
      'time': '1 week ago',
    },
    {
      'text': 'I just bought it and the stuff is really good! I highly recommend it!',
      'user': 'Robert Fox',
      'time': '2 weeks ago',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Reviews'),
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
            // Summary Section
            Row(
              children: const [
                Text(
                  '4.0',
                  style: TextStyle(fontSize: 40, fontWeight: FontWeight.bold),
                ),
                SizedBox(width: 8),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('4.0', style: TextStyle(fontSize: 16)),
                    Text('1034 Ratings', style: TextStyle(color: Colors.grey)),
                    Text('45 Reviews', style: TextStyle(color: Colors.grey)),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            const Text(
              'Most Relevant',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 12),

            // Reviews List
            ListView.separated(
              physics: const NeverScrollableScrollPhysics(),
              shrinkWrap: true,
              itemCount: reviews.length,
              separatorBuilder: (_, __) => const Divider(),
              itemBuilder: (context, index) {
                final review = reviews[index];
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(review['text']!, style: const TextStyle(fontSize: 14)),
                    const SizedBox(height: 4),
                    Text(
                      '${review['user']} • ${review['time']}',
                      style: const TextStyle(color: Colors.grey, fontSize: 12),
                    ),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
