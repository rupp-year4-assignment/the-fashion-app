import 'package:lazy_asset_generator/lazy_asset_generator/annotations.dart';

part 'asset_manager.g.dart';

@GenerateAssets(folders: ["icons", "images"])
class AssetManager extends _AssetManagerContext {}
