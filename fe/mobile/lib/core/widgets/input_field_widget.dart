import 'package:flutter/material.dart';
import 'package:mobile/core/resource/color.dart';
import 'package:mobile/core/resource/radius.dart';

class InputFieldWidget extends StatefulWidget {
  final String hintText;
  final String? label;
  final String? Function(String?)? validator;
  final bool isObscuredText;
  final TextEditingController controller;
  final void Function(bool)? onErrorChanged;
  final Widget? suffixIcon;
  final Widget? prefixIcon;

  InputFieldWidget({
    super.key,
    this.hintText = 'hint text',
    this.isObscuredText = false,
    this.label,
    TextEditingController? controller,
    this.validator,
    this.onErrorChanged,
    this.prefixIcon,
    this.suffixIcon,
  }) : controller = controller ?? TextEditingController();

  @override
  State<InputFieldWidget> createState() => _InputFieldWidgetState();
}

class _InputFieldWidgetState extends State<InputFieldWidget> {
  bool isVisible = false;
  String? errorText;
  late FocusNode _focusNode;

  @override
  void initState() {
    super.initState();
    isVisible = widget.isObscuredText;
    _focusNode = FocusNode();
    _focusNode.addListener(_onFocusChange);
  }

  void _onFocusChange() {
    if (!_focusNode.hasFocus) {
      final error = widget.validator?.call(widget.controller.text);
      setState(() {
        errorText = error;
      });
      widget.onErrorChanged?.call(error != null);
    }
  }

  @override
  void dispose() {
    _focusNode.removeListener(_onFocusChange);
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final hasError = errorText != null;

    return Column(
      crossAxisAlignment: .start,
      spacing: 10,
      children: [
        if (widget.label != null)
          Text(widget.label!, style: Theme.of(context).textTheme.labelMedium),
        TextFormField(
          controller: widget.controller,
          obscureText: isVisible,
          focusNode: _focusNode,
          validator: widget.validator,

          autovalidateMode: .onUnfocus,
          decoration: InputDecoration(
            prefixIcon: widget.prefixIcon,
            contentPadding: .symmetric(horizontal: 5, vertical: 15),
            hintText: widget.hintText,
            hintStyle: Theme.of(
              context,
            ).textTheme.bodyLarge?.copyWith(color: Colors.grey),
            suffixIcon:
                widget.suffixIcon ??
                (widget.isObscuredText
                    ? GestureDetector(
                        onTap: () => setState(() => isVisible = !isVisible),
                        child: Icon(
                          isVisible
                              ? Icons.visibility_off_rounded
                              : Icons.visibility_outlined,
                          color: hasError ? Colors.red : Colors.black,
                        ),
                      )
                    : null),
            errorText: errorText,
            errorBorder: OutlineInputBorder(
              borderSide: .none,
              borderRadius: .circular(AppRadius.defaultRadius),
            ),
            focusedBorder: OutlineInputBorder(
              borderSide: BorderSide(color: Colors.green, width: 2),
              borderRadius: .circular(AppRadius.defaultRadius),
            ),
            border: OutlineInputBorder(
              borderSide: BorderSide(
                color: ColorManager.lightSecondaryButtonColor,
              ),
              borderRadius: .circular(AppRadius.defaultRadius),
            ),
          ),
          cursorColor: hasError ? Colors.red : Colors.green,
        ),
      ],
    );
  }
}
