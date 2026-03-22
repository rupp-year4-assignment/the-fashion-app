# 🎨 The Fashion App — UI Implementation Instructions

> Generated from Figma: `zKhPgagrzZ534vBlTHFFpS` (The Fashion — Group 04)
> Stack: **Flutter + Dart + Riverpod**

---

## 📐 Design System

### Colors

```dart
// lib/app/theme/app_colors.dart
static const Color primary900 = Color(0xFF1A1A1A); // Main black
static const Color primary800 = Color(0xFF333333);
static const Color primary500 = Color(0xFF808080); // Subtitle gray
static const Color primary400 = Color(0xFF999999); // Hint gray
static const Color primary200 = Color(0xFFCCCCCC); // Disabled
static const Color primary100 = Color(0xFFE6E6E6); // Border / divider
static const Color primary0   = Color(0xFFFFFFFF); // White
static const Color facebookBlue = Color(0xFF1877F2);
```

### Typography (Poppins font)

```dart
// lib/app/theme/app_text_styles.dart
static const TextStyle h1SemiBold = TextStyle(
  fontFamily: 'Poppins', fontWeight: FontWeight.w600,
  fontSize: 64, letterSpacing: -5, height: 0.8,
);
static const TextStyle h2SemiBold = TextStyle(
  fontFamily: 'Poppins', fontWeight: FontWeight.w600,
  fontSize: 32, letterSpacing: -1.6, height: 1.0,
);
static const TextStyle b1Medium = TextStyle(
  fontFamily: 'Poppins', fontWeight: FontWeight.w500,
  fontSize: 16, height: 1.4,
);
static const TextStyle b1Regular = TextStyle(
  fontFamily: 'Poppins', fontWeight: FontWeight.w400,
  fontSize: 16, height: 1.4,
);
static const TextStyle b2Regular = TextStyle(
  fontFamily: 'Poppins', fontWeight: FontWeight.w400,
  fontSize: 14, height: 1.4,
);
```

### Spacing & Shape

```
Padding horizontal:  24px
Border radius:       10px (buttons, inputs)
Button height:       54px (primary), 56px (social)
Input height:        52px
Bottom nav height:   86px
```

---

## 📁 Folder Structure to Create

```
lib/
├── app/
│   ├── theme/
│   │   ├── app_colors.dart         ← Color tokens
│   │   ├── app_text_styles.dart    ← Text styles
│   │   └── app_theme.dart          ← ThemeData
│   ├── routes.dart                 ← Already exists
│   └── the_fashion_app.dart        ← Already exists
├── features/
│   ├── auth/
│   │   └── screens/
│   │       ├── splash_screen.dart       ← Already exists
│   │       ├── onboarding_screen.dart   ← UPDATE
│   │       ├── login_screen.dart        ← UPDATE
│   │       ├── register_screen.dart     ← Already exists
│   │       ├── forgot_password_screen.dart   ← CREATE
│   │       └── verification_screen.dart      ← CREATE
│   ├── home/
│   │   └── screens/
│   │       └── home_screen.dart         ← CREATE (Discover)
│   ├── product/
│   │   └── screens/
│   │       └── product_detail_screen.dart ← CREATE
│   ├── cart/
│   │   └── screens/
│   │       ├── cart_screen.dart         ← CREATE
│   │       └── checkout_screen.dart     ← CREATE
│   ├── orders/
│   │   └── screens/
│   │       ├── orders_screen.dart       ← CREATE
│   │       └── track_order_screen.dart  ← CREATE
│   ├── account/
│   │   └── screens/
│   │       ├── account_screen.dart      ← CREATE
│   │       ├── my_details_screen.dart   ← CREATE
│   │       ├── address_screen.dart      ← CREATE
│   │       ├── notifications_screen.dart← CREATE
│   │       ├── faqs_screen.dart         ← CREATE
│   │       └── help_center_screen.dart  ← CREATE
│   └── search/
│       └── screens/
│           └── search_screen.dart       ← CREATE
├── widgets/
│   ├── app_button.dart             ← Reusable primary button
│   ├── app_text_field.dart         ← Reusable input field
│   ├── app_bottom_nav.dart         ← Bottom navigation bar
│   └── product_card.dart           ← Product card widget
```

---

## 🔴 Step 1 — Setup Theme

**File:** `lib/app/theme/app_colors.dart`

- Define all color constants from the design system above

**File:** `lib/app/theme/app_text_styles.dart`

- Define all text styles (h1, h2, b1Medium, b1Regular, b2Regular)

**File:** `lib/app/theme/app_theme.dart`

