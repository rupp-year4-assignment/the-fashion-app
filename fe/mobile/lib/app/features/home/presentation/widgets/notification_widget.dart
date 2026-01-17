import 'package:flutter/material.dart';

sealed class NotificationWidget {}

class DateLabel extends StatelessWidget implements NotificationWidget {
  final String date;

  const DateLabel({super.key, required this.date});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: .start,
      children: [Text(date, style: Theme.of(context).textTheme.bodyLarge)],
    );
  }
}

class NotificationItem extends StatelessWidget implements NotificationWidget {
  final Widget icon;
  final String title;
  final String subtitle;

  const NotificationItem({
    super.key,
    this.icon = const Icon(Icons.notifications),
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(Icons.notifications),
      title: Text(title, style: Theme.of(context).textTheme.bodyLarge),
      subtitle: Text(
        subtitle,
        style: Theme.of(
          context,
        ).textTheme.bodyMedium?.copyWith(color: Colors.black),
      ),
    );
  }
}
