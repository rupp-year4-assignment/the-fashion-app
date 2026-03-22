import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/models/user_address.dart';
import 'package:mobile/providers/auth_provider.dart';

final addressBookProvider =
    StateNotifierProvider<AddressBookNotifier, AddressBookState>((ref) {
      return AddressBookNotifier(ref);
    });

class AddressBookState {
  const AddressBookState({
    this.items = const [],
    this.isLoading = false,
    this.error,
  });

  final List<UserAddress> items;
  final bool isLoading;
  final String? error;

  UserAddress? get defaultAddress {
    for (final item in items) {
      if (item.isDefault) {
        return item;
      }
    }
    return items.isNotEmpty ? items.first : null;
  }

  AddressBookState copyWith({
    List<UserAddress>? items,
    bool? isLoading,
    String? error,
    bool clearError = false,
  }) {
    return AddressBookState(
      items: items ?? this.items,
      isLoading: isLoading ?? this.isLoading,
      error: clearError ? null : (error ?? this.error),
    );
  }
}

class AddressBookNotifier extends StateNotifier<AddressBookState> {
  AddressBookNotifier(this._ref) : super(const AddressBookState());

  final Ref _ref;

  String? get _token => _ref.read(authStateProvider).accessToken;
  String? get _refreshToken => _ref.read(authStateProvider).refreshToken;

  Future<void> loadAddresses() async {
    final token = _token;
    if (token == null || token.isEmpty) return;

    state = state.copyWith(isLoading: true, clearError: true);
    final api = _ref.read(apiServiceProvider);
    final result = await api.getAddresses(
      accessToken: token,
      refreshToken: _refreshToken,
    );

    if (!mounted) return;

    if (!result.isSuccess || result.data == null) {
      state = state.copyWith(
        isLoading: false,
        error: result.message ?? 'Failed to load addresses.',
      );
      return;
    }

    final rawData = result.data!['data'];
    final addresses = <UserAddress>[];

    if (rawData is List) {
      for (final item in rawData) {
        if (item is Map<String, dynamic>) {
          final address = UserAddress.fromJson(item);
          if (address.addressType == 'USER_DELIVERY') {
            addresses.add(address);
          }
        }
      }
    }

    state = state.copyWith(isLoading: false, items: addresses);
  }

  Future<bool> addAddress({
    required String label,
    required String street,
    required String city,
    required String stateValue,
    required String postalCode,
    required String country,
    required double latitude,
    required double longitude,
    bool isDefault = false,
  }) async {
    final token = _token;
    if (token == null || token.isEmpty) return false;

    final api = _ref.read(apiServiceProvider);
    final result = await api.addAddress(
      accessToken: token,
      refreshToken: _refreshToken,
      body: {
        'label': label.trim(),
        'addressType': 'USER_DELIVERY',
        'street': street.trim(),
        'city': city.trim(),
        'state': stateValue.trim(),
        'postalCode': postalCode.trim(),
        'country': country.trim(),
        'isDefault': isDefault,
        'location': {
          'type': 'Point',
          'coordinates': [longitude, latitude],
        },
      },
    );

    if (!result.isSuccess) {
      if (mounted) {
        state = state.copyWith(error: result.message ?? 'Failed to add address.');
      }
      return false;
    }

    await loadAddresses();
    return true;
  }

  Future<bool> removeAddress(String addressId) async {
    final token = _token;
    if (token == null || token.isEmpty) return false;

    final result = await _ref.read(apiServiceProvider).removeAddress(
      accessToken: token,
      refreshToken: _refreshToken,
      addressId: addressId,
    );

    if (!result.isSuccess) {
      if (mounted) {
        state = state.copyWith(
          error: result.message ?? 'Failed to remove address.',
        );
      }
      return false;
    }

    await loadAddresses();
    return true;
  }

  Future<bool> setDefaultAddress(String addressId) async {
    final token = _token;
    if (token == null || token.isEmpty) return false;

    final result = await _ref.read(apiServiceProvider).setDefaultAddress(
      accessToken: token,
      refreshToken: _refreshToken,
      addressId: addressId,
    );

    if (!result.isSuccess) {
      if (mounted) {
        state = state.copyWith(
          error: result.message ?? 'Failed to set default address.',
        );
      }
      return false;
    }

    await loadAddresses();
    return true;
  }
}
