import 'package:flutter/material.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';
import 'package:mobile/widgets/app_screen_header.dart';

class NotificationsSettingsScreen extends StatefulWidget {
  const NotificationsSettingsScreen({super.key});

  @override
  State<NotificationsSettingsScreen> createState() =>
      _NotificationsSettingsScreenState();
}

class _NotificationsSettingsScreenState
    extends State<NotificationsSettingsScreen> {
  final Map<String, bool> _settings = {
    'General Notifications': true,
    'Sound': true,
    'Vibrate': false,
    'Special Offers': true,
    'Promo & Discounts': true,
    'Payments': true,
    'Cashback': false,
    'App Updates': true,
    'New Service Available': false,
    'New Tips Available': false,
  };

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary0,
      body: SafeArea(
        child: Column(
          children: [
            AppScreenHeader(
              title: 'Notifications',
              leading: IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.arrow_back, size: 24),
              ),
            ),

            // Settings list
            Expanded(
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                itemCount: _settings.length,
                separatorBuilder: (_, __) =>
                    const Divider(height: 1, color: AppColors.primary100),
                itemBuilder: (_, i) {
                  final key = _settings.keys.elementAt(i);
                  final value = _settings[key]!;
                  return Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(key, style: AppTextStyles.b1Regular),
                        Switch(
                          value: value,
                          onChanged: (v) => setState(() => _settings[key] = v),
                          activeColor: AppColors.primary900,
                          inactiveTrackColor: AppColors.primary200,
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
