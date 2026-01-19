import 'package:flutter/material.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Auth UI',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primaryColor: const Color(0xFF6366F1),
        scaffoldBackgroundColor: Colors.white,
        fontFamily: 'Inter',
      ),
      home: const AuthPage(),
    );
  }
}

class AuthPage extends StatefulWidget {
  const AuthPage({super.key});

  @override
  State<AuthPage> createState() => _AuthPageState();
}

class _AuthPageState extends State<AuthPage> {
  // States: 'signup', 'login', 'forgot', 'verify', 'reset'
  String _currentMode = 'signup';

  // Controllers
  final TextEditingController _nameController = TextEditingController();
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  final TextEditingController _confirmPasswordController = TextEditingController();
  final List<TextEditingController> _otpControllers = List.generate(4, (index) => TextEditingController());

  bool _isFormFilled = false;

  @override
  void initState() {
    super.initState();
    _nameController.addListener(_updateFormState);
    _emailController.addListener(_updateFormState);
    _passwordController.addListener(_updateFormState);
    _confirmPasswordController.addListener(_updateFormState);
    for (var controller in _otpControllers) {
      controller.addListener(_updateFormState);
    }
  }

  void _updateFormState() {
    bool isFilled;
    if (_currentMode == 'signup') {
      isFilled = _nameController.text.trim().isNotEmpty &&
          _emailController.text.trim().isNotEmpty &&
          _passwordController.text.trim().isNotEmpty;
    } else if (_currentMode == 'login') {
      isFilled = _emailController.text.trim().isNotEmpty &&
          _passwordController.text.trim().isNotEmpty;
    } else if (_currentMode == 'forgot') {
      isFilled = _emailController.text.trim().isNotEmpty;
    } else if (_currentMode == 'verify') {
      isFilled = _otpControllers.every((c) => c.text.isNotEmpty);
    } else if (_currentMode == 'reset') {
      isFilled = _passwordController.text.trim().isNotEmpty &&
          _confirmPasswordController.text.trim().isNotEmpty;
    } else {
      isFilled = false;
    }

    if (isFilled != _isFormFilled) {
      setState(() {
        _isFormFilled = isFilled;
      });
    }
  }

  void _handleAuthAction() {
    if (_currentMode == 'signup') {
      _showSuccessDialog("Registration completed!", "You're all set! Thanks for signing up we're excited to have you with us!");
    } else if (_currentMode == 'login') {
      _showSuccessDialog("Welcome back!", "Successfully logged in to your account.");
    } else if (_currentMode == 'forgot') {
      _toggleAuthMode('verify');
    } else if (_currentMode == 'verify') {
      // Leads to Reset Password page
      _toggleAuthMode('reset');
    } else if (_currentMode == 'reset') {
      _showSuccessDialog("Password Reset Successful!", "Your password has been updated. You can now log in with your new credentials.");
    }
  }

