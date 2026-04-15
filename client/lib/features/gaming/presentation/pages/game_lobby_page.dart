// lib/features/gaming/presentation/pages/game_lobby_page.dart — stub
import 'package:flutter/material.dart';

class GameLobbyPage extends StatelessWidget {
  final String sessionId;
  const GameLobbyPage({super.key, required this.sessionId});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Game Session: $sessionId')),
      body: const Center(child: Text('Game Lobby — TODO: implement')),
    );
  }
}