- Create `ThemeData` with:
  - `fontFamily: 'Poppins'`
  - `scaffoldBackgroundColor: Colors.white`
  - `primaryColor: Color(0xFF1A1A1A)`
  - Custom `AppBarTheme`, `InputDecorationTheme`, `ElevatedButtonTheme`

**pubspec.yaml** — Add Poppins font:

```yaml
fonts:
  - family: Poppins
    fonts:
      - asset: assets/fonts/Poppins-Regular.ttf
      - asset: assets/fonts/Poppins-Medium.ttf   weight: 500
      - asset: assets/fonts/Poppins-SemiBold.ttf weight: 600
```

---

## 🔴 Step 2 — Reusable Widgets

### `AppButton` widget

```
- Full width, height: 54px
- Rounded: 10px
- Background: #1A1A1A (active), #CCCCCC (disabled/loading)
- Text: white, Poppins Medium 16px
- Optional: leading icon (arrow-right)
- Loading state: shows CircularProgressIndicator
```

### `AppTextField` widget

```
- Label above the field (Poppins Medium 16px, #1A1A1A)
- Border: 1px solid #E6E6E6, radius 10px
- Height: 52px, padding horizontal: 20px
- Hint text: Poppins Regular 16px, #999999
- Optional: trailing icon (eye toggle for password)
- Error state: red border + error text below
```

### `AppBottomNav` widget

```
- Height: 86px, white background, top border #E6E6E6
- 4 tabs: Home, Search, Cart, Account
- Active tab icon: filled + #1A1A1A color
- Inactive tab icon: outline + #808080 color
- No labels (icon only)
```

### `ProductCard` widget (Horizontal — 161×246px)

```
- Image area: 161×174px, rounded corners
- Heart icon top-right (outlined = not saved, filled red = saved)
- Product name: Poppins Regular, 2 lines max
- Price: Poppins Regular 14px, #1A1A1A
- Optional discount badge (e.g. "-52%")
```

---

## 🟡 Step 3 — Auth Screens

### Screen: `SplashScreen` (already exists)

```
- White background
- Decorative circular vector pattern (use asset image)
- Fashion brand logo/image centered
- Auto-navigates after 2s:
    → If token exists → HomeScreen
    → If no token → OnboardingScreen
```

### Screen: `OnboardingScreen`

```
Layout (390×844px):
- Background: white with decorative vector circles pattern
- Large bold text top-left:
    "Define yourself in your unique way."
    Font: Poppins SemiBold 64px, #1A1A1A, letter-spacing -5
- Fashion model image overlapping (bottom half)
- Bottom bar (white, top border):
    → "Get Started" button (full width, black, 54px)
    → Uses AppButton widget
    → Navigate to: LoginScreen (or RegisterScreen)
```

### Screen: `LoginScreen`

```
Layout:
- Title: "Login to your account" — Poppins SemiBold 32px
- Subtitle: "It's great to see you again." — Poppins Regular 16px #808080
- Email field (AppTextField)
- Password field (AppTextField with eye toggle)
- "Forgot your password? Reset your password" link — 14px, underlined
- Login button (AppButton, disabled gray until fields filled)
- "Or" divider with lines
- "Login with Google" button (border #CCCCCC, Google icon)
- "Login with Facebook" button (bg #1877F2, Facebook icon)
- Bottom: "Don't have an account? Join" → navigate to RegisterScreen
```

### Screen: `RegisterScreen` (already exists — update style)

```
Layout (same as Login pattern):
- Title: "Create an account"
- Subtitle: "Let's create your account."
- Full Name field
- Email field
- Password field (with eye toggle)
- Terms text with underlined links
- "Create an Account" button (AppButton)
- "Or" divider
- Google & Facebook sign up buttons
- Bottom: "Already have an account? Log In"
```

### Screen: `ForgotPasswordScreen`

```
Layout:
- Back arrow (top left)
- Title: "Forgot password" — H2 SemiBold
- Description: "Enter your email for the verification process..."
- Email field (AppTextField)
- Keyboard pushes button up (resizeToAvoidBottomInset: true)
- "Continue" button (AppButton)
```

### Screen: `VerificationScreen`

```
Layout:
- Back arrow
- Title: "Enter 4 Digit Code"
- Description with email shown
- 4 separate OTP input boxes (64×60px each, centered)
- "Email not received? Resend code" link
- "Verify" button
```

### Screen: `ResetPasswordScreen`

```
Layout:
- Back arrow
- Title: "Reset Password"
- Description text
- New Password field (AppTextField)
- Confirm Password field (AppTextField)
- "Continue" button
- Success popup on completion:
    → Check icon (green/duotone)
    → "Password Changed!"
    → "OK" button → navigate to LoginScreen
```

---

## 🟡 Step 4 — Home / Discover Screen

### Screen: `HomeScreen`