  void _showSuccessDialog(String title, String message) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Color(0xFFDCFCE7),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.check_circle, color: Color(0xFF166534), size: 48),
            ),
            const SizedBox(height: 24),
            Text(
              title,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Text(
              message,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.grey, fontSize: 16),
            ),
            const SizedBox(height: 32),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context);
                  setState(() => _currentMode = 'login');
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF000000),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text("Get Started", style: TextStyle(color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _toggleAuthMode(String mode) {
    setState(() {
      _currentMode = mode;
      _isFormFilled = false;
      _nameController.clear();
      _emailController.clear();
      _passwordController.clear();
      _confirmPasswordController.clear();
      for (var c in _otpControllers) {
        c.clear();
      }
    });
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    for (var c in _otpControllers) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final bool isDesktop = MediaQuery.of(context).size.width > 800;

    return Scaffold(
      body: Row(
        children: [
          if (isDesktop)
            Expanded(
              flex: 1,
              child: Container(
                color: const Color(0xFFF8FAFC),
                padding: const EdgeInsets.all(60),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const BrandLogo(),
                    const SizedBox(height: 48),
                    Text(
                      _currentMode == 'signup'
                          ? "Elevate your mobile\nweb experience."
                          : _currentMode == 'login'
                          ? "Welcome back to\nthe community."
                          : _currentMode == 'forgot'
                          ? "Reset your\naccount password."
                          : _currentMode == 'verify'
                          ? "Verify your\nidentity."
                          : "Create a new\nsecure password.",
                      style: const TextStyle(
                        fontSize: 42,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF1E293B),
                        height: 1.1,
                      ),
                    ),
                    const SizedBox(height: 24),
                    Text(
                      _currentMode == 'signup'
                          ? "Join our community and start building responsive applications tailored for the modern web."
                          : _currentMode == 'login'
                          ? "Log in to your account to continue your journey and manage your projects."
                          : _currentMode == 'forgot'
                          ? "Don't worry, it happens. Enter your email and we'll send you a link to reset your password."
                          : _currentMode == 'verify'
                          ? "We've sent a 4-digit code to your email. Enter it below to proceed."
                          : "Ensure your new password is strong and easy to remember.",
                      style: TextStyle(fontSize: 18, color: Colors.blueGrey[400]),
                    ),
                  ],
                ),
              ),
            ),
          Expanded(
            flex: 1,
            child: Center(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 40),
                child: ConstrainedBox(
                  constraints: const BoxConstraints(maxWidth: 420),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _currentMode == 'signup'
                            ? "Create an account"
                            : _currentMode == 'login'
                            ? "Log in"
                            : _currentMode == 'forgot'
                            ? "Forgot password"
                            : _currentMode == 'verify'
                            ? "Enter 4-digit code"
                            : "Reset password",
                        style: const TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _currentMode == 'signup'
                            ? "Let's create your account"
                            : _currentMode == 'login'
                            ? "Welcome back! Please enter your details"
                            : _currentMode == 'forgot'
                            ? "Enter your email for the verification process. We will send 4 degits code to your email"
                            : _currentMode == 'verify'
                            ? "Please enter the code sent to your email"
                            : "Enter your new password below",
                        style: const TextStyle(color: Colors.grey, fontSize: 16, height: 1.4),
                      ),
                      const SizedBox(height: 40),

                      if (_currentMode == 'signup') ...[
                        _inputLabel("Full Name"),
                        _textField("Enter your full name", Icons.person_outline, _nameController),
                        const SizedBox(height: 20),
                      ],

                      if (_currentMode == 'signup' || _currentMode == 'login' || _currentMode == 'forgot') ...[
                        _inputLabel("Email Address"),
                        _textField("name@example.com", Icons.email_outlined, _emailController),
                      ],

                      if (_currentMode == 'signup' || _currentMode == 'login' || _currentMode == 'reset') ...[
                        if (_currentMode != 'reset') const SizedBox(height: 20),
                        _inputLabel(_currentMode == 'reset' ? "New Password" : "Password"),
                        _textField("••••••••", Icons.lock_outline, _passwordController, obscure: true),
                      ],

                      if (_currentMode == 'reset') ...[
                        const SizedBox(height: 20),
                        _inputLabel("Confirm New Password"),
                        _textField("••••••••", Icons.lock_outline, _confirmPasswordController, obscure: true),
                      ],

                      if (_currentMode == 'verify') ...[
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: List.generate(4, (index) => _otpBox(index)),
                        ),
                        const SizedBox(height: 24),
                        Center(
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Text("Email not received? ", style: TextStyle(color: Colors.grey, fontSize: 14)),
                              MouseRegion(
                                cursor: SystemMouseCursors.click,
                                child: GestureDetector(
                                  onTap: () {},
                                  child: const Text(
                                    "Resend Code",
                                    style: TextStyle(
                                      color: Colors.black,
                                      fontWeight: FontWeight.bold,
                                      decoration: TextDecoration.underline,
                                      fontSize: 14,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],

                      const SizedBox(height: 12),
                      if (_currentMode == 'signup') const _LegalDisclaimer() else if (_currentMode == 'login') Align(
                        alignment: Alignment.centerRight,
                        child: MouseRegion(
                          cursor: SystemMouseCursors.click,
                          child: TextButton(
                            onPressed: () => _toggleAuthMode('forgot'),
                            child: const Text(
                              "Forgot password?",
                              style: TextStyle(
                                color: Colors.black,
                                fontWeight: FontWeight.w600,
                                decoration: TextDecoration.underline,
                              ),
                            ),
                          ),
                        ),
                      ),

                      const SizedBox(height: 32),

                      SizedBox(
                        width: double.infinity,
                        height: 54,
                        child: ElevatedButton(
                          onPressed: _isFormFilled ? _handleAuthAction : null,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: _isFormFilled ? const Color(0xFF000000) : const Color(0xFFCCCCCC),
                            foregroundColor: Colors.white,
                            disabledBackgroundColor: const Color(0xFFCCCCCC),
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                            elevation: 0,
                          ),
                          child: Text(
                            _currentMode == 'signup'
                                ? "Create an Account"
                                : _currentMode == 'login'
                                ? "Log In"
                                : _currentMode == 'forgot'
                                ? "Send Code"
                                : _currentMode == 'verify'
                                ? "Continue"
                                : "Reset Password",
                            style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                          ),
                        ),
                      ),

                      if (_currentMode == 'signup' || _currentMode == 'login') ...[
                        const SizedBox(height: 32),
                        const Row(
                          children: [
                            Expanded(child: Divider()),
                            Padding(
                              padding: EdgeInsets.symmetric(horizontal: 16),
                              child: Text("OR", style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold)),
                            ),
                            Expanded(child: Divider()),
                          ],
                        ),
                        const SizedBox(height: 32),
                        _socialButton(_currentMode == 'signup' ? "Sign up with Google" : "Log in with Google", 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c1/Google_%22G%22_logo.svg/1200px-Google_%22G%22_logo.svg.png'),
                        const SizedBox(height: 12),
                        _facebookButton(_currentMode == 'signup' ? "Sign up with Facebook" : "Log in with Facebook"),
                      ],

                      if (_currentMode == 'signup' || _currentMode == 'login') ...[
                        const SizedBox(height: 40),
                        Center(
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(
                                _currentMode == 'signup'
                                    ? "Already have an account?"
                                    : "Don't have an account?",
                              ),
                              MouseRegion(
                                cursor: SystemMouseCursors.click,
                                child: TextButton(
                                  onPressed: () {
                                    if (_currentMode == 'signup') {
                                      _toggleAuthMode('login');
                                    } else {
                                      _toggleAuthMode('signup');
                                    }
                                  },
                                  child: Text(
                                    _currentMode == 'signup' ? "Log In" : "Sign Up",
                                    style: const TextStyle(
                                      fontWeight: FontWeight.bold,
                                      color: Colors.black,
                                      decoration: TextDecoration.underline,
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _otpBox(int index) {
    return SizedBox(
      width: 70,
      height: 70,
      child: TextField(
        controller: _otpControllers[index],
        textAlign: TextAlign.center,
        keyboardType: TextInputType.number,
        maxLength: 1,
        style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        decoration: InputDecoration(
          counterText: "",
          filled: true,
          fillColor: const Color(0xFFF8FAFC),
          border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
          enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFFE2E8F0))),
          focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.black, width: 2)),
        ),
        onChanged: (value) {
          if (value.length == 1 && index < 3) {
            FocusScope.of(context).nextFocus();
          }
          if (value.isEmpty && index > 0) {
            FocusScope.of(context).previousFocus();
          }
          _updateFormState();
        },
      ),
    );
  }

  Widget _inputLabel(String label) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(
        label,
        style: const TextStyle(fontWeight: FontWeight.w600, color: Color(0xFF334155), fontSize: 14),
      ),
    );
  }

  Widget _textField(String hint, IconData icon, TextEditingController controller, {bool obscure = false}) {
    return TextField(
      controller: controller,
      obscureText: obscure,
      onChanged: (_) => _updateFormState(),
      decoration: InputDecoration(
        hintText: hint,
        hintStyle: TextStyle(color: Colors.grey[400], fontSize: 15),
        prefixIcon: Icon(icon, size: 20, color: Colors.blueGrey),
        filled: true,
        fillColor: const Color(0xFFF8FAFC),
        contentPadding: const EdgeInsets.symmetric(vertical: 18),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
      ),
    );
  }

  Widget _socialButton(String label, String logoUrl) {
    return SizedBox(
      width: double.infinity,
      height: 54,
      child: OutlinedButton(
        onPressed: () {},
        style: OutlinedButton.styleFrom(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          side: BorderSide(color: Colors.grey[300]!),
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Image.network(
              logoUrl,
              height: 20,
              errorBuilder: (context, error, stackTrace) => const Icon(Icons.g_mobiledata, color: Colors.red),
            ),
            const SizedBox(width: 12),
            Text(label, style: const TextStyle(color: Colors.black87, fontWeight: FontWeight.w500)),
          ],
        ),
      ),
    );
  }

  Widget _facebookButton(String label) {
    return SizedBox(
      width: double.infinity,
      height: 54,
      child: ElevatedButton.icon(
        onPressed: () {},
        icon: const Icon(Icons.facebook, size: 24, color: Colors.white),
        label: Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500)),
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF1877F2),
          elevation: 0,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        ),
      ),
    );
  }
}

