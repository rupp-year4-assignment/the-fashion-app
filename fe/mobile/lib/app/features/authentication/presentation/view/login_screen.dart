import 'package:flutter/material.dart';
import 'package:mobile/app/features/authentication/presentation/widgets/input_field_widget.dart';
import 'package:mobile/core/resource/spacing.dart';
import 'package:mobile/core/widgets/app_layout.dart';
import 'package:mobile/core/resource/color.dart';
import 'package:mobile/core/resource/asset_manager.dart';
import 'package:sizer/sizer.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AppLayout(
        child: Column(
          crossAxisAlignment: .start,
          spacing: Spacing.md,
          children: [
            Column(
              crossAxisAlignment: .start,
              spacing: Spacing.xs,
              children: [
                Text(
                  "Login to your account",
                  style: Theme.of(context).textTheme.labelLarge,
                ),
                Text(
                  "It’s great to see you again.",
                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                    color: ColorManager.lightTextSecondary,
                    fontWeight: .normal,
                  ),
                ),
              ],
            ),
            _buildForm(context),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: ColorManager.lightPrimaryButtonColor,
                foregroundColor: Colors.white,
              ),

              onPressed: () {},
              child: Text("Login"),
            ),
            Row(
              children: [
                Expanded(
                  child: Divider(color: ColorManager.lightTextSecondary),
                ),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12),
                  child: Text(
                    'Or',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: ColorManager.lightTextSecondary,
                    ),
                  ),
                ),
                Expanded(
                  child: Divider(color: ColorManager.lightTextSecondary),
                ),
              ],
            ),
            Column(
              spacing: 15,
              children: [
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ColorManager.transparent,
                    foregroundColor: ColorManager.lightTextPrimary,
                  ),
                  onPressed: () {},
                  child: Row(
                    spacing: 10,
                    mainAxisAlignment: .center,
                    children: [
                      Image.asset(
                        AssetManager().icons.google,
                        height: 24,
                        width: 24,
                      ),
                      Text("Google"),
                    ],
                  ),
                ),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: ColorManager.lightSecondaryButtonColor,
                    foregroundColor: Colors.white,
                  ),
                  onPressed: () {},
                  child: Row(
                    spacing: 10,
                    mainAxisAlignment: .center,
                    children: [
                      Image.asset(
                        AssetManager().icons.facebook,
                        height: 24,
                        width: 24,
                      ),
                      Text("Facebook"),
                    ],
                  ),
                ),
              ],
            ),
            Spacer(),
            Center(
              child: RichText(
                text: TextSpan(
                  text: "Don't have an account? ",
                  style: Theme.of(context).textTheme.bodyLarge,
                  children: [
                    TextSpan(
                      text: "Join",
                      style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                        color: ColorManager.lightPrimary,
                        fontWeight: .bold,
                        decoration: .underline,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildForm(BuildContext context) {
    return Form(
      child: Column(
        crossAxisAlignment: .start,
        spacing: 15,
        children: [
          InputFieldWidget(label: "Email", hintText: "Enter your email"),
          InputFieldWidget(
            label: "Password",
            hintText: "Enter your password",
            isObscuredText: true,
          ),
          SizedBox(
            width: 80.w,
            child: RichText(
              textAlign: .justify,
              text: TextSpan(
                text: "By signing up you agree to our ",
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: ColorManager.lightTextSecondary,
                ),
                children: [
                  TextSpan(
                    text: "Terms, Privacy Policy, ",
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: ColorManager.lightTextPrimary,
                      decoration: .underline,
                    ),
                  ),
                  TextSpan(
                    text: "and ",
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: ColorManager.lightTextSecondary,
                    ),
                  ),
                  TextSpan(
                    text: "Cookie Use",
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                      color: ColorManager.lightTextPrimary,
                      decoration: .underline,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
