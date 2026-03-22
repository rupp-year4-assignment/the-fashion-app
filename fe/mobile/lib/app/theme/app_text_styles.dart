import 'package:flutter/material.dart';
import 'package:mobile/app/theme/app_colors.dart';

class AppTextStyles {
  const AppTextStyles._();

  static const TextStyle h1SemiBold = TextStyle(
    fontFamily: 'Poppins',
    fontWeight: FontWeight.w600,
    fontSize: 64,
    letterSpacing: -5,
    height: 0.8,
    color: AppColors.primary900,
  );

  static const TextStyle h2SemiBold = TextStyle(
    fontFamily: 'Poppins',
    fontWeight: FontWeight.w600,
    fontSize: 32,
    letterSpacing: -1.6,
    height: 1.0,
    color: AppColors.primary900,
  );

  static const TextStyle b1Medium = TextStyle(
    fontFamily: 'Poppins',
    fontWeight: FontWeight.w500,
    fontSize: 16,
    height: 1.4,
    color: AppColors.primary900,
  );

  static const TextStyle b1Regular = TextStyle(
    fontFamily: 'Poppins',
    fontWeight: FontWeight.w400,
    fontSize: 16,
    height: 1.4,
    color: AppColors.primary900,
  );

  static const TextStyle b2Regular = TextStyle(
    fontFamily: 'Poppins',
    fontWeight: FontWeight.w400,
    fontSize: 14,
    height: 1.4,
    color: AppColors.primary500,
  );
}
