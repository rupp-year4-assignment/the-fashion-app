import 'package:flutter/material.dart';

class SavedItem {
  final String title;
  final String price;
  final Color color;

  SavedItem({
    required this.title,
    required this.price,
    required this.color,
  });
}

// GLOBAL LIST
final List<SavedItem> savedItems = [];
