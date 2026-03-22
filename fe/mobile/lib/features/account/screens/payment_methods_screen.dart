import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';
import 'package:mobile/models/payment_card.dart';
import 'package:mobile/providers/auth_provider.dart';
import 'package:mobile/widgets/app_button.dart';
import 'package:mobile/widgets/app_screen_header.dart';

class PaymentMethodsScreen extends ConsumerStatefulWidget {
  const PaymentMethodsScreen({super.key});

  @override
  ConsumerState<PaymentMethodsScreen> createState() =>
      _PaymentMethodsScreenState();
}

class _PaymentMethodsScreenState extends ConsumerState<PaymentMethodsScreen> {
  bool _isLoading = false;
  String? _processingCardId;
  List<PaymentCard> _cards = [];

  @override
  void initState() {
    super.initState();
    Future.microtask(_loadCards);
  }

  Future<void> _loadCards() async {
    final auth = ref.read(authStateProvider);
    final accessToken = auth.accessToken;

    if (accessToken == null || accessToken.isEmpty) {
      _showMessage('Please login again.');
      return;
    }

    setState(() => _isLoading = true);

    final result = await ref
        .read(apiServiceProvider)
        .getPaymentCards(
          accessToken: accessToken,
          refreshToken: auth.refreshToken,
        );

    if (!mounted) return;

    if (result.isSuccess && result.data != null) {
      final raw = result.data!['data'];
      final cards = <PaymentCard>[];

      if (raw is List) {
        for (final item in raw) {
          if (item is Map<String, dynamic>) {
            cards.add(PaymentCard.fromJson(item));
          }
        }
      }

      setState(() {
        _cards = cards;
        _isLoading = false;
      });
      return;
    }

    setState(() => _isLoading = false);
    _showMessage(result.message ?? 'Failed to load payment cards.');
  }

  Future<void> _addCard() async {
    final auth = ref.read(authStateProvider);
    final accessToken = auth.accessToken;

    if (accessToken == null || accessToken.isEmpty) {
      _showMessage('Please login again.');
      return;
    }

    final holderController = TextEditingController();
    final numberController = TextEditingController();
    final monthController = TextEditingController();
    final yearController = TextEditingController();
    final cvvController = TextEditingController();
    String selectedNetwork = 'AUTO';

    final created = await showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (dialogContext) {
        bool isSubmitting = false;
        String? errorText;

        return StatefulBuilder(
          builder: (context, setModalState) {
            Future<void> submit() async {
              final holder = holderController.text.trim();
              final number = numberController.text.trim();
              final month = int.tryParse(monthController.text.trim());
              final year = int.tryParse(yearController.text.trim());
              final cvv = cvvController.text.trim();

              if (holder.isEmpty ||
                  number.isEmpty ||
                  month == null ||
                  year == null ||
                  cvv.isEmpty) {
                setModalState(() => errorText = 'Please fill all fields.');
                return;
              }

              setModalState(() {
                isSubmitting = true;
                errorText = null;
              });

              final body = <String, dynamic>{
                'holderName': holder,
                'cardNumber': number,
                'expiryMonth': month,
                'expiryYear': year,
                'cvv': cvv,
              };

              if (selectedNetwork != 'AUTO') {
                body['network'] = selectedNetwork;
              }

              final result = await ref
                  .read(apiServiceProvider)
                  .addPaymentCard(
                    accessToken: accessToken,
                    refreshToken: auth.refreshToken,
                    body: body,
                  );

              if (!mounted) return;

              if (!result.isSuccess) {
                setModalState(() {
                  isSubmitting = false;
                  errorText = result.message ?? 'Failed to save card.';
                });
                return;
              }

              if (dialogContext.mounted) {
                Navigator.pop(dialogContext, true);
              }
            }

            return Dialog(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(20),
              ),
              child: Padding(
                padding: const EdgeInsets.all(20),
                child: SingleChildScrollView(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Add Payment Card',
                        style: AppTextStyles.h2SemiBold.copyWith(fontSize: 22),
                      ),
                      const SizedBox(height: 14),
                      TextField(
                        controller: holderController,
                        decoration: const InputDecoration(
                          labelText: 'Card Holder Name',
                        ),
                      ),
                      const SizedBox(height: 10),
                      TextField(
                        controller: numberController,
                        keyboardType: TextInputType.number,
                        decoration: const InputDecoration(
                          labelText: 'Card Number',
                        ),
                      ),
                      const SizedBox(height: 10),
                      DropdownButtonFormField<String>(
                        initialValue: selectedNetwork,
                        items: const [
                          DropdownMenuItem(
                            value: 'AUTO',
                            child: Text('Auto detect network'),
                          ),
                          DropdownMenuItem(value: 'VISA', child: Text('VISA')),
                          DropdownMenuItem(
                            value: 'MASTERCARD',
                            child: Text('MASTERCARD'),
                          ),
                          DropdownMenuItem(
                            value: 'UNIONPAY',
                            child: Text('UNIONPAY'),
                          ),
                        ],
                        onChanged: isSubmitting
                            ? null
                            : (value) {
                                if (value == null) return;
                                setModalState(() => selectedNetwork = value);
                              },
                        decoration: const InputDecoration(
                          labelText: 'Card Network',
                        ),
                      ),
                      const SizedBox(height: 10),
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: monthController,
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(
                                labelText: 'MM',
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: TextField(
                              controller: yearController,
                              keyboardType: TextInputType.number,
                              decoration: const InputDecoration(
                                labelText: 'YYYY',
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: TextField(
                              controller: cvvController,
                              keyboardType: TextInputType.number,
                              obscureText: true,
                              decoration: const InputDecoration(
                                labelText: 'CVV',
                              ),
                            ),
                          ),
                        ],
                      ),
                      if (errorText != null) ...[
                        const SizedBox(height: 10),
                        Text(
                          errorText!,
                          style: AppTextStyles.b2Regular.copyWith(
                            color: AppColors.error,
                          ),
                        ),
                      ],
                      const SizedBox(height: 16),
                      AppButton(
                        label: 'Save Card',
                        isLoading: isSubmitting,
                        onPressed: isSubmitting ? null : submit,
                      ),
                      const SizedBox(height: 8),
                      Center(
                        child: TextButton(
                          onPressed: isSubmitting
                              ? null
                              : () => Navigator.pop(dialogContext, false),
                          child: const Text('Cancel'),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            );
          },
        );
      },
    );

    holderController.dispose();
    numberController.dispose();
    monthController.dispose();
    yearController.dispose();
    cvvController.dispose();

    if (created == true) {
      await _loadCards();
      if (mounted) {
        _showMessage('Card saved successfully.');
      }
    }
  }

  Future<void> _removeCard(PaymentCard card) async {
    final auth = ref.read(authStateProvider);
    final accessToken = auth.accessToken;

    if (accessToken == null || accessToken.isEmpty) {
      _showMessage('Please login again.');
      return;
    }

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (dialogContext) => AlertDialog(
        title: const Text('Remove card?'),
        content: Text(
          'Remove ${card.network} ${card.maskedNumber} from your payment methods?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(dialogContext, true),
            child: const Text('Remove'),
          ),
        ],
      ),
    );

