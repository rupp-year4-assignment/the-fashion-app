import 'package:flutter/material.dart';
import 'package:mobile/app/features/home/presentation/view/notification_screen.dart';
import 'package:mobile/app/features/home/presentation/view/search_screen.dart';
import 'package:mobile/app/features/home/presentation/widgets/category_item.dart';
import 'package:mobile/app/features/home/presentation/widgets/product_card.dart';
import 'package:mobile/core/resource/radius.dart';
import 'package:mobile/core/resource/spacing.dart';
import 'package:mobile/core/widgets/input_field_widget.dart';
import 'package:mobile/core/resource/app_size.dart';
import 'package:sizer/sizer.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: PageView(
        children: [_buildBody(context), SearchScreen(), NotificationScreen()],
      ),
      bottomNavigationBar: _buildBottomNavigationBar(context),
    );
  }

  // body
  Widget _buildBody(BuildContext context) {
    return CustomScrollView(
      slivers: [
        SliverAppBar(
          pinned: true,
          floating: false,
          expandedHeight: 15.h,
          surfaceTintColor: Colors.transparent,
          actions: [
            IconButton(icon: const Icon(Icons.notifications), onPressed: () {}),
          ],
          flexibleSpace: FlexibleSpaceBar(
            titlePadding: .zero,
            title: Padding(
              padding: .symmetric(horizontal: AppSize.md, vertical: AppSize.s),
              child: Row(
                mainAxisAlignment: .spaceBetween,
                children: [
                  Text(
                    "Discover",
                    style: Theme.of(context).textTheme.labelLarge,
                  ),
                ],
              ),
            ),
            background: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.only(
                  bottomRight: Radius.circular(AppRadius.defaultRadius * 10),
                ),
                gradient: LinearGradient(
                  colors: [Colors.pink.shade50, Colors.pink.shade100],
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                ),
              ),
            ),
          ),
        ),
        SliverToBoxAdapter(
          child: Column(
            crossAxisAlignment: .start,
            children: [
              SizedBox(height: Spacing.lg),
              _buildSearchAndFilter(context),
              SizedBox(height: Spacing.md),
              _buildCategoriesList(context),
              SizedBox(height: Spacing.md),
            ],
          ),
        ),
        _buildContents(context),
      ],
    );
  }

  // search and filter
  Widget _buildSearchAndFilter(BuildContext context) {
    return Padding(
      padding: .symmetric(horizontal: AppSize.md),
      child: Row(
        spacing: Spacing.md,
        children: [
          Expanded(
            child: InputFieldWidget(
              hintText: "Search for clothes..",
              prefixIcon: Icon(Icons.search),
              suffixIcon: Icon(Icons.mic),
            ),
          ),
          GestureDetector(
            onTap: () {
              showModalBottomSheet(
                context: context,
                builder: (context) => _buildBottomSheet(context),
              );
            },
            child: Container(
              padding: .all(AppSize.s),
              decoration: BoxDecoration(
                color: Colors.black,
                borderRadius: BorderRadius.circular(AppRadius.defaultRadius),
              ),
              child: Icon(Icons.filter_list, color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }

  // categories list
  Widget _buildCategoriesList(BuildContext context) {
    return SizedBox(
      height: 50,
      child: ListView.separated(
        padding: .symmetric(horizontal: AppSize.md),
        scrollDirection: .horizontal,
        itemBuilder: (context, index) {
          return CategoryItem(child: Text("Category $index"));
        },
        separatorBuilder: (context, index) => SizedBox(width: Spacing.sm),
        itemCount: 5,
      ),
    );
  }

  Widget _buildContents(BuildContext context) {
    return SliverPadding(
      padding: .symmetric(horizontal: AppSize.md),
      sliver: SliverGrid.builder(
        itemCount: 10,
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.62,
          mainAxisSpacing: Spacing.md,
          crossAxisSpacing: Spacing.md,
        ),
        itemBuilder: (context, index) {
          return ProductCard(productName: "Product $index", price: 29.99);
        },
      ),
    );
  }

  // bottomsheet
  Widget _buildBottomSheet(BuildContext context) {
    return BottomSheet(
      onClosing: () {},
      builder: (context) {
        return Column(
          spacing: Spacing.sm,
          crossAxisAlignment: .start,
          mainAxisSize: .min,
          children: [
            Padding(
              padding: .symmetric(horizontal: AppSize.lg),
              child: Row(
                mainAxisAlignment: .spaceBetween,
                children: [
                  Text(
                    "Filter Options",
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
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
            ),
            Padding(
              padding: .all(AppSize.lg),
              child: Text(
                "Sort by",
                style: Theme.of(context).textTheme.bodyLarge,
              ),
            ),
            SizedBox(
              height: 50,
              child: ListView.separated(
                padding: .symmetric(horizontal: AppSize.lg),
                itemCount: 10,
                separatorBuilder: (context, index) =>
                    SizedBox(width: Spacing.sm),
                scrollDirection: .horizontal,
                itemBuilder: (context, index) {
                  return CategoryItem(child: Text("Category $index"));
                },
              ),
            ),
            Padding(
              padding: .only(
                left: AppSize.lg,
                right: AppSize.lg,
                bottom: AppSize.lg,
              ),
              child: Column(
                spacing: Spacing.md,
                children: [
                  Row(
                    mainAxisAlignment: .spaceBetween,
                    children: [
                      Text(
                        "Price",
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                      Text(
                        "\$20 - \$80",
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                    ],
                  ),
                  RangeSlider(
                    values: RangeValues(0, 0),
                    min: 0,
                    max: 100,
                    divisions: 5,
                    labels: RangeLabels("20", "80"),
                    onChanged: (RangeValues values) {},
                  ),
                  Row(
                    children: [
                      Text(
                        "Size",
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                      Spacer(),
                      DropdownMenu(
                        dropdownMenuEntries: List.generate(
                          3,
                          (index) => DropdownMenuEntry(
                            labelWidget: Text("Size $index"),
                            value: index,
                            label: "Size $index",
                          ),
                        ),
                      ),
                    ],
                  ),
                  ElevatedButton(
                    onPressed: () {},
                    child: Text("Apply Filters"),
                  ),
                ],
              ),
            ),
          ],
        );
      },
    );
  }

  // build bottom
  Widget _buildBottomNavigationBar(BuildContext context) {
    return BottomNavigationBar(
      type: .fixed,
      items: const [
        BottomNavigationBarItem(icon: Icon(Icons.home), label: "Home"),
        BottomNavigationBarItem(icon: Icon(Icons.search), label: "Search"),
        BottomNavigationBarItem(icon: Icon(Icons.favorite), label: "Saved"),
        BottomNavigationBarItem(icon: Icon(Icons.shopping_cart), label: "Cart"),
        BottomNavigationBarItem(icon: Icon(Icons.person), label: "Account"),
      ],
    );
  }
}
