import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:mobile/core/resource/color.dart';
import 'package:mobile/core/resource/radius.dart';
import 'package:sizer/sizer.dart';

sealed class AppTheme {
  static final lightTheme = ThemeData(
    brightness: Brightness.light,
    useMaterial3: true,
    textTheme: TextTheme(
      labelLarge: GoogleFonts.poppins(
        fontSize: 20.sp,
        color: ColorManager.lightTextPrimary,
        fontWeight: .bold,
      ),
      labelMedium: GoogleFonts.poppins(
        fontSize: 16.sp,
        fontWeight: .bold,
        color: ColorManager.lightTextPrimary,
      ),
      bodyMedium: GoogleFonts.poppins(
        fontSize: 14.sp,
        color: ColorManager.lightTextWhite,
      ),
      bodySmall: GoogleFonts.poppins(
        fontSize: 12.sp,
        color: ColorManager.lightTextSecondary,
      ),
      bodyLarge: GoogleFonts.poppins(
        fontSize: 16.sp,
        color: ColorManager.lightTextSecondary,
      ),
      headlineLarge: GoogleFonts.poppins(
        height: 0.85,
        fontSize: 32.sp,
        fontWeight: .w900,
        color: ColorManager.lightTextPrimary,
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        side: BorderSide(color: ColorManager.lightSecondary),
        backgroundColor: ColorManager.lightPrimary,
        foregroundColor: Colors.white,
        disabledBackgroundColor: ColorManager.lightSecondary,
        disabledForegroundColor: ColorManager.lightBackground,
        textStyle: GoogleFonts.poppins(
          fontSize: 16.sp,
          fontWeight: FontWeight.w600,
        ),
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppRadius.defaultRadius),
        ),
        minimumSize: Size(double.infinity, 54),
      ),
    ),
    buttonTheme: ButtonThemeData(
      colorScheme: ColorScheme.light(
        primary: ColorManager.lightPrimary,
        secondary: ColorManager.lightSecondary,
      ),
      disabledColor: ColorManager.lightSecondary,
      height: 54,
      shape: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
    ),
    colorScheme: ColorScheme.light(
      primary: ColorManager.lightPrimary,
      secondary: ColorManager.lightSecondary,
      surface: ColorManager.lightBackground,
      error: ColorManager.lightError,
    ),
  );
}
