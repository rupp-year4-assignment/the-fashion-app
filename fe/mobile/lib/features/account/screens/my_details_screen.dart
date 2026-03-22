import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';
import 'package:mobile/providers/profile_provider.dart';
import 'package:mobile/widgets/app_button.dart';
import 'package:mobile/widgets/app_screen_header.dart';
import 'package:mobile/widgets/app_text_field.dart';

class MyDetailsScreen extends ConsumerStatefulWidget {
  const MyDetailsScreen({super.key});

  @override
  ConsumerState<MyDetailsScreen> createState() => _MyDetailsScreenState();
}

class _MyDetailsScreenState extends ConsumerState<MyDetailsScreen> {
  final _firstNameController = TextEditingController();
  final _lastNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _dobController = TextEditingController();
  final _phoneController = TextEditingController();
  var _selectedGender = 'not_specified';
  var _didSeedForm = false;

  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => ref.read(profileProvider.notifier).loadProfile(forceRefresh: true),
    );
  }

  @override
  void dispose() {
    _firstNameController.dispose();
    _lastNameController.dispose();
    _emailController.dispose();
    _dobController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  void _seedForm() {
    final profile = ref.read(profileProvider).profile;
    if (_didSeedForm || profile == null) return;

    _firstNameController.text = profile.firstName;
    _lastNameController.text = profile.lastName;
    _emailController.text = profile.email;
    _dobController.text = profile.formattedDateOfBirth;
    _phoneController.text = profile.phoneNumber;
    _selectedGender = profile.gender;
    _didSeedForm = true;
  }

  Future<void> _pickDate() async {
    final currentValue = _dobController.text.trim();
    final initialDate =
        DateTime.tryParse(currentValue) ??
        DateTime.now().subtract(const Duration(days: 365 * 20));

    final picked = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime(1950),
      lastDate: DateTime.now(),
    );

    if (picked == null || !mounted) return;

    final year = picked.year.toString().padLeft(4, '0');
    final month = picked.month.toString().padLeft(2, '0');
    final day = picked.day.toString().padLeft(2, '0');
    setState(() => _dobController.text = '$year-$month-$day');
  }

  Future<void> _saveChanges() async {
    final firstName = _firstNameController.text.trim();
    final lastName = _lastNameController.text.trim();
    final phoneNumber = _phoneController.text.trim();
    final dateOfBirthText = _dobController.text.trim();

    if (firstName.length < 2) {
      _showMessage('First name must be at least 2 characters.', isError: true);
      return;
    }

    final dateOfBirth = dateOfBirthText.isEmpty
        ? null
        : DateTime.tryParse(dateOfBirthText);

    if (dateOfBirthText.isNotEmpty && dateOfBirth == null) {
      _showMessage('Date of birth is invalid.', isError: true);
      return;
    }

    final success = await ref.read(profileProvider.notifier).updateProfile(
      firstName: firstName,
      lastName: lastName,
      gender: _selectedGender,
      phoneNumber: phoneNumber,
      dateOfBirth: dateOfBirth,
    );

    if (!mounted) return;

    if (!success) {
      final message =
          ref.read(profileProvider).error ?? 'Failed to update profile.';
      _showMessage(message, isError: true);
      return;
    }

    _showMessage('Profile updated.');
    Navigator.pop(context);
  }

  void _showMessage(String message, {bool isError = false}) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: isError ? AppColors.error : AppColors.success,
        ),
      );
  }

  @override
  Widget build(BuildContext context) {
    final profileState = ref.watch(profileProvider);
    _seedForm();

    return Scaffold(
      backgroundColor: AppColors.primary0,
      body: SafeArea(
        child: Column(
          children: [
            AppScreenHeader(
              title: 'My Details',
              leading: IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.arrow_back, size: 24),
              ),
            ),

            Expanded(
              child: profileState.isLoading && profileState.profile == null
                  ? const Center(child: CircularProgressIndicator(strokeWidth: 2))
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(24),
                      child: Column(
                        children: [
                          AppTextField(
                            label: 'First Name',
                            controller: _firstNameController,
                            hintText: 'Enter first name',
                          ),
                          const SizedBox(height: 16),
                          AppTextField(
                            label: 'Last Name',
                            controller: _lastNameController,
                            hintText: 'Enter last name',
                          ),
                          const SizedBox(height: 16),
                          AppTextField(
                            label: 'Email',
                            controller: _emailController,
                            hintText: 'Enter email',
                            enabled: false,
                          ),
                          const SizedBox(height: 16),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text('Gender', style: AppTextStyles.b1Medium),
                              const SizedBox(height: 8),
                              DropdownButtonFormField<String>(
                                key: ValueKey(_selectedGender),
                                initialValue: _selectedGender,
                                decoration: InputDecoration(
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(
                                      color: AppColors.primary100,
                                    ),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(10),
                                    borderSide: const BorderSide(
                                      color: AppColors.primary900,
                                      width: 1.4,
                                    ),
                                  ),
                                ),
                                items: const [
                                  DropdownMenuItem(
                                    value: 'female',
                                    child: Text('Female'),
                                  ),
                                  DropdownMenuItem(
                                    value: 'male',
                                    child: Text('Male'),
                                  ),
                                  DropdownMenuItem(
                                    value: 'not_specified',
                                    child: Text('Prefer not to say'),
                                  ),
                                ],
                                onChanged: (value) {
                                  if (value == null) return;
                                  setState(() => _selectedGender = value);
                                },
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          InkWell(
                            onTap: _pickDate,
                            child: IgnorePointer(
                              child: AppTextField(
                                label: 'Date of Birth',
                                controller: _dobController,
                                hintText: 'YYYY-MM-DD',
                                suffixIcon: const Icon(
                                  Icons.calendar_today_outlined,
                                  size: 20,
                                  color: AppColors.primary400,
                                ),
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          AppTextField(
                            label: 'Phone Number',
                            controller: _phoneController,
                            hintText: 'Enter phone number',
                            keyboardType: TextInputType.phone,
                            prefixIcon: const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 12),
                              child: Center(
                                widthFactor: 1,
                                child: Text(
                                  '+855',
                                  style: TextStyle(
                                    fontFamily: 'Poppins',
                                    color: AppColors.primary500,
                                    fontSize: 14,
                                  ),
                                ),
                              ),
                            ),
                          ),
                          if (profileState.error != null) ...[
                            const SizedBox(height: 12),
                            Text(
                              profileState.error!,
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
                label: 'Save Changes',
                isLoading: profileState.isSaving,
                onPressed: profileState.isSaving ? null : _saveChanges,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
