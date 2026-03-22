import 'package:flutter/material.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';

class AppScreenHeader extends StatelessWidget {
  const AppScreenHeader({
    super.key,
    required this.title,
    this.leading,
    this.trailing,
    this.centerTitle = true,
    this.showDivider = true,
    this.padding = const EdgeInsets.fromLTRB(8, 12, 24, 0),
    this.titleStyle,
  });

  final String title;
  final Widget? leading;
  final Widget? trailing;
  final bool centerTitle;
  final bool showDivider;
  final EdgeInsets padding;
  final TextStyle? titleStyle;

  @override
  Widget build(BuildContext context) {
    final resolvedTitleStyle =
        titleStyle ?? AppTextStyles.h2SemiBold.copyWith(fontSize: 20);

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Padding(
          padding: padding,
          child: Row(
            children: [
              _HeaderSlot(child: leading),
              Expanded(
                child: centerTitle
                    ? Center(child: Text(title, style: resolvedTitleStyle))
                    : Align(
                        alignment: Alignment.centerLeft,
                        child: Text(title, style: resolvedTitleStyle),
                      ),
              ),
              _HeaderSlot(child: trailing),
            ],
          ),
        ),
        if (showDivider) const Divider(color: AppColors.primary100),
      ],
    );
  }
}

class _HeaderSlot extends StatelessWidget {
  const _HeaderSlot({required this.child});

  final Widget? child;

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 48,
      height: 48,
      child: child ?? const SizedBox.shrink(),
    );
  }
}
