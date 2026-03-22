import 'package:flutter/material.dart';
import 'package:mobile/app/routes.dart';
import 'package:mobile/app/theme/app_theme.dart';

class TheFashionApp extends StatelessWidget {
  const TheFashionApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: AppTheme.light,
      initialRoute: AppRoutes.initialRoute,
      onGenerateRoute: AppRoutes.generateRoute,
    );
  }
}
