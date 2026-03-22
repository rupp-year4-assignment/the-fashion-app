import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/app/routes.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';
import 'package:mobile/providers/auth_provider.dart';
import 'package:mobile/providers/profile_provider.dart';
import 'package:mobile/widgets/app_button.dart';

class AccountScreen extends ConsumerStatefulWidget {
  const AccountScreen({super.key});

  @override
  ConsumerState<AccountScreen> createState() => _AccountScreenState();
}

class _AccountScreenState extends ConsumerState<AccountScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(
      () => ref.read(profileProvider.notifier).loadProfile(forceRefresh: true),
    );
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authStateProvider);
    final profileState = ref.watch(profileProvider);
    final profile = profileState.profile;
    final subtitle = profile?.email ?? authState.verificationEmail ?? '';

    return Scaffold(
      backgroundColor: AppColors.primary0,
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // App bar
              Padding(
                padding: const EdgeInsets.fromLTRB(24, 12, 24, 0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Account',
                      style: AppTextStyles.h2SemiBold.copyWith(fontSize: 24),
                    ),
                    IconButton(
                      onPressed: () =>
                          Navigator.pushNamed(context, AppRoutes.notifications),
                      icon: const Icon(Icons.notifications_none, size: 24),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // User info
              Padding(
                padding: const EdgeInsets.symmetric(horizontal: 24),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 24,
                      backgroundColor: AppColors.primary100,
                      child: Text(
                        profile?.initials ?? 'U',
                        style: AppTextStyles.b1Medium.copyWith(
                          color: AppColors.primary800,
                          fontSize: 18,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            profile?.displayName ??
                                (profileState.isLoading
                                    ? 'Loading profile...'
                                    : 'User'),
                            style: AppTextStyles.b1Medium,
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                          Text(
                            subtitle.isNotEmpty
                                ? subtitle
                                : (authState.userId ?? ''),
                            style: AppTextStyles.b2Regular.copyWith(
                              color: AppColors.primary500,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              if (profileState.error != null && profile == null)
                Padding(
                  padding: const EdgeInsets.fromLTRB(24, 12, 24, 0),
                  child: Row(
                    children: [
                      Expanded(
                        child: Text(
                          profileState.error!,
                          style: AppTextStyles.b2Regular.copyWith(
                            color: AppColors.error,
                          ),
                        ),
                      ),
                      TextButton(
                        onPressed: () => ref
                            .read(profileProvider.notifier)
                            .loadProfile(forceRefresh: true),
                        child: const Text('Retry'),
                      ),
                    ],
                  ),
                ),

              const SizedBox(height: 24),

              // My Orders
              _SectionTile(
                icon: Icons.shopping_bag_outlined,
                title: 'My Orders',
                onTap: () => Navigator.pushNamed(context, AppRoutes.orders),
              ),
              _SectionTile(
                icon: Icons.favorite_border,
                title: 'Saved Items',
                onTap: () => Navigator.pushNamed(context, AppRoutes.savedItems),
              ),

              const Divider(height: 1, color: AppColors.primary100),
              const SizedBox(height: 16),

              // Section: Account
              _SectionHeader(title: 'Account'),
              _SectionTile(
                icon: Icons.person_outline,
                title: 'My Details',
                onTap: () => Navigator.pushNamed(context, AppRoutes.myDetails),
              ),
              _SectionTile(
                icon: Icons.location_on_outlined,
                title: 'Address Book',
                onTap: () => Navigator.pushNamed(context, AppRoutes.address),
              ),
              _SectionTile(
                icon: Icons.payment_outlined,
                title: 'Payment Methods',
                onTap: () =>
                    Navigator.pushNamed(context, AppRoutes.paymentMethods),
              ),
              _SectionTile(
                icon: Icons.notifications_none,
                title: 'Notifications',
                onTap: () => Navigator.pushNamed(
                  context,
                  AppRoutes.notificationsSettings,
                ),
              ),

              const Divider(height: 1, color: AppColors.primary100),
              const SizedBox(height: 16),

              // Section: Support
              _SectionHeader(title: 'Support'),
              _SectionTile(
                icon: Icons.help_outline,
                title: 'FAQs',
                onTap: () => Navigator.pushNamed(context, AppRoutes.faqs),
              ),
              _SectionTile(
                icon: Icons.support_agent,
                title: 'Help Center',
                onTap: () => Navigator.pushNamed(context, AppRoutes.helpCenter),
              ),

              const Divider(height: 1, color: AppColors.primary100),
              const SizedBox(height: 16),

              // Logout
              _SectionTile(
                icon: Icons.logout,
                title: 'Logout',
                titleColor: AppColors.error,
                showArrow: false,
                onTap: () => _showLogoutDialog(context, ref),
              ),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }

  void _showLogoutDialog(BuildContext context, WidgetRef ref) {
    showDialog(
      context: context,
      builder: (ctx) => Dialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 78,
                height: 78,
                decoration: BoxDecoration(
                  color: Colors.orange.withValues(alpha: 0.1),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.warning_amber_rounded,
                  color: Colors.orange,
                  size: 48,
                ),
              ),
              const SizedBox(height: 24),
              Text(
                'Logout?',
                style: AppTextStyles.h2SemiBold.copyWith(fontSize: 22),
              ),
              const SizedBox(height: 8),
              Text(
                'Are you sure you want to logout?',
                style: AppTextStyles.b2Regular.copyWith(
                  color: AppColors.primary500,
                ),
              ),
              const SizedBox(height: 24),
              AppButton(
                label: 'Yes, Logout',
                onPressed: () async {
                  Navigator.pop(ctx);
                  await ref.read(authStateProvider.notifier).logout();
                  if (context.mounted) {
                    Navigator.pushNamedAndRemoveUntil(
                      context,
                      AppRoutes.onboarding,
                      (_) => false,
                    );
                  }
                },
              ),
              const SizedBox(height: 12),
              AppButton(
                label: 'Cancel',
                backgroundColor: AppColors.primary0,
                foregroundColor: AppColors.primary900,
                borderSide: const BorderSide(color: AppColors.primary900),
                onPressed: () => Navigator.pop(ctx),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title});
  final String title;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 0, 24, 8),
      child: Text(
        title,
        style: AppTextStyles.b2Regular.copyWith(
          color: AppColors.primary500,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _SectionTile extends StatelessWidget {
  const _SectionTile({
    required this.icon,
    required this.title,
    required this.onTap,
    this.titleColor,
    this.showArrow = true,
  });

  final IconData icon;
  final String title;
  final VoidCallback onTap;
  final Color? titleColor;
  final bool showArrow;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
        child: Row(
          children: [
            Icon(icon, size: 22, color: titleColor ?? AppColors.primary900),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                title,
                style: AppTextStyles.b1Regular.copyWith(
                  color: titleColor ?? AppColors.primary900,
                ),
              ),
            ),
            if (showArrow)
              const Icon(
                Icons.chevron_right,
                size: 20,
                color: AppColors.primary400,
              ),
          ],
        ),
      ),
    );
  }
}
