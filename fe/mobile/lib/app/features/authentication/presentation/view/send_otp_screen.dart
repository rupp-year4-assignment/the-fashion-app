import 'package:flutter/material.dart';
import 'package:mobile/app/features/authentication/presentation/widgets/otp_code_input.dart';
import 'package:mobile/core/resource/spacing.dart';
import 'package:mobile/core/widgets/app_layout.dart';
import 'package:mobile/core/resource/color.dart';
import 'package:sizer/sizer.dart';

class SendOtpScreen extends StatelessWidget {
  const SendOtpScreen({super.key});

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
                  "Enter 4 Digit Code",
                  style: Theme.of(context).textTheme.labelLarge,
                ),
                Text(
                  "Enter 4 digit code that your receive on your email.",

                  style: Theme.of(context).textTheme.labelMedium?.copyWith(
                    color: ColorManager.lightTextSecondary,
                    fontWeight: .normal,
                  ),
                ),
              ],
            ),
            _buildOtpInputField(),
            SizedBox(
              width: 80.w,
              child: RichText(
                textAlign: .center,
                text: TextSpan(
                  text: "Email not received? ",
                  style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                    color: ColorManager.lightTextSecondary,
                  ),
                  children: [
                    TextSpan(
                      text: "Resend Code",
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: ColorManager.lightTextPrimary,
                        decoration: .underline,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Spacer(),
            ElevatedButton(onPressed: () {}, child: Text("Continue")),
          ],
        ),
      ),
    );
  }

  Widget _buildOtpInputField() {
    return Row(
      mainAxisAlignment: .center,
      children: [OtpInput(onCompleted: (value) {}, length: 4)],
    );
  }
}
