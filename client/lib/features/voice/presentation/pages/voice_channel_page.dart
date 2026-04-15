// lib/features/voice/presentation/pages/voice_channel_page.dart — stub
import 'package:flutter/material.dart';

class VoiceChannelPage extends StatelessWidget {
  final String channelId;
  const VoiceChannelPage({super.key, required this.channelId});
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Voice: $channelId')),
      body: const Center(child: Text('Voice Channel — TODO: implement WebRTC')),
    );
  }
}
