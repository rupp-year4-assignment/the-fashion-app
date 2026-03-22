import 'package:flutter/material.dart';
import 'package:mobile/app/theme/app_colors.dart';

class AuthPatternBackground extends StatelessWidget {
  const AuthPatternBackground({super.key, required this.child});

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned.fill(child: CustomPaint(painter: _PatternPainter())),
        child,
      ],
    );
  }
}

class _PatternPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = AppColors.primary100
      ..style = PaintingStyle.stroke
      ..strokeWidth = 1;

    for (int i = 0; i < 7; i++) {
      final topOffset = (size.height * 0.1) + (i * size.height * 0.12);
      final path = Path()
        ..moveTo(-30, topOffset)
        ..quadraticBezierTo(
          size.width * 0.35,
          topOffset - 35,
          size.width + 25,
          topOffset + 18,
        );
      canvas.drawPath(path, paint);
    }

    for (int i = 0; i < 5; i++) {
      final leftOffset = (i * size.width * 0.2) - 20;
      final path = Path()
        ..moveTo(leftOffset, -20)
        ..quadraticBezierTo(
          leftOffset + 35,
          size.height * 0.35,
          leftOffset - 10,
          size.height + 25,
        );
      canvas.drawPath(path, paint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
