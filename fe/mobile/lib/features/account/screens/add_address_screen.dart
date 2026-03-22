import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';
import 'package:mobile/features/account/screens/map_picker_screen.dart';
import 'package:mobile/providers/address_provider.dart';
import 'package:mobile/widgets/app_button.dart';
import 'package:mobile/widgets/app_screen_header.dart';

class AddAddressScreen extends ConsumerStatefulWidget {
  const AddAddressScreen({super.key});

  @override
  ConsumerState<AddAddressScreen> createState() => _AddAddressScreenState();
}

class _AddAddressScreenState extends ConsumerState<AddAddressScreen> {
  final _labelController = TextEditingController(text: 'Home');
  final _streetController = TextEditingController();
  final _cityController = TextEditingController();
  final _stateController = TextEditingController();
  final _postalCodeController = TextEditingController();
  final _countryController = TextEditingController(text: 'Cambodia');

  bool _isSubmitting = false;
  bool _makeDefault = false;
  String? _errorText;
  MapPickResult? _selectedLocation;

  @override
  void dispose() {
    _labelController.dispose();
    _streetController.dispose();
    _cityController.dispose();
    _stateController.dispose();
    _postalCodeController.dispose();
    _countryController.dispose();
    super.dispose();
  }

  Future<void> _openMapPicker() async {
    final picked = await Navigator.push<MapPickResult>(
      context,
      MaterialPageRoute(
        builder: (_) => MapPickerScreen(
          initialLatitude: _selectedLocation?.latitude,
          initialLongitude: _selectedLocation?.longitude,
        ),
      ),
    );

    if (!mounted || picked == null) return;

    _selectedLocation = picked;

    if (_streetController.text.trim().isEmpty &&
        (picked.street ?? '').trim().isNotEmpty) {
      _streetController.text = picked.street!.trim();
    }
    if (_cityController.text.trim().isEmpty &&
        (picked.city ?? '').trim().isNotEmpty) {
      _cityController.text = picked.city!.trim();
    }
    if (_stateController.text.trim().isEmpty &&
        (picked.state ?? '').trim().isNotEmpty) {
      _stateController.text = picked.state!.trim();
    }
    if (_postalCodeController.text.trim().isEmpty &&
        (picked.postalCode ?? '').trim().isNotEmpty) {
      _postalCodeController.text = picked.postalCode!.trim();
    }
    if (_countryController.text.trim().isEmpty &&
        (picked.country ?? '').trim().isNotEmpty) {
      _countryController.text = picked.country!.trim();
    }

    setState(() => _errorText = null);
  }

  Future<void> _submit() async {
    final label = _labelController.text.trim();
    final street = _streetController.text.trim();
    final city = _cityController.text.trim();
    final stateValue = _stateController.text.trim();
    final postalCode = _postalCodeController.text.trim();
    final country = _countryController.text.trim();

    if (street.isEmpty ||
        city.isEmpty ||
        stateValue.isEmpty ||
        postalCode.isEmpty ||
        country.isEmpty) {
      setState(() => _errorText = 'Please fill all required fields.');
      return;
    }

    if (_selectedLocation == null) {
      setState(() => _errorText = 'Please select location on map.');
      return;
    }

    setState(() {
      _isSubmitting = true;
      _errorText = null;
    });

    final success = await ref.read(addressBookProvider.notifier).addAddress(
      label: label.isEmpty ? 'Home' : label,
      street: street,
      city: city,
      stateValue: stateValue,
      postalCode: postalCode,
      country: country,
      latitude: _selectedLocation!.latitude,
      longitude: _selectedLocation!.longitude,
      isDefault: _makeDefault,
    );

    if (!mounted) return;

    setState(() => _isSubmitting = false);

    if (!success) {
      final state = ref.read(addressBookProvider);
      setState(() => _errorText = state.error ?? 'Failed to add address.');
      return;
    }

    Navigator.pop(context, true);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary0,
      body: SafeArea(
        child: Column(
          children: [
            AppScreenHeader(
              title: 'Add New Address',
              leading: IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.arrow_back, size: 24),
              ),
            ),
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(24),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TextField(
                      controller: _labelController,
                      decoration: const InputDecoration(labelText: 'Label'),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _streetController,
                      decoration: const InputDecoration(labelText: 'Street *'),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _cityController,
                      decoration: const InputDecoration(labelText: 'City *'),
                    ),
                    const SizedBox(height: 10),
                    TextField(
                      controller: _stateController,
                      decoration: const InputDecoration(labelText: 'State *'),
                    ),
                    const SizedBox(height: 10),
                    Row(
                      children: [
                        Expanded(
                          child: TextField(
                            controller: _postalCodeController,
                            decoration: const InputDecoration(
                              labelText: 'Postal Code *',
                            ),
                          ),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: TextField(
                            controller: _countryController,
                            decoration: const InputDecoration(
                              labelText: 'Country *',
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    InkWell(
                      onTap: _isSubmitting ? null : _openMapPicker,
                      borderRadius: BorderRadius.circular(10),
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(color: AppColors.primary100),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.map_outlined,
                              color: AppColors.primary500,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Text(
                                _selectedLocation == null
                                    ? 'Select location on map *'
                                    : '${_selectedLocation!.latitude.toStringAsFixed(5)}, '
                                          '${_selectedLocation!.longitude.toStringAsFixed(5)}',
                                style: AppTextStyles.b2Regular,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    CheckboxListTile(
                      value: _makeDefault,
                      contentPadding: EdgeInsets.zero,
                      onChanged: _isSubmitting
                          ? null
                          : (value) {
                              setState(() => _makeDefault = value == true);
                            },
                      title: Text(
                        'Set as default address',
                        style: AppTextStyles.b2Regular.copyWith(
                          color: AppColors.primary900,
                        ),
                      ),
                    ),
                    if (_errorText != null) ...[
                      const SizedBox(height: 8),
                      Text(
                        _errorText!,
                        style: AppTextStyles.b2Regular.copyWith(
                          color: AppColors.error,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
              child: AppButton(
                label: 'Save Address',
                isLoading: _isSubmitting,
                onPressed: _isSubmitting ? null : _submit,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