```
Layout:
- App bar: "Discover" title (Poppins SemiBold 24px) + Bell icon (top right)
- Search bar + Filter button (52px height, border #E6E6E6)
- Category chips (horizontal scroll):
    → All, Trending, Men, Women, Sale
    → Active: black bg, white text
    → Inactive: white bg, border #E6E6E6
- Product grid (2 columns, ProductCard widget)
    → Staggered layout: left column starts at 0, right column offset by ~20px
- Pull to refresh
- Bottom: AppBottomNav (tab index 0)
```

---

## 🟡 Step 5 — Search Screen

### Screen: `SearchScreen`

```
3 states:

State 1 — Default (recent searches):
- Search field at top
- "Recent Searches" title + "Clear all" button
- List of recent terms with ✕ button each
- Dividers between items

State 2 — Active (typing / results):
- Search field with text
- Product list (vertical):
    → Product image 73×87px
    → Product name + price
    → Arrow icon right

State 3 — Empty (no results):
- Search icon (duotone, centered)
- "No Results Found!"
- "Try a similar word or something more general."
```

---

## 🟡 Step 6 — Cart & Checkout Screens

### Screen: `CartScreen`

```
State 1 — Has items:
- App bar: "My Cart" + Bell icon
- Cart item list (scrollable):
    Each item row (342×107px):
    → Product image (65×87px, rounded)
    → Product name, size (e.g. "Size L")
    → Trash icon (top right of item)
    → Price + quantity control (- / number / +)
- Order summary (below items):
    → Sub-total: $xx.xx
    → VAT: $0.00
    → Shipping: $0.10
    → Divider
    → Total: $xx.xx
- "Proceed to Checkout" button (AppButton, full width, 54px)

State 2 — Empty:
- Cart icon (duotone, centered)
- "Your Cart Is Empty!"
- "When you add products, they'll appear here."
- Bottom nav visible
```

### Screen: `CheckoutScreen`

```
Sections:
1. Delivery Address:
   - Location icon + address text
   - "Change" link (right side)

2. Payment Method (toggle chips):
   - Card | Cash | (other options)
   - Active: black bg, white text

3. Card input field:
   - Visa logo + card number "****2512"
   - Edit icon

4. Order Summary:
   - Sub-total, VAT, Shipping fee
   - Divider
   - Total
   - Promo code input + "Apply" button

5. Bottom: "Place Order" button (AppButton)

Success popup (overlay):
- Check icon (duotone)
- "Congratulations!"
- "Your order has been placed."
- "Track My Order" button
```

---

## 🟡 Step 7 — Orders Screen

### Screen: `OrdersScreen`

```
Toggle tabs at top: "Ongoing" | "Completed"

Ongoing tab:
- List of order cards:
    → Product image + name + size
    → Status badge (e.g. "Ongoing" — yellow)
    → Price
    → "Track Order" button

Empty state:
    → Box icon (duotone)
    → "No Ongoing Orders!"

Completed tab:
- List of order cards:
    → Same layout as ongoing
    → Status badge: "Delivered" — green
    → Rating button (shows star + "4.5/5")

Review bottom sheet:
- "Leave a Review" title + close button
- "How was your order?" + star rating row
- Text input area
- "Submit Review" button
```

### Screen: `TrackOrderScreen`

```
- Map placeholder (full width, 390×562px, gray bg)
- Truck icon (moving on map)
- Warehouse icon (origin)
- Location icon (destination)
- Bottom sheet (order status):
    → "Order Status" title + close
    → Steps list with radio buttons:
        ● Packing → address
        ● Picked → address
        ● In Transit → address
        ● Delivered → address
    → Divider
    → Delivery person row:
        → Avatar circle + name + role
        → Phone button (right)
```

---

## 🟡 Step 8 — Account Screen

### Screen: `AccountScreen`

```
Layout:
- Title: "Account" + Bell icon
- User info row:
    → Avatar circle (48px)
    → Name + email
- "My Orders" quick link

Section 1 — Account:
- My Details → navigate to MyDetailsScreen
- Address Book → navigate to AddressScreen
- Payment Methods → navigate to PaymentScreen
- Notifications → navigate to NotificationsScreen

Section 2 — Support:
- FAQs → navigate to FAQsScreen
- Help Center → navigate to HelpCenterScreen

Section 3:
- Logout → shows logout confirmation dialog
```

### Logout Dialog (overlay):

```
- Warning icon (orange/duotone, 78×78px)
- "Logout?"
- "Are you sure you want to logout?"
- "Yes, Logout" button (black, AppButton)
- "Cancel" button (white/outlined, AppButton)
- → On confirm: clear token → navigate to OnboardingScreen
```

### Screen: `MyDetailsScreen`

