import 'package:flutter/material.dart';
import 'package:mobile/core/resource/asset_manager.dart';
import 'package:sizer/sizer.dart';

class SplashScreen extends StatelessWidget {
  const SplashScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SizedBox(
        height: 100.h,
        child: Stack(
          children: [
            Image.asset(
              AssetManager().images.splash01,
              fit: .cover,
              width: 100.w,
            ),
            Positioned(
              top: 18.h,
              left: 1.w,
              child: Image.asset(
                width: 80.w,
                AssetManager().images.logo,
                fit: .contain,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
