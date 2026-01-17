import 'package:flutter/material.dart';
import 'package:mobile/core/widgets/input_field_widget.dart';
import 'package:mobile/core/resource/color.dart';
import 'package:mobile/core/resource/spacing.dart';
import 'package:mobile/core/widgets/app_layout.dart';

class ForgotPasswordScreen extends StatelessWidget {
  const ForgotPasswordScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(onPressed: () {}, icon: Icon(Icons.arrow_back)),
      ),
      body: AppLayout(
        child: Column(
          spacing: Spacing.md,
          children: [
            Column(
              spacing: Spacing.xs,
              crossAxisAlignment: .start,
              children: [
                Text(
                  "Forgot password",
                  style: Theme.of(context).textTheme.labelLarge,
                ),
                Text(
                  "Enter your email for the verification process. We will send 4 digits code to your email.",
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                    color: ColorManager.lightTextSecondary,
                    fontWeight: .normal,
                  ),
                ),
              ],
            ),
            InputFieldWidget(label: "Email", hintText: "Enter your email"),
            Spacer(),
            ElevatedButton(onPressed: () {}, child: Text("Send Code")),
          ],
        ),
      ),
    );
  }
}
