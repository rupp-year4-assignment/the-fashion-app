import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:latlong2/latlong.dart';
import 'package:mobile/app/theme/app_colors.dart';
import 'package:mobile/app/theme/app_text_styles.dart';
import 'package:mobile/models/order.dart';
import 'package:mobile/models/road_route.dart';
import 'package:mobile/providers/auth_provider.dart';
import 'package:mobile/providers/order_provider.dart';
import 'package:mobile/services/route_service.dart';
import 'package:mobile/widgets/app_screen_header.dart';

class TrackOrderScreen extends ConsumerStatefulWidget {
  const TrackOrderScreen({super.key, required this.order});

  final Order order;

  @override
  ConsumerState<TrackOrderScreen> createState() => _TrackOrderScreenState();
}

class _TrackOrderScreenState extends ConsumerState<TrackOrderScreen>
    with WidgetsBindingObserver {
  static const LatLng _fallbackShop = LatLng(11.568267, 104.713525);
  static const LatLng _fallbackDestination = LatLng(11.5564, 104.9282);
  static const Duration _refreshInterval = Duration(seconds: 15);

  final MapController _mapController = MapController();
  final RouteService _routeService = RouteService();

  late Order _order;
  Timer? _refreshTimer;
  RoadRoute? _roadRoute;
  bool _isLoadingRoute = true;
  bool _isMapReady = false;
  bool _isRefreshingOrder = false;
  int _routeRequestId = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    _order = widget.order;
    _loadRoute();
    _refreshOrder();
    _refreshTimer = Timer.periodic(_refreshInterval, (_) => _refreshOrder());
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    _refreshTimer?.cancel();
    _routeService.dispose();
    _mapController.dispose();
    super.dispose();
  }

  @override
  void didUpdateWidget(covariant TrackOrderScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.order.id != widget.order.id) {
      _applyOrderUpdate(widget.order);
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == AppLifecycleState.resumed) {
      _refreshOrder();
    }
  }

  void _applyOrderUpdate(Order nextOrder) {
    final shouldReloadRoute = _routeInputsChanged(_order, nextOrder);
    final statusChanged = _order.status != nextOrder.status;

    setState(() {
      _order = nextOrder;
    });

    if (_order.status.isCompleted) {
      _refreshTimer?.cancel();
    }

    if (shouldReloadRoute) {
      _loadRoute();
    } else if (statusChanged) {
      _scheduleCameraFit();
    }
  }

  Future<void> _refreshOrder() async {
    if (_isRefreshingOrder || !mounted || _order.id.isEmpty) {
      return;
    }

    final authState = ref.read(authStateProvider);
    final token = authState.accessToken;
    if (token == null) {
      return;
    }

    _isRefreshingOrder = true;
    final api = ref.read(apiServiceProvider);
    final result = await api.getOrderById(
      accessToken: token,
      refreshToken: authState.refreshToken,
      orderId: _order.id,
    );
    _isRefreshingOrder = false;

    if (!mounted || !result.isSuccess || result.data == null) {
      return;
    }

    final rawOrder = result.data!['data'];
    if (rawOrder is! Map<String, dynamic>) {
      return;
    }

    final refreshedOrder = Order.fromJson(rawOrder);
    ref.read(ordersProvider.notifier).upsertOrder(refreshedOrder);
    _applyOrderUpdate(refreshedOrder);
  }

  Future<void> _loadRoute() async {
    final origin = _pickupPoint;
    final destination = _destinationPoint(origin);
    final requestId = ++_routeRequestId;

    setState(() {
      _isLoadingRoute = true;
      _roadRoute = null;
    });

    final roadRoute = await _routeService.getRoute(
      origin: origin,
      destination: destination,
    );

    if (!mounted || requestId != _routeRequestId) {
      return;
    }

    setState(() {
      _roadRoute = roadRoute;
      _isLoadingRoute = false;
    });
    _scheduleCameraFit();
  }

  @override
  Widget build(BuildContext context) {
    final pickup = _pickupPoint;
    final destination = _destinationPoint(pickup);
    final routePoints = _resolvedRoutePoints(pickup, destination);
    final progress = _progressByStatus;
    final traveledRoute = _pathUntilProgress(routePoints, progress);
    final truckPoint = traveledRoute.isNotEmpty ? traveledRoute.last : pickup;

    final itemCount = _order.items.fold<int>(
      0,
      (sum, item) => sum + item.quantity,
    );
    final firstItemName = _order.items.isNotEmpty
        ? _order.items.first.productName
        : 'Your fashion items';

    return Scaffold(
      backgroundColor: AppColors.primary0,
      body: SafeArea(
        child: Column(
          children: [
            AppScreenHeader(
              title: 'Track Order',
              leading: IconButton(
                onPressed: () => Navigator.pop(context),
                icon: const Icon(Icons.arrow_back, size: 24),
              ),
            ),

            Expanded(
              flex: 3,
              child: ClipRRect(
                borderRadius: const BorderRadius.vertical(
                  bottom: Radius.circular(20),
                ),
                child: Stack(
                  children: [
                    FlutterMap(
                      mapController: _mapController,
                      options: MapOptions(
                        initialCameraFit: _cameraFitFor(
                          routePoints: routePoints,
                          driverPoint: truckPoint,
                          origin: pickup,
                          destination: destination,
                        ),
                        onMapReady: _handleMapReady,
                        interactionOptions: const InteractionOptions(
                          flags: InteractiveFlag.all & ~InteractiveFlag.rotate,
                        ),
                      ),
                      children: [
                        TileLayer(
                          urlTemplate:
                              'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                          userAgentPackageName: 'com.example.mobile',
                        ),
                        PolylineLayer(
                          polylines: [
                            Polyline(
                              points: routePoints,
                              strokeWidth: 6,
                              color: AppColors.primary900.withValues(
                                alpha: 0.2,
                              ),
                              borderStrokeWidth: 1.5,
                              borderColor: AppColors.primary0.withValues(
                                alpha: 0.75,
                              ),
                            ),
                            if (traveledRoute.length >= 2)
                              Polyline(
                                points: traveledRoute,
                                strokeWidth: 5,
                                color: AppColors.primary900,
                                borderStrokeWidth: 1.2,
                                borderColor: AppColors.primary0.withValues(
                                  alpha: 0.65,
                                ),
                              ),
                          ],
                        ),
                        MarkerLayer(
                          markers: [
                            Marker(
                              point: pickup,
                              width: 44,
                              height: 44,
                              child: const _MapMarker(
                                icon: Icons.storefront,
                                color: AppColors.primary900,
                              ),
                            ),
                            Marker(
                              point: destination,
                              width: 44,
                              height: 44,
                              child: const _MapMarker(
                                icon: Icons.location_on,
                                color: AppColors.error,
                              ),
                            ),
                            Marker(
                              point: truckPoint,
                              width: 46,
                              height: 46,
                              child: const _MapMarker(
                                icon: Icons.local_shipping,
                                color: AppColors.primary800,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                    if (_isLoadingRoute)
                      const Positioned(
                        top: 12,
                        right: 12,
                        child: _MapInfoChip(label: 'Loading road route...'),
                      )
                    else if (_usedFallbackRoute)
                      const Positioned(
                        top: 12,
                        right: 12,
                        child: _MapInfoChip(label: 'Road route unavailable'),
                      ),
                  ],
                ),
              ),
            ),

            Expanded(
              flex: 4,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(24),
                decoration: const BoxDecoration(
                  color: AppColors.primary0,
                  borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black12,
                      blurRadius: 10,
                      offset: Offset(0, -2),
                    ),
                  ],
                ),
                child: SingleChildScrollView(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Center(
                        child: Container(
                          width: 40,
                          height: 4,
                          decoration: BoxDecoration(
                            color: AppColors.primary200,
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'Order Status',
                        style: AppTextStyles.b1Medium.copyWith(fontSize: 18),
                      ),
                      const SizedBox(height: 20),
                      Container(
                        width: double.infinity,
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.primary100.withValues(alpha: 0.4),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.inventory_2_outlined,
                              color: AppColors.primary800,
                            ),
                            const SizedBox(width: 10),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    firstItemName,
                                    maxLines: 1,
                                    overflow: TextOverflow.ellipsis,
                                    style: AppTextStyles.b1Medium.copyWith(
                                      fontSize: 14,
                                    ),
                                  ),
                                  Text(
                                    '$itemCount item(s) delivering',
                                    style: AppTextStyles.b2Regular.copyWith(
                                      color: AppColors.primary500,
                                      fontSize: 12,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            Text(
                              _order.status.label,
                              style: AppTextStyles.b2Regular.copyWith(
                                color: AppColors.primary800,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 14),

                      _StatusStep(
                        title: 'Order Placed',
                        subtitle: 'Your order has been placed',
                        isCompleted: true,
                        isLast: false,
                      ),
                      _StatusStep(
                        title: 'Packing',
                        subtitle:
                            _order.delivery.pickupFullAddress.isNotEmpty
                            ? 'Shop: ${_order.delivery.pickupFullAddress}'
                            : 'Preparing your items',
                        isCompleted: _isStepCompleted(OrderStatus.processing),
                        isLast: false,
                      ),
                      _StatusStep(
                        title: 'In Transit',
                        subtitle:
                            _order
                                .delivery
                                .destinationFullAddress
                                .isNotEmpty
                            ? 'To: ${_order.delivery.destinationFullAddress}'
                            : 'Your order is on the way',
                        isCompleted: _isStepCompleted(OrderStatus.shipped),
                        isLast: false,
                      ),
                      _StatusStep(
                        title: 'Delivered',
                        subtitle: 'Your order has been delivered',
                        isCompleted: _isStepCompleted(OrderStatus.delivered),
                        isLast: true,
                      ),

                      const Divider(height: 32, color: AppColors.primary100),

                      _AddressRow(
                        label: 'From Shop',
                        value:
                            _order.delivery.pickupFullAddress.isNotEmpty
                            ? _order.delivery.pickupFullAddress
                            : 'Main shop',
                      ),
                      const SizedBox(height: 8),
                      _AddressRow(
                        label: 'Deliver To',
                        value:
                            _order
                                .delivery
                                .destinationFullAddress
                                .isNotEmpty
                            ? _order.delivery.destinationFullAddress
                            : 'Destination address not available',
                      ),

                      const Divider(height: 32, color: AppColors.primary100),

                      Row(
                        children: [
                          CircleAvatar(
                            radius: 24,
                            backgroundColor: AppColors.primary100,
                            child: const Icon(
                              Icons.person,
                              color: AppColors.primary500,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  'Delivery Person',
                                  style: AppTextStyles.b1Medium.copyWith(
                                    fontSize: 14,
                                  ),
                                ),
                                Text(
                                  _order.delivery.courier.isNotEmpty
                                      ? _order.delivery.courier
                                      : 'Standard Delivery',
                                  style: AppTextStyles.b2Regular.copyWith(
                                    color: AppColors.primary500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: AppColors.primary900,
                              borderRadius: BorderRadius.circular(12),
                            ),
                            child: const Icon(
                              Icons.phone,
                              color: AppColors.primary0,
                              size: 20,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  bool _isStepCompleted(OrderStatus step) {
    const progression = [
      OrderStatus.pending,
      OrderStatus.processing,
      OrderStatus.shipped,
      OrderStatus.delivered,
    ];
    final currentIndex = progression.indexOf(_order.status);
    final stepIndex = progression.indexOf(step);
    return currentIndex >= stepIndex;
  }

  bool _routeInputsChanged(Order previousOrder, Order nextOrder) {
    return previousOrder.id != nextOrder.id ||
        !_sameAddressLocation(
          previousOrder.delivery.pickupAddress,
          nextOrder.delivery.pickupAddress,
        ) ||
        !_sameAddressLocation(
          previousOrder.delivery.destinationAddress,
          nextOrder.delivery.destinationAddress,
        );
  }

  bool _sameAddressLocation(OrderAddress a, OrderAddress b) {
    return a.latitude == b.latitude && a.longitude == b.longitude;
  }

  LatLng get _pickupPoint {
    final pickup = _order.delivery.pickupAddress;
    if (_isValidCoordinate(pickup.latitude, pickup.longitude)) {
      return LatLng(pickup.latitude, pickup.longitude);
    }
    return _fallbackShop;
  }

  LatLng _destinationPoint(LatLng pickup) {
    final destination = _order.delivery.destinationAddress;
    if (_isValidCoordinate(destination.latitude, destination.longitude)) {
      return LatLng(destination.latitude, destination.longitude);
    }

    if (pickup.latitude != _fallbackShop.latitude ||
        pickup.longitude != _fallbackShop.longitude) {
      return _fallbackDestination;
    }

    return LatLng(pickup.latitude + 0.01, pickup.longitude + 0.01);
  }

  bool get _usedFallbackRoute => _roadRoute?.isFallback ?? false;

  List<LatLng> _resolvedRoutePoints(LatLng pickup, LatLng destination) {
    final points = _roadRoute?.points;
    if (points != null && points.length >= 2) {
      return points;
    }
    return [pickup, destination];
  }

  void _handleMapReady() {
    _isMapReady = true;
    _scheduleCameraFit();
  }

  void _scheduleCameraFit() {
    if (!_isMapReady || !mounted) {
      return;
    }

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted || !_isMapReady) {
        return;
      }

      final pickup = _pickupPoint;
      final destination = _destinationPoint(pickup);
      final routePoints = _resolvedRoutePoints(pickup, destination);
      final traveledRoute = _pathUntilProgress(routePoints, _progressByStatus);
      final truckPoint = traveledRoute.isNotEmpty ? traveledRoute.last : pickup;

      _mapController.fitCamera(
        _cameraFitFor(
          routePoints: routePoints,
          driverPoint: truckPoint,
          origin: pickup,
          destination: destination,
        ),
      );
    });
  }

  CameraFit _cameraFitFor({
    required List<LatLng> routePoints,
    required LatLng driverPoint,
    required LatLng origin,
    required LatLng destination,
  }) {
    return CameraFit.coordinates(
      coordinates: [...routePoints, origin, destination, driverPoint],
      padding: const EdgeInsets.fromLTRB(40, 40, 40, 132),
      maxZoom: 15.5,
      minZoom: 3,
    );
  }

  double get _progressByStatus {
    return switch (_order.status) {
      OrderStatus.pending => 0.05,
      OrderStatus.processing => 0.20,
      OrderStatus.shipped => 0.68,
      OrderStatus.delivered => 1.0,
      OrderStatus.cancelled => 0.0,
    };
  }

  List<LatLng> _pathUntilProgress(List<LatLng> points, double progress) {
    if (points.length < 2) {
      return points;
    }

    final clampedProgress = progress.clamp(0.0, 1.0);
    if (clampedProgress <= 0) {
      return [points.first];
    }
    if (clampedProgress >= 1) {
      return points;
    }

    final distance = const Distance();
    final segmentMeters = <double>[];
    double totalMeters = 0;

    for (int i = 0; i < points.length - 1; i += 1) {
      final meters = distance.as(LengthUnit.Meter, points[i], points[i + 1]);
      segmentMeters.add(meters);
      totalMeters += meters;
    }

    if (totalMeters <= 0) {
      return [points.first];
    }

    final targetMeters = totalMeters * clampedProgress;
    double walked = 0;
    final traveled = <LatLng>[points.first];

    for (int i = 0; i < segmentMeters.length; i += 1) {
      final segment = segmentMeters[i];
      final from = points[i];
      final to = points[i + 1];

      if (walked + segment >= targetMeters) {
        final remain = targetMeters - walked;
        final t = segment <= 0 ? 0.0 : remain / segment;
        traveled.add(_lerpPoint(from, to, t));
        return traveled;
      }

      walked += segment;
      traveled.add(to);
    }

    return traveled;
  }

  bool _isValidCoordinate(double lat, double lng) {
    return lat >= -90 &&
        lat <= 90 &&
        lng >= -180 &&
        lng <= 180 &&
        (lat != 0 || lng != 0);
  }

  LatLng _lerpPoint(LatLng from, LatLng to, double t) {
    final normalizedT = t.clamp(0.0, 1.0);
    final lat = from.latitude + (to.latitude - from.latitude) * normalizedT;
    final lng = from.longitude + (to.longitude - from.longitude) * normalizedT;
    return LatLng(lat, lng);
  }
}

class _AddressRow extends StatelessWidget {
  const _AddressRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          width: 84,
          child: Text(
            label,
            style: AppTextStyles.b2Regular.copyWith(
              color: AppColors.primary500,
            ),
          ),
        ),
        const SizedBox(width: 6),
        Expanded(
          child: Text(
            value,
            style: AppTextStyles.b2Regular.copyWith(
              color: AppColors.primary900,
            ),
          ),
        ),
      ],
    );
  }
}

class _MapMarker extends StatelessWidget {
  const _MapMarker({required this.icon, required this.color});

  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        shape: BoxShape.circle,
        border: Border.all(color: color.withValues(alpha: 0.5)),
      ),
      child: Icon(icon, color: color, size: 24),
    );
  }
}

class _MapInfoChip extends StatelessWidget {
  const _MapInfoChip({required this.label});

  final String label;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: AppColors.primary0.withValues(alpha: 0.92),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.primary100),
      ),
      child: Text(
        label,
        style: AppTextStyles.b2Regular.copyWith(
          color: AppColors.primary800,
          fontSize: 11,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }
}

class _StatusStep extends StatelessWidget {
  const _StatusStep({
    required this.title,
    required this.subtitle,
    required this.isCompleted,
    required this.isLast,
  });

  final String title;
  final String subtitle;
  final bool isCompleted;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isCompleted ? AppColors.primary900 : AppColors.primary0,
                border: Border.all(
                  color: isCompleted
                      ? AppColors.primary900
                      : AppColors.primary200,
                  width: 2,
                ),
              ),
              child: isCompleted
                  ? const Icon(Icons.check, color: AppColors.primary0, size: 14)
                  : null,
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 48,
                color: isCompleted
                    ? AppColors.primary900
                    : AppColors.primary200,
              ),
          ],
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Padding(
            padding: const EdgeInsets.only(bottom: 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTextStyles.b1Medium.copyWith(
                    fontSize: 14,
                    color: isCompleted
                        ? AppColors.primary900
                        : AppColors.primary400,
                  ),
                ),
                Text(
                  subtitle,
                  style: AppTextStyles.b2Regular.copyWith(
                    color: AppColors.primary500,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
