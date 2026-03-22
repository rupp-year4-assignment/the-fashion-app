import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/app/the_fashion_app.dart';

void main() {
  testWidgets('renders splash screen on startup', (WidgetTester tester) async {
    await tester.pumpWidget(const ProviderScope(child: TheFashionApp()));

    expect(find.text('THE FASHION'), findsOneWidget);

    await tester.pump(const Duration(seconds: 3));
  });
}
