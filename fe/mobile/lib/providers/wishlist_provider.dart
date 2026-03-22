import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/models/product.dart';
import 'package:mobile/providers/auth_provider.dart';

final wishlistProvider =
    StateNotifierProvider<WishlistNotifier, WishlistState>((ref) {
  return WishlistNotifier(ref);
});

class WishlistState {
  const WishlistState({
    this.items = const [],
    this.isLoading = false,
    this.error,
  });

  final List<Product> items;
  final bool isLoading;
  final String? error;

  bool containsProduct(String productId) =>
      items.any((p) => p.id == productId);

  WishlistState copyWith({
    List<Product>? items,
    bool? isLoading,
    String? error,
    bool clearError = false,
  }) {
    return WishlistState(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

class WishlistNotifier extends StateNotifier<WishlistState> {
  WishlistNotifier(this._ref) : super(const WishlistState());

  final Ref _ref;

  String? get _token => _ref.read(authStateProvider).accessToken;
  String? get _refreshToken => _ref.read(authStateProvider).refreshToken;

  Future<void> loadWishlist() async {
    final token = _token;
    if (token == null) return;
    final refreshToken = _refreshToken;

    state = state.copyWith(isLoading: true, clearError: true);
    final api = _ref.read(apiServiceProvider);
    final result = await api.getWishlist(
      accessToken: token,
      refreshToken: refreshToken,
    );

    if (!mounted) return;

    if (result.isSuccess && result.data != null) {
      final rawData = result.data!['data'];
      final List<Product> products = [];

      if (rawData is List) {
        for (final item in rawData) {
          if (item is Map<String, dynamic>) {
            final product = item['product'] ?? item;
            if (product is Map<String, dynamic>) {
              products.add(Product.fromJson(product));
            }
          }
        }
      }

      state = state.copyWith(isLoading: false, items: products);
    } else {
      state = state.copyWith(isLoading: false, error: result.message);
    }
  }

  Future<bool> toggleWishlist(Product product, {String? variantId}) async {
    final token = _token;
    if (token == null) return false;
    final refreshToken = _refreshToken;

    final api = _ref.read(apiServiceProvider);
    final isInWishlist = state.containsProduct(product.id);

    if (isInWishlist) {
      final result = await api.removeFromWishlist(
        accessToken: token,
        refreshToken: refreshToken,
        productId: product.id,
      );
      if (result.isSuccess && mounted) {
        state = state.copyWith(
          items: state.items.where((p) => p.id != product.id).toList(),
        );
        return true;
      }
    } else {
      final vid = variantId ??
          (product.variants.isNotEmpty ? product.variants.first.variantId : '');
      final result = await api.addToWishlist(
        accessToken: token,
        refreshToken: refreshToken,
        productId: product.id,
        variantId: vid,
      );
      if (result.isSuccess && mounted) {
        state = state.copyWith(items: [...state.items, product]);
        return true;
      }
    }
    return false;
  }
}
