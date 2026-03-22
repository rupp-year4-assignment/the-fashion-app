import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/app/routes.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';
import 'package:mobile/models/product.dart';
import 'package:mobile/providers/product_provider.dart';
import 'package:mobile/providers/wishlist_provider.dart';
import 'package:mobile/widgets/product_card.dart';

class HomeScreen extends ConsumerStatefulWidget {
  const HomeScreen({super.key});

  @override
  ConsumerState<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends ConsumerState<HomeScreen> {
  final ScrollController _scrollController = ScrollController();

  // static const _categories = ['All', 'Trending', 'Men', 'Women', 'Sale'];

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      final state = ref.read(productsProvider);
      if (!state.isLoading && state.hasMore) {
        ref.read(productsProvider.notifier).loadProducts();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final productsState = ref.watch(productsProvider);
    final wishlistState = ref.watch(wishlistProvider);

    return Scaffold(
      backgroundColor: AppColors.primary0,
      body: SafeArea(
        child: RefreshIndicator(
          onRefresh: () => ref.read(productsProvider.notifier).refresh(),
          child: CustomScrollView(
            controller: _scrollController,
            slivers: [
              // App bar
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Discover',
                        style: AppTextStyles.h2SemiBold.copyWith(fontSize: 24),
                      ),
                      IconButton(
                        onPressed: () => Navigator.pushNamed(
                          context,
                          AppRoutes.notifications,
                        ),
                        icon: const Icon(Icons.notifications_none, size: 24),
                      ),
                    ],
                  ),
                ),
              ),

              // Search bar + Filter button
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.fromLTRB(24, 16, 24, 0),
                  child: Row(
                    children: [
                      Expanded(
                        child: GestureDetector(
                          onTap: () =>
                              Navigator.pushNamed(context, AppRoutes.search),
                          child: Container(
                            height: 52,
                            padding: const EdgeInsets.symmetric(horizontal: 16),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(color: AppColors.primary100),
                            ),
                            child: Row(
                              children: [
                                const Icon(
                                  Icons.search,
                                  color: AppColors.primary400,
                                  size: 22,
                                ),
                                const SizedBox(width: 8),
                                Text(
                                  'Search',
                                  style: AppTextStyles.b1Regular.copyWith(
                                    color: AppColors.primary400,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Container(
                        width: 52,
                        height: 52,
                        decoration: BoxDecoration(
                          color: AppColors.primary900,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: const Icon(
                          Icons.tune,
                          color: AppColors.primary0,
                          size: 22,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Category chips
              // SliverToBoxAdapter(
              //   child: Padding(
              //     padding: const EdgeInsets.fromLTRB(24, 16, 0, 8),
              //     child: SizedBox(
              //       height: 36,
              //       child: ListView.separated(
              //         scrollDirection: Axis.horizontal,
              //         itemCount: _categories.length,
              //         separatorBuilder: (_, __) => const SizedBox(width: 7),
              //         padding: const EdgeInsets.only(right: 24),
              //         itemBuilder: (context, index) {
              //           final cat = _categories[index];
              //           final isActive = productsState.selectedCategory == cat;
              //           return GestureDetector(
              //             onTap: () => ref
              //                 .read(productsProvider.notifier)
              //                 .selectCategory(cat),
              //             child: Container(
              //               padding: const EdgeInsets.symmetric(
              //                 horizontal: 20,
              //                 vertical: 6,
              //               ),
              //               decoration: BoxDecoration(
              //                 color: isActive
              //                     ? AppColors.primary900
              //                     : AppColors.primary0,
              //                 borderRadius: BorderRadius.circular(18),
              //                 border: isActive
              //                     ? null
              //                     : Border.all(color: AppColors.primary100),
              //               ),
              //               child: Text(
              //                 cat,
              //                 style: TextStyle(
              //                   fontFamily: 'Poppins',
              //                   fontWeight: FontWeight.w500,
              //                   fontSize: 14,
              //                   color: isActive
              //                       ? AppColors.primary0
              //                       : AppColors.primary900,
              //                 ),
              //               ),
              //             ),
              //           );
              //         },
              //       ),
              //     ),
              //   ),
              // ),

              // Product grid
              if (productsState.products.isEmpty && productsState.isLoading)
                const SliverFillRemaining(
                  child: Center(child: CircularProgressIndicator()),
                )
              else if (productsState.products.isEmpty &&
                  productsState.error != null)
                SliverFillRemaining(
                  child: Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          productsState.error!,
                          style: AppTextStyles.b1Regular,
                        ),
                        const SizedBox(height: 16),
                        TextButton(
                          onPressed: () =>
                              ref.read(productsProvider.notifier).refresh(),
                          child: const Text('Retry'),
                        ),
                      ],
                    ),
                  ),
                )
              else
                SliverPadding(
                  padding: const EdgeInsets.fromLTRB(24, 8, 24, 24),
                  sliver: SliverToBoxAdapter(
                    child: _buildStaggeredGrid(
                      productsState.products,
                      wishlistState,
                    ),
                  ),
                ),

              // Loading more indicator
              if (productsState.isLoading && productsState.products.isNotEmpty)
                const SliverToBoxAdapter(
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: Center(child: CircularProgressIndicator()),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildStaggeredGrid(List<Product> products, WishlistState wishlist) {
    final leftColumn = <Product>[];
    final rightColumn = <Product>[];

    for (int index = 0; index < products.length; index++) {
      if (index.isEven) {
        leftColumn.add(products[index]);
      } else {
        rightColumn.add(products[index]);
      }
    }

    Widget buildColumn(List<Product> items, {double topOffset = 0}) {
      if (items.isEmpty) {
        return const SizedBox.shrink();
      }

      return Padding(
        padding: EdgeInsets.only(top: topOffset),
        child: Column(
          children: [
            for (int index = 0; index < items.length; index++) ...[
              _buildProductTile(items[index], wishlist),
              if (index != items.length - 1) const SizedBox(height: 16),
            ],
          ],
        ),
      );
    }

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Expanded(child: buildColumn(leftColumn)),
        const SizedBox(width: 19),
        Expanded(child: buildColumn(rightColumn, topOffset: 20)),
      ],
    );
  }

  Widget _buildProductTile(Product product, WishlistState wishlist) {
    final isSaved = wishlist.containsProduct(product.id);

    return Align(
      alignment: Alignment.topCenter,
      child: ProductCard(
        product: product,
        isFavorite: isSaved,
        onTap: () => Navigator.pushNamed(
          context,
          AppRoutes.productDetail,
          arguments: product.id,
        ),
        onFavoriteTap: () =>
            ref.read(wishlistProvider.notifier).toggleWishlist(product),
      ),
    );
  }
}
