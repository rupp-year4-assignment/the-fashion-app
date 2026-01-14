// GENERATED CODE - DO NOT MODIFY BY HAND

// **************************************************************************
// AssetFolderGenerator
// **************************************************************************

part of 'asset_manager.dart';

class AssetPath {
  const AssetPath._();

  static String icons(String assetName) => 'assets/icons/$assetName';
  static String images(String assetName) => 'assets/images/$assetName';
}

abstract class _AssetManagerContext {
  _Icons icons = _Icons();
  _Images images = _Images();
}

class _Icons {
  final String google = AssetPath.icons("google.png");
  final String facebook = AssetPath.icons("facebook.png");
}

class _Images {
  final String splash01 = AssetPath.images("splash_01.png");
  final String logo = AssetPath.images("logo.png");
  final String boarding01 = AssetPath.images("boarding_01.png");
  final String boarding02 = AssetPath.images("boarding_02.png");
}
