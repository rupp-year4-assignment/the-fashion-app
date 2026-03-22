import 'package:flutter/material.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';

class AppButton extends StatelessWidget {
  const AppButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.isLoading = false,
    this.enabled = true,
    this.leading,
    this.backgroundColor,
    this.foregroundColor,
    this.borderSide,
    this.height = 54,
  });

  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool enabled;
  final Widget? leading;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final BorderSide? borderSide;
  final double height;

  @override
  Widget build(BuildContext context) {
    final canPress = enabled && !isLoading && onPressed != null;
    final Color resolvedBackground = canPress
        ? (backgroundColor ?? AppColors.primary900)
        : AppColors.primary200;
    final Color resolvedForeground = foregroundColor ?? AppColors.primary0;

    return SizedBox(
      width: double.infinity,
      height: height,
      child: ElevatedButton(
        onPressed: canPress ? onPressed : null,
        style: ElevatedButton.styleFrom(
          elevation: 0,
          backgroundColor: resolvedBackground,
          foregroundColor: resolvedForeground,
          disabledBackgroundColor: AppColors.primary200,
          disabledForegroundColor: resolvedForeground,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(10),
            side: borderSide ?? BorderSide.none,
          ),
        ),
        child: isLoading
            ? SizedBox(
                width: 20,
                height: 20,
                child: CircularProgressIndicator(
                  strokeWidth: 2,
                  color: resolvedForeground,
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  if (leading != null) ...[leading!, const SizedBox(width: 8)],
                  Text(
                    label,
                    style: AppTextStyles.b1Medium.copyWith(
                      color: resolvedForeground,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}
