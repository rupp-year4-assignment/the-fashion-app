import 'package:flutter/material.dart';
import 'package:mobile/core/resource/app_size.dart';
import 'package:mobile/core/resource/color.dart';
import 'package:mobile/core/resource/spacing.dart';
import 'package:mobile/core/widgets/app_layout.dart';
import 'package:mobile/core/widgets/input_field_widget.dart';
import 'package:sizer/sizer.dart';

class SearchScreen extends StatelessWidget {
  const SearchScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: _buildAppBar(context),
      body: AppLayout(child: _buildBody(context)),
    );
  }

  // appbar
  AppBar _buildAppBar(BuildContext context) {
    return AppBar(
      surfaceTintColor: Colors.transparent,
      leading: IconButton(onPressed: () {}, icon: Icon(Icons.arrow_back)),
      centerTitle: true,
      actions: [
        Padding(
          padding: .symmetric(horizontal: AppSize.md),
          child: IconButton(
            onPressed: () {},
            icon: Icon(Icons.notifications_none),
          ),
        ),
      ],
      title: Text("Search", style: Theme.of(context).textTheme.titleLarge),
    );
  }

  Widget _buildBody(BuildContext context) {
    return [].isEmpty
        ? _searchNotFound(context)
        : Column(
            children: [
              const SizedBox(height: AppSize.md),
              InputFieldWidget(
                hintText: "Search products",
                prefixIcon: Icon(Icons.search),
                suffixIcon: Icon(Icons.mic),
              ),
              Row(
                children: [
                  Text(
                    "Recent Searches",
                    style: Theme.of(context).textTheme.labelMedium,
                  ),
                  Spacer(),
                  TextButton(
                    onPressed: () {},
                    child: Text(
                      "Clear All",
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                        color: Theme.of(context).colorScheme.primary,
                      ),
                    ),
                  ),
                ],
              ),
              ListTile(
                contentPadding: .zero,
                leading: Image.network(
                  "https://zandokh.com/image/cache/catalog/products/2025-12/21225111486/STU_8251-cr-450x672.jpg",
                  fit: .contain,
                ),
                title: Text("Summer Dress"),
                subtitle: Text("\$49.99"),
                trailing: IconButton(
                  onPressed: () {},
                  icon: Icon(Icons.arrow_forward_ios),
                ),
              ),

              for (var i in List.generate(3, (_) {}))
                ListTile(
                  contentPadding: .zero,
                  title: Text("Summer Dress"),
                  trailing: IconButton(
                    onPressed: () {},
                    icon: Icon(Icons.close),
                  ),
                ),
            ],
          );
  }

  Widget _searchNotFound(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppSize.xl2),
      child: Column(
        spacing: Spacing.md,
        mainAxisAlignment: .center,
        children: [
          Icon(Icons.search, size: 36.sp, color: Colors.grey.shade300),
          Column(
            spacing: Spacing.xs,
            children: [
              Text(
                "No Results Found!",
                textAlign: .center,
                style: Theme.of(context).textTheme.bodyLarge,
              ),
              Text(
                "Try a similar word or something more general.",
                textAlign: .center,
                style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                  color: ColorManager.lightSecondary,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
