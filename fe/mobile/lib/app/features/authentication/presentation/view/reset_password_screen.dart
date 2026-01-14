import 'package:flutter/material.dart';
import 'package:mobile/app/features/authentication/presentation/widgets/input_field_widget.dart';
import 'package:mobile/core/resource/color.dart';
import 'package:mobile/core/resource/spacing.dart';
import 'package:mobile/core/widgets/app_layout.dart';

class ResetPasswordScreen extends StatelessWidget {
  const ResetPasswordScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(onPressed: () {}, icon: Icon(Icons.arrow_back)),
      ),

      body: AppLayout(
        child: Column(
          crossAxisAlignment: .start,
          spacing: Spacing.lg,
          children: [
            Column(
              spacing: Spacing.xs,
              crossAxisAlignment: .start,
              children: [
                Text(
                  "Reset Password",
                  style: Theme.of(context).textTheme.labelLarge,
                ),
                Text(
                  "Set the new password for your account so you can login and access all the features.",

                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                    color: ColorManager.lightTextSecondary,
                    fontWeight: .normal,
                  ),
                ),
              ],
            ),
            _buildForm(context),
            Spacer(),
            ElevatedButton(onPressed: () {}, child: Text("Continue")),
          ],
        ),
      ),
    );
  }

  // form widget
  Widget _buildForm(BuildContext context) {
    return Form(
      child: Column(
        crossAxisAlignment: .start,
        spacing: 15,
        children: [
          InputFieldWidget(
            label: "Password",
            hintText: "Enter your password",
            isObscuredText: true,
          ),
          InputFieldWidget(
            label: "Confirm Password",
            hintText: "Re-enter your password",
            isObscuredText: true,
          ),
        ],
      ),
    );
  }
}