```
- Back arrow + "My Details" title
- Form fields (AppTextField each):
    → First Name, Last Name, Email, Date of Birth, Phone Number
- Phone field has country flag + chevron prefix
- "Save Changes" button (AppButton, bottom)
```

### Screen: `AddressScreen`

```
- Back arrow + "Address" title
- Address list (scrollable):
    Each item (341×76px):
    → Location icon
    → Label (Home / Office / Apartment) + badge if default
    → Address text (truncated)
    → Radio button (right)
- "Add New Address" button (outlined, bottom)
- "Save" button (AppButton, black)
```

### Screen: `NotificationsSettingsScreen`

```
- Toggle list with Switch widgets:
    → General Notifications
    → Sound
    → Vibrate
    → Special Offers
    → Promo & Discounts
    → Payments
    → Cashback
    → App Updates
    → New Service Available
    → New Tips Available
- Dividers between items
```

### Screen: `FAQsScreen`

```
- Category chips: General | Account | Service | Policy
- Search field
- Expandable FAQ items (ExpansionTile):
    → "How do I make a purchase?" (default expanded)
    → Shows answer text
    → "What payment methods are accepted?"
    → "How do I track my orders?"
    → "Can I cancel or return an order?"
    → etc.
```

### Screen: `HelpCenterScreen`

```
- Category list items (each with forward arrow):
    → Order Issue
    → Payment Issue
    → Account Issue
    → Technical Issue
    → etc.
```

### Screen: `CustomerServiceScreen` (Chat)

```
- Chat bubble UI:
    → Agent message (left, gray bg)
    → User message (right, dark bg, white text)
    → Timestamps below each bubble
- Text input bar at bottom + Send button
- HomeIndicator at very bottom
```

---

## 🟡 Step 9 — Product Detail Screen

### Screen: `ProductDetailScreen`

```
Layout:
- Image carousel (full width, swipeable, dots indicator)
- Back arrow + bell icon (overlay on image)
- Heart icon (top right, toggles save)
- Product info section:
    → Product name (Poppins SemiBold 20px)
    → Rating row: stars + "(xx reviews)"
    → Price: large bold
    → Size selector: S / M / L / XL chips
    → Color selector: color circles
    → Description text (expandable)
- Reviews section:
    → Average rating
    → Review cards (avatar + name + stars + comment)
- Bottom bar:
    → "Add to Cart" button (AppButton)
    → Quantity control (- / 1 / +)
```

---

## 🟡 Step 10 — Routes to Add

Update `lib/app/routes.dart`:

```dart
'/forgot-password'  → ForgotPasswordScreen
'/verification'     → VerificationScreen
'/reset-password'   → ResetPasswordScreen
'/search'           → SearchScreen
'/product-detail'   → ProductDetailScreen
'/cart'             → CartScreen
'/checkout'         → CheckoutScreen
'/orders'           → OrdersScreen
'/track-order'      → TrackOrderScreen
'/account'          → AccountScreen
'/my-details'       → MyDetailsScreen
'/address'          → AddressScreen
'/notifications-settings' → NotificationsSettingsScreen
'/faqs'             → FAQsScreen
'/help-center'      → HelpCenterScreen
'/customer-service' → CustomerServiceScreen
```

---

## 🟢 Build Order (Recommended)

```
Phase 1 (Foundation):
  □ app_colors.dart
  □ app_text_styles.dart
  □ app_theme.dart
  □ app_button.dart
  □ app_text_field.dart

Phase 2 (Auth — already partially done):
  □ Update OnboardingScreen
  □ Update LoginScreen
  □ Update RegisterScreen
  □ ForgotPasswordScreen
  □ VerificationScreen
  □ ResetPasswordScreen

Phase 3 (Core features):
  □ HomeScreen (Discover)
  □ SearchScreen
  □ ProductDetailScreen
  □ CartScreen

Phase 4 (Account & Orders):
  □ AccountScreen
  □ OrdersScreen
  □ TrackOrderScreen
  □ CheckoutScreen

Phase 5 (Account settings):
  □ MyDetailsScreen
  □ AddressScreen
  □ NotificationsSettingsScreen
  □ FAQsScreen
  □ HelpCenterScreen
  □ CustomerServiceScreen
```

---

## 💡 Notes

- All screens use `Scaffold` with `backgroundColor: Colors.white`
- Use `SafeArea` for top/bottom padding
- Bottom nav is persistent on: Home, Search, Cart, Account
- All icons use `flutter_svg` or `Icon` with `Icons.*` equivalents
- Images use `CachedNetworkImage` package for network images
- All API calls go through `ApiService` → Riverpod providers
- Navigation: `Navigator.pushNamed(context, '/route')`