class _LegalDisclaimer extends StatelessWidget {
  const _LegalDisclaimer();

  @override
  Widget build(BuildContext context) {
    return RichText(
      text: TextSpan(
        style: const TextStyle(color: Colors.grey, fontSize: 13, height: 1.4, fontFamily: 'Inter'),
        children: [
          const TextSpan(text: "By signing up you agree to our "),
          _linkSpan("Terms"),
          const TextSpan(text: ", "),
          _linkSpan("Privacy Policy"),
          const TextSpan(text: ", and "),
          _linkSpan("Cookie Use"),
          const TextSpan(text: "."),
        ],
      ),
    );
  }

  TextSpan _linkSpan(String text) {
    return TextSpan(
      text: text,
      mouseCursor: SystemMouseCursors.click,
      style: const TextStyle(
        color: Colors.black,
        fontWeight: FontWeight.w600,
        decoration: TextDecoration.underline,
      ),
    );
  }
}

class BrandLogo extends StatelessWidget {
  const BrandLogo({super.key});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(color: const Color(0xFF6366F1), borderRadius: BorderRadius.circular(10)),
          child: const Center(child: Text("U", style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 22))),
        ),
        const SizedBox(width: 12),
        const Text("Untitled UI", style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold, color: Color(0xFF1E293B))),
      ],
    );
  }
}