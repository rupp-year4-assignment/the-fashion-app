import 'package:flutter/material.dart';
import 'package:mobile/core/resource/asset_manager.dart';
import 'package:mobile/core/widgets/app_layout.dart';
import 'package:sizer/sizer.dart';

class BoardingScreen extends StatelessWidget {
  const BoardingScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AppLayout(
        child: SizedBox(
          height: 100.h,
          child: Stack(
            children: [
              Text(
                "Define yourself in your unique way.",
                style: Theme.of(context).textTheme.headlineLarge,
              ),
              Align(
                alignment: .bottomCenter,
                child: Image.asset(
                  AssetManager().images.boarding01,
                  width: 85.w,
                  fit: BoxFit.contain,
                ),
              ),
              Align(
                alignment: .bottomCenter,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(side: .none),
                  onPressed: () {},
                  child: Row(
                    spacing: 10,
                    mainAxisAlignment: .center,
                    children: [
                      Text(
                        "Get Started",
                        style: Theme.of(context).textTheme.bodyMedium,
                      ),
                      Icon(Icons.arrow_forward),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
