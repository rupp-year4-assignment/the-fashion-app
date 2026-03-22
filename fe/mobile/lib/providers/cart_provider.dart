import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/models/cart.dart';
import 'package:mobile/providers/auth_provider.dart';

final cartProvider = StateNotifierProvider<CartNotifier, CartState>((ref) {
  return CartNotifier(ref);
});

class CartState {
  const CartState({
    this.cart = const Cart(),
    this.isLoading = false,
    this.error,
  });

  final Cart cart;
  final bool isLoading;
  final String? error;

  CartState copyWith({
    Cart? cart,
    bool? isLoading,
    String? error,
    bool clearError = false,
  }) {
    return CartState(
      cart: cart ?? this.cart,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

class CartNotifier extends StateNotifier<CartState> {
  CartNotifier(this._ref) : super(const CartState());

  final Ref _ref;

  String? get _token => _ref.read(authStateProvider).accessToken;
  String? get _refreshToken => _ref.read(authStateProvider).refreshToken;
  String? get _userId => _ref.read(authStateProvider).userId;

  Future<void> loadCart() async {
    final token = _token;
    final refreshToken = _refreshToken;
    final userId = _userId;
    if (token == null || userId == null) return;

    state = state.copyWith(isLoading: true, clearError: true);
    final api = _ref.read(apiServiceProvider);
    final result = await api.getCart(
      accessToken: token,
      refreshToken: refreshToken,
      userId: userId,
    );

    if (!mounted) return;

    if (result.isSuccess && result.data != null) {
      final data = result.data!['data'];
      if (data is Map<String, dynamic>) {
        state = state.copyWith(isLoading: false, cart: Cart.fromJson(data));
      } else {
        state = state.copyWith(isLoading: false, cart: const Cart());
      }
    } else {
      state = state.copyWith(isLoading: false, error: result.message);
    }
  }

  Future<bool> addToCart({
    required String productId,
    required String variantId,
    required String size,
    required String color,
    required double price,
    int quantity = 1,
  }) async {
    final token = _token;
    final refreshToken = _refreshToken;
    final userId = _userId;
    if (token == null || userId == null) return false;

    state = state.copyWith(isLoading: true, clearError: true);
    final api = _ref.read(apiServiceProvider);
    final result = await api.addToCart(
      accessToken: token,
      refreshToken: refreshToken,
      body: {
        'userId': userId,
        'productId': productId,
        'variantId': variantId,
        'size': size,
        'color': color,
        'price': price,
        'quantity': quantity,
      },
    );

    if (!mounted) return false;

    if (result.isSuccess) {
      await loadCart();
      return true;
    } else {
      state = state.copyWith(isLoading: false, error: result.message);
      return false;
    }
  }

  Future<void> updateQuantity({
    required String productId,
    required String variantId,
    required int quantity,
  }) async {
    final token = _token;
    final refreshToken = _refreshToken;
    final userId = _userId;
    if (token == null || userId == null) return;

    final api = _ref.read(apiServiceProvider);
    await api.updateCartQuantity(
      accessToken: token,
      refreshToken: refreshToken,
      body: {
        'userId': userId,
        'productId': productId,
        'variantId': variantId,
        'quantity': quantity,
      },
    );

    if (mounted) await loadCart();
  }

  Future<void> removeItem(String variantId) async {
    final token = _token;
    final refreshToken = _refreshToken;
    final userId = _userId;
    if (token == null || userId == null) return;

    final api = _ref.read(apiServiceProvider);
    await api.removeCartItem(
      accessToken: token,
      refreshToken: refreshToken,
      body: {'userId': userId, 'variantId': variantId},
    );

    if (mounted) await loadCart();
  }

  Future<void> clearCart() async {
    final token = _token;
    final refreshToken = _refreshToken;
    final userId = _userId;
    if (token == null || userId == null) return;

    final api = _ref.read(apiServiceProvider);
    await api.clearCart(
      accessToken: token,
      refreshToken: refreshToken,
      userId: userId,
    );

    if (mounted) {
      state = state.copyWith(cart: const Cart());
    }
  }
}
