# mobile

A new Flutter project.

## Getting Started

This project is a starting point for a Flutter application.

## Routing config

Order tracking uses OSRM-compatible road routing for the map path. By default it
targets the public OSRM demo server, so no API key is required.

Optional `.env` values:

```env
ROUTING_BASE_URL=https://router.project-osrm.org
ROUTING_PROFILE=driving
ROUTING_TIMEOUT_SECONDS=12
```

If you move to a private routing backend later, point `ROUTING_BASE_URL` at that
service.

A few resources to get you started if this is your first Flutter project:

- [Lab: Write your first Flutter app](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Useful Flutter samples](https://docs.flutter.dev/cookbook)

For help getting started with Flutter development, view the
[online documentation](https://docs.flutter.dev/), which offers tutorials,
samples, guidance on mobile development, and a full API reference.
