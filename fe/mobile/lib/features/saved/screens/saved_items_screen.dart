import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/app/routes.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';
import 'package:mobile/providers/wishlist_provider.dart';
import 'package:mobile/widgets/product_card.dart';

class SavedItemsScreen extends ConsumerStatefulWidget {
  const SavedItemsScreen({super.key});

  @override
  ConsumerState<SavedItemsScreen> createState() => _SavedItemsScreenState();
}

class _SavedItemsScreenState extends ConsumerState<SavedItemsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(wishlistProvider.notifier).loadWishlist());
  }

  @override
  Widget build(BuildContext context) {
    final wishlistState = ref.watch(wishlistProvider);
    final items = wishlistState.items;

    return Scaffold(
      backgroundColor: AppColors.primary0,
      body: SafeArea(
        child: Column(
          children: [
            // App bar
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 12, 24, 0),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text('Saved Items',
                      style: AppTextStyles.h2SemiBold.copyWith(fontSize: 24)),
                  IconButton(
                    onPressed: () =>
                        Navigator.pushNamed(context, AppRoutes.notifications),
                    icon: const Icon(Icons.notifications_none, size: 24),
                  ),
                ],
              ),
            ),
            const Divider(color: AppColors.primary100),

            // Content
            Expanded(
              child: wishlistState.isLoading && items.isEmpty
                  ? const Center(child: CircularProgressIndicator())
                  : items.isEmpty
                      ? _buildEmpty()
                      : _buildGrid(wishlistState),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.favorite_border, size: 64, color: AppColors.primary200),
          const SizedBox(height: 20),
          Text('No Saved Items!',
              style: AppTextStyles.b1Medium.copyWith(fontSize: 18)),
          const SizedBox(height: 8),
          Text('Items you save will appear here.',
              style: AppTextStyles.b2Regular
                  .copyWith(color: AppColors.primary500)),
        ],
      ),
    );
  }

  Widget _buildGrid(WishlistState wishlistState) {
    final items = wishlistState.items;
    return RefreshIndicator(
      onRefresh: () => ref.read(wishlistProvider.notifier).loadWishlist(),
      child: GridView.builder(
        padding: const EdgeInsets.all(24),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 161 / 212,
          crossAxisSpacing: 16,
          mainAxisSpacing: 16,
        ),
        itemCount: items.length,
        itemBuilder: (_, i) {
          final product = items[i];
          return ProductCard(
            product: product,
            isFavorite: true,
            onTap: () => Navigator.pushNamed(
              context,
              AppRoutes.productDetail,
              arguments: product.id,
            ),
            onFavoriteTap: () => ref
                .read(wishlistProvider.notifier)
                .toggleWishlist(product),
          );
        },
      ),
    );
  }
}
