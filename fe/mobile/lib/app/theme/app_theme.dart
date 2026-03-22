import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';

class AppTheme {
  const AppTheme._();

  static ThemeData get light {
    final baseTextTheme = GoogleFonts.poppinsTextTheme();

    return ThemeData(
      useMaterial3: false,
      fontFamily: 'Poppins',
      scaffoldBackgroundColor: AppColors.primary0,
      primaryColor: AppColors.primary900,
      colorScheme: const ColorScheme.light(
        primary: AppColors.primary900,
        onPrimary: AppColors.primary0,
        surface: AppColors.primary0,
        onSurface: AppColors.primary900,
        error: AppColors.error,
      ),
      textTheme: baseTextTheme.copyWith(
        headlineLarge: AppTextStyles.h1SemiBold,
        headlineMedium: AppTextStyles.h2SemiBold,
        bodyLarge: AppTextStyles.b1Regular,
        bodyMedium: AppTextStyles.b2Regular,
        labelLarge: AppTextStyles.b1Medium,
      ),
      appBarTheme: const AppBarTheme(
        elevation: 0,
        backgroundColor: AppColors.primary0,
        foregroundColor: AppColors.primary900,
        centerTitle: false,
        titleTextStyle: TextStyle(
          fontFamily: 'Poppins',
          fontWeight: FontWeight.w600,
          fontSize: 24,
          color: AppColors.primary900,
          letterSpacing: -0.8,
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: AppColors.primary0,
        hintStyle: AppTextStyles.b1Regular.copyWith(
          color: AppColors.primary400,
        ),
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 20,
          vertical: 14,
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.primary100),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.primary900, width: 1.4),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.error),
        ),
        focusedErrorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
          borderSide: const BorderSide(color: AppColors.error, width: 1.4),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          minimumSize: const Size.fromHeight(54),
          backgroundColor: AppColors.primary900,
          foregroundColor: AppColors.primary0,
          disabledBackgroundColor: AppColors.primary200,
          disabledForegroundColor: AppColors.primary0,
          textStyle: AppTextStyles.b1Medium,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
      ),
      dividerTheme: const DividerThemeData(
        thickness: 1,
        color: AppColors.primary100,
      ),
    );
  }
}
