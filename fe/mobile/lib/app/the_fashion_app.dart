import 'package:flutter/material.dart';
import 'package:mobile/app/app_theme.dart';
import 'package:mobile/app/app_router.dart';
import 'package:sizer/sizer.dart';

class TheFashionApp extends StatelessWidget {
  const TheFashionApp._internal();

  static final TheFashionApp instance = TheFashionApp._internal();

  factory TheFashionApp() => instance;

  @override
  Widget build(BuildContext context) {
    return Sizer(
      builder: (context, orientation, screenType) {
        return MaterialApp.router(
          theme: AppTheme.lightTheme,
          routerConfig: AppRouter.router,
        );
      },
    );
  }
}
