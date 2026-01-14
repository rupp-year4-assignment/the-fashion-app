import 'package:flutter/material.dart';
import 'package:mobile/core/utils/extensions/hex_color.dart';

sealed class ColorManager {
  static final transparent = Colors.transparent;
  // light
  static final lightPrimary = HexColor.fromHex("#1A1A1A");
  static final lightSecondary = HexColor.fromHex("#CCCCCC");
  static final lightBackground = HexColor.fromHex("#FFFFFF");
  static final lightError = HexColor.fromHex("#ED1010");
  static final lightTextPrimary = HexColor.fromHex("#1A1A1A");
  static final lightTextSecondary = HexColor.fromHex("#808080");
  static final lightTextWhite = HexColor.fromHex("#FFFFFF");

  static final lightPrimaryButtonColor = HexColor.fromHex("#CCCCCC");
  static final lightSecondaryButtonColor = HexColor.fromHex("#1877F2");

  // dark
  // static final darkPrimary = HexColor.fromHex("");
  // static final darkSecondary = HexColor.fromHex("");
  // static final darkBackground = HexColor.fromHex("");
  // static final darkError = HexColor.fromHex("");
  // static final darkTextPrimary = HexColor.fromHex("");
  // static final darkTextSecondary = HexColor.fromHex("");
}
