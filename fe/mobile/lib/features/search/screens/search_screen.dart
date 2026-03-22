import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/app/routes.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';
import 'package:mobile/models/product.dart';
import 'package:mobile/providers/product_provider.dart';
import 'package:mobile/widgets/app_screen_header.dart';

class SearchScreen extends ConsumerStatefulWidget {
  const SearchScreen({super.key});

  @override
  ConsumerState<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends ConsumerState<SearchScreen> {
  final TextEditingController _searchController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  List<String> _recentSearches = [
    'Jeans',
    'Casual clothes',
    'Hoodie',
    'Nike shoes black',
    'V-neck tshirt',
    'Winter clothes',
  ];
  List<Product> _results = [];
  bool _hasSearched = false;
  bool _isSearching = false;

  @override
  void dispose() {
    _searchController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  Future<void> _performSearch(String query) async {
    final normalized = query.trim();
    if (normalized.isEmpty) {
      setState(() {
        _results = [];
        _hasSearched = false;
        _isSearching = false;
      });
      return;
    }

    setState(() {
      _isSearching = true;
      _hasSearched = true;
    });

    // Search from already loaded products (client-side filter)
    final products = ref.read(productsProvider).products;
    final filtered = products
        .where(
          (p) =>
              p.name.toLowerCase().contains(normalized.toLowerCase()) ||
              p.category.toLowerCase().contains(normalized.toLowerCase()) ||
              p.brand.toLowerCase().contains(normalized.toLowerCase()),
        )
        .toList();

    if (!_recentSearches.contains(normalized)) {
      _recentSearches.insert(0, normalized);
      if (_recentSearches.length > 10) _recentSearches.removeLast();
    }

    setState(() {
      _results = filtered;
      _isSearching = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary0,
      body: SafeArea(
        child: Column(
          children: [
            AppScreenHeader(
              title: 'Search',
              leading: IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.arrow_back, size: 24),
              ),
              trailing: IconButton(
                onPressed: () =>
                    Navigator.pushNamed(context, AppRoutes.notifications),
                icon: const Icon(Icons.notifications_none, size: 24),
              ),
            ),

            // Search field
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
              child: TextField(
                controller: _searchController,
                focusNode: _focusNode,
                onSubmitted: _performSearch,
                onChanged: (value) {
                  _performSearch(value);
                },
                style: AppTextStyles.b1Regular,
                decoration: InputDecoration(
                  hintText: 'Search',
                  hintStyle: AppTextStyles.b1Regular.copyWith(
                    color: AppColors.primary400,
                  ),
                  prefixIcon: const Icon(
                    Icons.search,
                    color: AppColors.primary400,
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 14,
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(color: AppColors.primary100),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: const BorderSide(
                      color: AppColors.primary900,
                      width: 1.4,
                    ),
                  ),
                ),
              ),
            ),

            const SizedBox(height: 16),

            // Content
            Expanded(child: _buildContent()),
          ],
        ),
      ),
    );
  }

  Widget _buildContent() {
    if (_isSearching) {
      return const Center(child: CircularProgressIndicator());
    }

    // State 1: Recent searches (no search performed)
    if (!_hasSearched && _searchController.text.isEmpty) {
      return _buildRecentSearches();
    }

    // State 3: Empty results
    if (_hasSearched && _results.isEmpty) {
      return _buildEmptyState();
    }

    // State 2: Results
    return _buildResultsList();
  }

  Widget _buildRecentSearches() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Recent Searches',
                style: AppTextStyles.b1Medium.copyWith(fontSize: 16),
              ),
              GestureDetector(
                onTap: () => setState(() => _recentSearches.clear()),
                child: Text(
                  'Clear all',
                  style: AppTextStyles.b2Regular.copyWith(
                    color: AppColors.primary400,
                    fontSize: 14,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Expanded(
            child: ListView.separated(
              itemCount: _recentSearches.length,
              separatorBuilder: (_, __) =>
                  const Divider(height: 1, color: AppColors.primary100),
              itemBuilder: (context, index) {
                return Padding(
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      GestureDetector(
                        onTap: () {
                          _searchController.text = _recentSearches[index];
                          _performSearch(_recentSearches[index]);
                        },
                        child: Text(
                          _recentSearches[index],
                          style: AppTextStyles.b1Regular,
                        ),
                      ),
                      GestureDetector(
                        onTap: () =>
                            setState(() => _recentSearches.removeAt(index)),
                        child: const Icon(
                          Icons.cancel_outlined,
                          size: 24,
                          color: AppColors.primary400,
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildResultsList() {
    return ListView.separated(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      itemCount: _results.length,
      separatorBuilder: (_, __) =>
          const Divider(height: 1, color: AppColors.primary100),
      itemBuilder: (context, index) {
        final product = _results[index];
        final image = product.images.isNotEmpty ? product.images.first : null;
        return GestureDetector(
          onTap: () => Navigator.pushNamed(
            context,
            AppRoutes.productDetail,
            arguments: product.id,
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              children: [
                // Image
                Container(
                  width: 73,
                  height: 87,
                  decoration: BoxDecoration(
                    color: AppColors.primary100.withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: image != null
                      ? ClipRRect(
                          borderRadius: BorderRadius.circular(8),
                          child: Image.network(
                            image,
                            fit: BoxFit.cover,
                            errorBuilder: (_, __, ___) =>
                                const Icon(Icons.image_outlined),
                          ),
                        )
                      : const Icon(
                          Icons.image_outlined,
                          color: AppColors.primary200,
                        ),
                ),
                const SizedBox(width: 14),
                // Info
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        product.name,
                        style: AppTextStyles.b1Regular.copyWith(fontSize: 14),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 3),
                      Text(
                        '\$ ${product.minPrice.toStringAsFixed(0)}',
                        style: const TextStyle(
                          fontFamily: 'Poppins',
                          fontWeight: FontWeight.w500,
                          fontSize: 13,
                          color: AppColors.primary900,
                        ),
                      ),
                    ],
                  ),
                ),
                const Icon(
                  Icons.arrow_forward_ios,
                  size: 16,
                  color: AppColors.primary400,
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.search, size: 64, color: AppColors.primary200),
          const SizedBox(height: 20),
          Text(
            'No Results Found!',
            style: AppTextStyles.b1Medium.copyWith(fontSize: 18),
          ),
          const SizedBox(height: 8),
          Text(
            'Try a similar word or something\nmore general.',
            textAlign: TextAlign.center,
            style: AppTextStyles.b2Regular,
          ),
        ],
      ),
    );
  }
}
