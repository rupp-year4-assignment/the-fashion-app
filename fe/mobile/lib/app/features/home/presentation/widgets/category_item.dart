import 'package:flutter/material.dart';
import 'package:mobile/core/resource/app_size.dart';
import 'package:mobile/core/resource/color.dart';
import 'package:mobile/core/resource/radius.dart';

class CategoryItem extends StatelessWidget {
  final Widget child;
  const CategoryItem({super.key, required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: .symmetric(horizontal: AppSize.s, vertical: AppSize.xs),
      decoration: BoxDecoration(
        color: ColorManager.lightPrimary,
        borderRadius: BorderRadius.circular(AppRadius.defaultRadius),
      ),
      child: Center(child: child),
    );
  }
}
