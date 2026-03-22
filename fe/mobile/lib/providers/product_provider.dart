import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/models/product.dart';
import 'package:mobile/providers/auth_provider.dart';

final productsProvider =
    StateNotifierProvider<ProductsNotifier, ProductsState>((ref) {
  return ProductsNotifier(ref);
});

final productDetailProvider = StateNotifierProvider.family<ProductDetailNotifier,
    AsyncValue<Product?>, String>((ref, productId) {
  return ProductDetailNotifier(ref, productId);
});

class ProductsState {
  const ProductsState({
    this.products = const [],
    this.isLoading = false,
    this.error,
    this.page = 1,
    this.hasMore = true,
    this.selectedCategory = 'All',
  });

  final List<Product> products;
  final bool isLoading;
  final String? error;
  final int page;
  final bool hasMore;
  final String selectedCategory;

  ProductsState copyWith({
    List<Product>? products,
    bool? isLoading,
    String? error,
    bool clearError = false,
    int? page,
    bool? hasMore,
    String? selectedCategory,
  }) {
    return ProductsState(
      products: products ?? this.products,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
      page: page ?? this.page,
      hasMore: hasMore ?? this.hasMore,
      selectedCategory: selectedCategory ?? this.selectedCategory,
    );
  }
}

class ProductsNotifier extends StateNotifier<ProductsState> {
  ProductsNotifier(this._ref) : super(const ProductsState()) {
    loadProducts();
  }

  final Ref _ref;

  Future<void> loadProducts({bool refresh = false}) async {
    if (state.isLoading) return;

    final page = refresh ? 1 : state.page;
    state = state.copyWith(
      isLoading: true,
      clearError: true,
      page: page,
      products: refresh ? [] : null,
    );

    final api = _ref.read(apiServiceProvider);
    final result = await api.getProducts(page: page, limit: 10);

    if (!mounted) return;

    if (result.isSuccess && result.data != null) {
      final rawData = result.data!['data'];
      final List<Product> newProducts = [];

      if (rawData is List) {
        for (final item in rawData) {
          if (item is Map<String, dynamic>) {
            newProducts.add(Product.fromJson(item));
          }
        }
      } else if (rawData is Map<String, dynamic> && rawData['docs'] is List) {
        for (final item in rawData['docs'] as List) {
          if (item is Map<String, dynamic>) {
            newProducts.add(Product.fromJson(item));
          }
        }
      }

      final allProducts = refresh ? newProducts : [...state.products, ...newProducts];

      state = state.copyWith(
        isLoading: false,
        products: allProducts,
        page: page + 1,
        hasMore: newProducts.length >= 10,
      );
    } else {
      state = state.copyWith(
        isLoading: false,
        error: result.message ?? 'Failed to load products',
      );
    }
  }

  void selectCategory(String category) {
    state = state.copyWith(selectedCategory: category);
    loadProducts(refresh: true);
  }

  Future<void> refresh() => loadProducts(refresh: true);
}

class ProductDetailNotifier extends StateNotifier<AsyncValue<Product?>> {
  ProductDetailNotifier(this._ref, this._productId)
      : super(const AsyncValue.loading()) {
    _load();
  }

  final Ref _ref;
  final String _productId;

  Future<void> _load() async {
    state = const AsyncValue.loading();
    final api = _ref.read(apiServiceProvider);
    final result = await api.getProductById(_productId);

    if (!mounted) return;

    if (result.isSuccess && result.data != null) {
      final data = result.data!['data'];
      if (data is Map<String, dynamic>) {
        state = AsyncValue.data(Product.fromJson(data));
      } else {
        state = const AsyncValue.data(null);
      }
    } else {
      state = AsyncValue.error(
        result.message ?? 'Failed to load product',
        StackTrace.current,
      );
    }
  }

  Future<void> reload() => _load();
}
