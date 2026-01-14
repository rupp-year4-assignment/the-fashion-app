import 'package:flutter/material.dart';
import 'package:mobile/core/resource/radius.dart';

class OtpInput extends StatefulWidget {
  final int length;
  final double cornerRadius;
  final Function(String) onCompleted;

  const OtpInput({
    super.key,
    this.length = 4,
    required this.onCompleted,
    this.cornerRadius = AppRadius.defaultRadius,
  });

  @override
  State<OtpInput> createState() => _OtpInputState();
}

class _OtpInputState extends State<OtpInput> {
  late List<FocusNode> _focusNodes;
  late List<TextEditingController> _controllers;

  @override
  void initState() {
    super.initState();
    _focusNodes = List.generate(widget.length, (_) => FocusNode());
    _controllers = List.generate(widget.length, (_) => TextEditingController());
  }

  @override
  void dispose() {
    for (var node in _focusNodes) {
      node.dispose();
    }
    for (var controller in _controllers) {
      controller.dispose();
    }
    super.dispose();
  }

  void _onChanged(String value, int index) {
    if (value.length == 1 && index < widget.length - 1) {
      _focusNodes[index + 1].requestFocus();
    }
    if (value.isEmpty && index > 0) {
      _focusNodes[index - 1].requestFocus();
    }

    String otp = _controllers.map((c) => c.text).join();
    if (otp.length == widget.length) {
      widget.onCompleted(otp);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: .start,
      children: List.generate(widget.length, (index) {
        return Container(
          width: (MediaQuery.sizeOf(context).width / widget.length) * 0.8,
          margin: .symmetric(horizontal: 5),
          child: TextField(
            controller: _controllers[index],
            focusNode: _focusNodes[index],
            keyboardType: TextInputType.number,
            textAlign: TextAlign.center,
            maxLength: 1,
            decoration: InputDecoration(
              contentPadding: .symmetric(vertical: 20),
              counterText: '',
              filled: true,
              fillColor: Colors.grey.shade200,
              border: OutlineInputBorder(
                borderSide: .none,
                borderRadius: .circular(widget.cornerRadius),
              ),
            ),
            onChanged: (value) => _onChanged(value, index),
          ),
        );
      }),
    );
  }
}
