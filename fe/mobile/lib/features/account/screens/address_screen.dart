import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';
import 'package:mobile/features/account/screens/add_address_screen.dart';
import 'package:mobile/models/user_address.dart';
import 'package:mobile/providers/address_provider.dart';
import 'package:mobile/widgets/app_button.dart';
import 'package:mobile/widgets/app_screen_header.dart';

class AddressScreen extends ConsumerStatefulWidget {
  const AddressScreen({super.key});

  @override
  ConsumerState<AddressScreen> createState() => _AddressScreenState();
}

class _AddressScreenState extends ConsumerState<AddressScreen> {
  String? _removingAddressId;

  @override
  void initState() {
    super.initState();
    Future.microtask(() => ref.read(addressBookProvider.notifier).loadAddresses());
  }

  Future<void> _addNewAddress() async {
    final created = await Navigator.push<bool>(
      context,
      MaterialPageRoute(builder: (_) => const AddAddressScreen()),
    );

    if (!mounted || created != true) return;

    await ref.read(addressBookProvider.notifier).loadAddresses();
    if (!mounted) return;
    _showMessage('Address added successfully.');
  }

  Future<void> _setDefault(UserAddress address) async {
    final success = await ref
        .read(addressBookProvider.notifier)
        .setDefaultAddress(address.id);

    if (!mounted) return;

    if (!success) {
      final state = ref.read(addressBookProvider);
      _showMessage(state.error ?? 'Failed to set default address.');
      return;
    }

    _showMessage('Default address updated.');
  }

  Future<void> _removeAddress(UserAddress address) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Delete address?'),
        content: Text('Remove "${address.label}" from your address book?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() => _removingAddressId = address.id);
    final success = await ref
        .read(addressBookProvider.notifier)
        .removeAddress(address.id);
    if (!mounted) return;
    setState(() => _removingAddressId = null);

    if (!success) {
      final state = ref.read(addressBookProvider);
      _showMessage(state.error ?? 'Failed to remove address.');
      return;
    }

    _showMessage('Address removed.');
  }

  void _showMessage(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  Widget _buildAddressItem(UserAddress address) {
    final isRemoving = _removingAddressId == address.id;
    return GestureDetector(
      onTap: address.isDefault ? null : () => _setDefault(address),
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: address.isDefault ? AppColors.primary900 : AppColors.primary100,
            width: address.isDefault ? 1.4 : 1,
          ),
        ),
        child: Row(
          children: [
            const Icon(
              Icons.location_on_outlined,
              size: 24,
              color: AppColors.primary500,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(
                        address.label,
                        style: AppTextStyles.b1Medium.copyWith(fontSize: 14),
                      ),
                      if (address.isDefault) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 8,
                            vertical: 2,
                          ),
                          decoration: BoxDecoration(
                            color: AppColors.primary900,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text(
                            'Default',
                            style: TextStyle(
                              fontFamily: 'Poppins',
                              fontSize: 10,
                              color: AppColors.primary0,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    address.fullAddress,
                    style: AppTextStyles.b2Regular.copyWith(
                      color: AppColors.primary500,
                    ),
                  ),
                ],
              ),
            ),
            IconButton(
              onPressed: isRemoving ? null : () => _removeAddress(address),
              icon: isRemoving
                  ? const SizedBox(
                      width: 18,
                      height: 18,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : const Icon(Icons.delete_outline, color: AppColors.error),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(addressBookProvider);

    return Scaffold(
      backgroundColor: AppColors.primary0,
      body: SafeArea(
        child: Column(
          children: [
            AppScreenHeader(
              title: 'Address Book',
              leading: IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.arrow_back, size: 24),
              ),
            ),
            Expanded(
              child: state.isLoading && state.items.isEmpty
                  ? const Center(child: CircularProgressIndicator(strokeWidth: 2))
                  : RefreshIndicator(
                      onRefresh: () =>
                          ref.read(addressBookProvider.notifier).loadAddresses(),
                      child: state.items.isEmpty
                          ? ListView(
                              padding: const EdgeInsets.all(24),
                              children: [
                                const SizedBox(height: 24),
                                Container(
                                  padding: const EdgeInsets.all(20),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(color: AppColors.primary100),
                                  ),
                                  child: Column(
                                    children: [
                                      const Icon(
                                        Icons.location_off_outlined,
                                        color: AppColors.primary500,
                                        size: 32,
                                      ),
                                      const SizedBox(height: 10),
                                      Text(
                                        'No saved address yet.',
                                        style: AppTextStyles.b1Regular,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Add your first address and select location from map.',
                                        style: AppTextStyles.b2Regular,
                                        textAlign: TextAlign.center,
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            )
                          : ListView.separated(
                              padding: const EdgeInsets.all(24),
                              itemBuilder: (_, index) =>
                                  _buildAddressItem(state.items[index]),
                              separatorBuilder: (_, index) =>
                                  const SizedBox(height: 10),
                              itemCount: state.items.length,
                            ),
                    ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
              child: AppButton(
                label: 'Add New Address',
                onPressed: _addNewAddress,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
