import 'package:flutter/material.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';
import 'package:mobile/widgets/app_screen_header.dart';

class FAQsScreen extends StatefulWidget {
  const FAQsScreen({super.key});

  @override
  State<FAQsScreen> createState() => _FAQsScreenState();
}

class _FAQsScreenState extends State<FAQsScreen> {
  int _selectedCategory = 0;
  final _searchController = TextEditingController();
  final List<String> _categories = ['General', 'Account', 'Service', 'Policy'];

  final List<Map<String, String>> _faqs = [
    {
      'q': 'How do I make a purchase?',
      'a':
          'Browse our products, select the item you want, choose your size and color, '
          'then add it to your cart. Proceed to checkout to complete your purchase.',
    },
    {
      'q': 'What payment methods are accepted?',
      'a':
          'We accept credit/debit cards (Visa, MasterCard), mobile payments, '
          'and cash on delivery in selected areas.',
    },
    {
      'q': 'How do I track my orders?',
      'a':
          'Go to My Orders from the Account screen, select the order you want to track, '
          'and tap "Track Order" to see real-time status updates.',
    },
    {
      'q': 'Can I cancel or return an order?',
      'a':
          'You can cancel an order before it is shipped. For returns, please contact '
          'our support team within 14 days of delivery.',
    },
    {
      'q': 'How do I change my password?',
      'a':
          'Go to Account > My Details, or use the Forgot Password option on the '
          'login screen to reset your password via email verification.',
    },
    {
      'q': 'Is my personal information secure?',
      'a':
          'Yes, we use industry-standard encryption and security measures to protect '
          'your personal data. We never share your information with third parties.',
    },
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary0,
      body: SafeArea(
        child: Column(
          children: [
            AppScreenHeader(
              title: 'FAQs',
              leading: IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.arrow_back, size: 24),
              ),
            ),

            // Category chips
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
              child: SizedBox(
                height: 38,
                child: ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: _categories.length,
                  separatorBuilder: (_, __) => const SizedBox(width: 10),
                  itemBuilder: (_, i) {
                    final isActive = i == _selectedCategory;
                    return GestureDetector(
                      onTap: () => setState(() => _selectedCategory = i),
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 20,
                          vertical: 8,
                        ),
                        decoration: BoxDecoration(
                          color: isActive
                              ? AppColors.primary900
                              : AppColors.primary0,
                          borderRadius: BorderRadius.circular(20),
                          border: Border.all(
                            color: isActive
                                ? AppColors.primary900
                                : AppColors.primary100,
                          ),
                        ),
                        child: Text(
                          _categories[i],
                          style: AppTextStyles.b2Regular.copyWith(
                            color: isActive
                                ? AppColors.primary0
                                : AppColors.primary900,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    );
                  },
                ),
              ),
            ),

            // Search
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
              child: TextField(
                controller: _searchController,
                decoration: InputDecoration(
                  hintText: 'Search FAQs',
                  hintStyle: AppTextStyles.b2Regular.copyWith(
                    color: AppColors.primary400,
                  ),
                  prefixIcon: const Icon(
                    Icons.search,
                    color: AppColors.primary400,
                    size: 20,
                  ),
                  contentPadding: const EdgeInsets.symmetric(vertical: 12),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.primary100),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: AppColors.primary100),
                  ),
                ),
                onChanged: (_) => setState(() {}),
              ),
            ),

            const SizedBox(height: 8),

            // FAQ items
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                itemCount: _filteredFaqs.length,
                itemBuilder: (_, i) {
                  final faq = _filteredFaqs[i];
                  return ExpansionTile(
                    initiallyExpanded: i == 0,
                    tilePadding: EdgeInsets.zero,
                    title: Text(
                      faq['q']!,
                      style: AppTextStyles.b1Medium.copyWith(fontSize: 14),
                    ),
                    iconColor: AppColors.primary900,
                    collapsedIconColor: AppColors.primary400,
                    children: [
                      Align(
                        alignment: Alignment.centerLeft,
                        child: Padding(
                          padding: const EdgeInsets.only(bottom: 16),
                          child: Text(
                            faq['a']!,
                            style: AppTextStyles.b2Regular.copyWith(
                              color: AppColors.primary500,
                            ),
                          ),
                        ),
                      ),
                    ],
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }

  List<Map<String, String>> get _filteredFaqs {
    final query = _searchController.text.toLowerCase();
    if (query.isEmpty) return _faqs;
    return _faqs
        .where(
          (faq) =>
              faq['q']!.toLowerCase().contains(query) ||
              faq['a']!.toLowerCase().contains(query),
        )
        .toList();
  }
}
