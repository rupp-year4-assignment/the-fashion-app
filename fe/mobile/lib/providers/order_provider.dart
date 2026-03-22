import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/models/order.dart';
import 'package:mobile/providers/auth_provider.dart';

final ordersProvider =
    StateNotifierProvider<OrdersNotifier, OrdersState>((ref) {
  return OrdersNotifier(ref);
});

class OrdersState {
  const OrdersState({
    this.orders = const [],
    this.isLoading = false,
    this.error,
  });

  final List<Order> orders;
  final bool isLoading;
  final String? error;

  List<Order> get ongoing => orders.where((o) => o.status.isOngoing).toList();
  List<Order> get completed =>
      orders.where((o) => o.status.isCompleted).toList();

  OrdersState copyWith({
    List<Order>? orders,
    bool? isLoading,
    String? error,
    bool clearError = false,
  }) {
    return OrdersState(
      orders: orders ?? this.orders,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

class OrdersNotifier extends StateNotifier<OrdersState> {
  OrdersNotifier(this._ref) : super(const OrdersState());

  final Ref _ref;

  String? get _token => _ref.read(authStateProvider).accessToken;
  String? get _refreshToken => _ref.read(authStateProvider).refreshToken;
  String? get _userId => _ref.read(authStateProvider).userId;

  Future<void> loadOrders() async {
    final token = _token;
    final refreshToken = _refreshToken;
    final userId = _userId;
    if (token == null || userId == null) return;

    state = state.copyWith(isLoading: true, clearError: true);
    final api = _ref.read(apiServiceProvider);
    final result = await api.getOrdersByUser(
      accessToken: token,
      refreshToken: refreshToken,
      userId: userId,
    );

    if (!mounted) return;

    if (result.isSuccess && result.data != null) {
      final rawData = result.data!['data'];
      final List<Order> orders = [];

      if (rawData is List) {
        for (final item in rawData) {
          if (item is Map<String, dynamic>) {
            orders.add(Order.fromJson(item));
          }
        }
      }

      state = state.copyWith(isLoading: false, orders: orders);
    } else {
      state = state.copyWith(isLoading: false, error: result.message);
    }
  }

  Future<bool> createOrder({
    required List<Map<String, dynamic>> items,
    required Map<String, dynamic> delivery,
  }) async {
    final token = _token;
    final refreshToken = _refreshToken;
    final userId = _userId;
    if (token == null || userId == null) return false;

    state = state.copyWith(isLoading: true, clearError: true);
    final api = _ref.read(apiServiceProvider);
    final result = await api.createOrder(
      accessToken: token,
      refreshToken: refreshToken,
      body: {
        'userId': userId,
        'item': items,
        'delivery': delivery,
      },
    );

    if (!mounted) return false;

    if (result.isSuccess) {
      await loadOrders();
      return true;
    } else {
      state = state.copyWith(isLoading: false, error: result.message);
      return false;
    }
  }

  void upsertOrder(Order order) {
    final current = [...state.orders];
    final index = current.indexWhere((item) => item.id == order.id);

    if (index >= 0) {
      current[index] = order;
    } else {
      current.insert(0, order);
    }

    current.sort((a, b) {
      final aTime = a.createdAt?.millisecondsSinceEpoch ?? 0;
      final bTime = b.createdAt?.millisecondsSinceEpoch ?? 0;
      return bTime.compareTo(aTime);
    });

    state = state.copyWith(orders: current);
  }
}