    if (confirmed != true) return;

    setState(() => _processingCardId = card.id);

    final result = await ref
        .read(apiServiceProvider)
        .removePaymentCard(
          accessToken: accessToken,
          refreshToken: auth.refreshToken,
          cardId: card.id,
        );

    if (!mounted) return;

    setState(() => _processingCardId = null);

    if (!result.isSuccess) {
      _showMessage(result.message ?? 'Failed to remove card.');
      return;
    }

    _cards = _cards.where((item) => item.id != card.id).toList();
    setState(() {});
    _showMessage('Card removed.');
  }

  void _showMessage(String message) {
    if (!mounted) return;
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(SnackBar(content: Text(message)));
  }

  Widget _buildCardItem(PaymentCard card) {
    final isProcessing = _processingCardId == card.id;
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.primary100),
      ),
      child: Row(
        children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: AppColors.primary100.withValues(alpha: 0.35),
              borderRadius: BorderRadius.circular(10),
            ),
            child: const Icon(Icons.credit_card, color: AppColors.primary900),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '${card.network} ${card.maskedNumber}',
                  style: AppTextStyles.b1Medium.copyWith(fontSize: 14),
                ),
                const SizedBox(height: 2),
                Text(
                  '${card.holderName}  |  Exp ${card.expiryLabel}',
                  style: AppTextStyles.b2Regular.copyWith(fontSize: 12),
                ),
              ],
            ),
          ),
          IconButton(
            onPressed: isProcessing ? null : () => _removeCard(card),
            icon: isProcessing
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(strokeWidth: 2),
                  )
                : const Icon(Icons.delete_outline, color: AppColors.error),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.primary0,
      body: SafeArea(
        child: Column(
          children: [
            AppScreenHeader(
              title: 'Payment Methods',
              leading: IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.arrow_back, size: 24),
              ),
            ),
            Expanded(
              child: _isLoading
                  ? const Center(child: CircularProgressIndicator(strokeWidth: 2))
                  : RefreshIndicator(
                      onRefresh: _loadCards,
                      child: _cards.isEmpty
                          ? ListView(
                              padding: const EdgeInsets.all(24),
                              children: [
                                const SizedBox(height: 32),
                                Container(
                                  padding: const EdgeInsets.all(20),
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(12),
                                    border: Border.all(
                                      color: AppColors.primary100,
                                    ),
                                  ),
                                  child: Column(
                                    children: [
                                      const Icon(
                                        Icons.credit_card_off_outlined,
                                        color: AppColors.primary500,
                                        size: 30,
                                      ),
                                      const SizedBox(height: 8),
                                      Text(
                                        'No payment card saved yet.',
                                        style: AppTextStyles.b1Regular,
                                      ),
                                      const SizedBox(height: 4),
                                      Text(
                                        'Tap "Add New Card" to save your card.',
                                        style: AppTextStyles.b2Regular,
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            )
                          : ListView.separated(
                              padding: const EdgeInsets.all(24),
                              itemBuilder: (_, index) =>
                                  _buildCardItem(_cards[index]),
                              separatorBuilder: (_, index) =>
                                  const SizedBox(height: 10),
                              itemCount: _cards.length,
                            ),
                    ),
            ),
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 16),
              child: AppButton(
                label: 'Add New Card',
                onPressed: _addCard,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
