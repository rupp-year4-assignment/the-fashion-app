import 'package:flutter/material.dart';
import 'package:mobile/core/resource/app_size.dart';

class AppLayout extends StatelessWidget {
  final Widget child;
  const AppLayout({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: .symmetric(horizontal: AppSize.lg),
      child: SafeArea(child: child),
    );
  }
}
