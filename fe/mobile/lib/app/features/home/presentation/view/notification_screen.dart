import 'package:flutter/material.dart';
import 'package:mobile/app/features/home/presentation/widgets/notification_widget.dart';
import 'package:mobile/core/resource/app_size.dart';
import 'package:mobile/core/resource/color.dart';
import 'package:mobile/core/resource/spacing.dart';
import 'package:mobile/core/widgets/app_layout.dart';
import 'package:sizer/sizer.dart';

class NotificationScreen extends StatelessWidget {
  const NotificationScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _buildAppBar(context),
      body: AppLayout(child: _buildBody(context)),
    );
  }

  // appbar
  AppBar _buildAppBar(BuildContext context) {
    return AppBar(
      surfaceTintColor: Colors.transparent,
      leading: IconButton(onPressed: () {}, icon: Icon(Icons.arrow_back)),
      centerTitle: true,
      title: Text(
        "Notifications",
        style: Theme.of(
          context,
        ).textTheme.titleLarge?.copyWith(fontWeight: .bold),
      ),
    );
  }

  Widget _noNotificationWidget(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppSize.xl2),
      child: Column(
        spacing: Spacing.md,
        mainAxisAlignment: .center,
        children: [
          Icon(
            Icons.notifications_none,
            size: 36.sp,
            color: Colors.grey.shade300,
          ),
          Column(
            spacing: Spacing.xs,
            children: [
              Text(
                "You haven’t gotten any notifications yet!",
                textAlign: .center,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              Text(
                "We’ll alert you when something cool happens.",
                textAlign: .center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: ColorManager.lightSecondary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildBody(BuildContext context) {
    List<NotificationWidget> mockUpNotifications = [
      DateLabel(date: "Today"),
      NotificationItem(
        title: "New Arrival",
        subtitle: "Check out the latest products in our store.",
      ),
      NotificationItem(
        title: "Sale Alert",
        subtitle: "Up to 50% off on selected items.",
      ),
      DateLabel(date: "Yesterday"),
      NotificationItem(
        title: "Order Shipped",
        subtitle: "Your order #12345 has been shipped.",
      ),
      NotificationItem(
        title: "Welcome!",
        subtitle: "Thanks for joining our fashion community.",
      ),
    ];

    return mockUpNotifications.isNotEmpty
        ? _noNotificationWidget(context)
        : SingleChildScrollView(
            child: Column(
              children: [
                for (NotificationWidget i in mockUpNotifications)
                  i is DateLabel
                      ? DateLabel(date: (i).date)
                      : NotificationItem(
                          title: (i as NotificationItem).title,
                          subtitle: (i).subtitle,
                        ),
              ],
            ),
          );
  }
}
