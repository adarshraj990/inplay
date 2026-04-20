import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../bloc/social_bloc.dart';
import 'package:indplay_client/features/auth/domain/entities/auth_user.dart';

class FriendsPage extends StatefulWidget {
  const FriendsPage({super.key});

  @override
  State<FriendsPage> createState() => _FriendsPageState();
}

class _FriendsPageState extends State<FriendsPage> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    context.read<SocialBloc>().add(SocialFetchFriendsEvent());
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0A0F),
      appBar: AppBar(
        backgroundColor: const Color(0xFF16161E),
        title: const Text('Social Hub', style: TextStyle(fontWeight: FontWeight.bold)),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: const Color(0xFF6C5CE7),
          indicatorWeight: 3,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white38,
          tabs: const [
            Tab(text: 'Friends'),
            Tab(text: 'Requests'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.person_add_alt_1),
            onPressed: () {
              // TODO: implement search/add friend dialog
            },
          ),
        ],
      ),
      body: BlocBuilder<SocialBloc, SocialState>(
        builder: (context, state) {
          if (state.isLoading) {
            return const Center(child: CircularProgressIndicator(color: Color(0xFF6C5CE7)));
          }

          if (state.error != null) {
            return Center(
              child: Text(state.error!, style: const TextStyle(color: Colors.redAccent)),
            );
          }

          return TabBarView(
            controller: _tabController,
            children: [
              _buildFriendsList(state.friends, state.onlineUserIds),
              _buildRequestsList(state.pendingRequests),
            ],
          );
        },
      ),
    );
  }

  Widget _buildFriendsList(List<AuthUser> friends, Set<String> onlineIds) {
    if (friends.isEmpty) {
      return _buildEmptyState('No friends yet', 'Discovery new players in games!');
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: friends.length,
      itemBuilder: (context, index) {
        final friend = friends[index];
        final isOnline = onlineIds.contains(friend.id);

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            color: Colors.white.withValues(alpha: 0.03),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.white.withValues(alpha: 0.05)),
          ),
          child: ListTile(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            leading: Stack(
              children: [
                CircleAvatar(
                  radius: 26,
                  backgroundColor: const Color(0xFF1A1A2E),
                  backgroundImage: friend.avatarUrl != null 
                      ? CachedNetworkImageProvider(friend.avatarUrl!) 
                      : null,
                  child: friend.avatarUrl == null 
                      ? const Icon(Icons.person, color: Colors.white24) 
                      : null,
                ),
                Positioned(
                  right: 2,
                  bottom: 2,
                  child: Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: isOnline ? Colors.greenAccent : Colors.white24,
                      shape: BoxShape.circle,
                      border: Border.all(color: const Color(0xFF0A0A0F), width: 2),
                    ),
                  ),
                ),
              ],
            ),
            title: Text(
              friend.displayName,
              style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
            ),
            subtitle: Text(
              isOnline ? 'Online' : 'Offline',
              style: TextStyle(color: isOnline ? Colors.greenAccent.withValues(alpha: 0.7) : Colors.white24, fontSize: 12),
            ),
            trailing: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                _buildActionIcon(Icons.chat_bubble_outline, () {
                  // Navigate to chat
                  context.push('/chat/${friend.id}'); // Using friend ID as temporary room ID for 1:1
                }),
                const SizedBox(width: 8),
                _buildActionIcon(Icons.gamepad_outlined, () {
                   // Invite to game logic
                }),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _buildRequestsList(List<AuthUser> requests) {
    if (requests.isEmpty) {
      return _buildEmptyState('No pending requests', 'New friends will show up here.');
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: requests.length,
      itemBuilder: (context, index) {
        final user = requests[index];
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: const Color(0xFF16161E),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              CircleAvatar(
                radius: 24,
                backgroundImage: user.avatarUrl != null ? CachedNetworkImageProvider(user.avatarUrl!) : null,
                child: user.avatarUrl == null ? const Icon(Icons.person) : null,
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(user.displayName, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                    Text('@${user.username}', style: const TextStyle(color: Colors.white38, fontSize: 12)),
                  ],
                ),
              ),
              IconButton(
                icon: const Icon(Icons.check_circle, color: Colors.greenAccent),
                onPressed: () {
                  // TODO: implement accept logic
                },
              ),
              IconButton(
                icon: const Icon(Icons.cancel, color: Colors.redAccent),
                onPressed: () {
                   // TODO: implement reject logic
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildActionIcon(IconData icon, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.all(8),
        decoration: BoxDecoration(
          color: Colors.white.withValues(alpha: 0.05),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: Colors.white70, size: 20),
      ),
    );
  }

  Widget _buildEmptyState(String title, String subtitle) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.people_outline, color: Colors.white10, size: 80),
          const SizedBox(height: 16),
          Text(title, style: const TextStyle(color: Colors.white60, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          Text(subtitle, style: const TextStyle(color: Colors.white24, fontSize: 14)),
        ],
      ),
    );
  }
}
