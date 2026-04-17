# Indplay Socket Event Documentation (Phase 2)

This document outlines the real-time events used in the "Who Is The Spy" game engine for Phase 2: Role Distribution.

## 1. Global Game Events
These events are emitted to the entire room: `game:whoisspy:{sessionId}`.

### `game:start_reveal`
- **Direction**: Server -> Client
- **Purpose**: Signals all clients to trigger the "Fingerprint Scan" / "Role Reveal" UI animation.
- **Payload**: None

### `game:sync` (Updated)
- **Direction**: Server -> Client
- **Purpose**: Canonical state synchronization.
- **Payload**:
```json
{
  "phase": "REVEAL", // LOBBY, REVEAL, DISCUSSION, VOTING, RESULT
  "timer": 10,       // Seconds remaining in phase
  "players": [
    { "userId": "...", "isAlive": true, "level": 1, "xp": 0 }
  ],
  "currentSpeakerId": null
}
```

---

## 2. Secure Private Events
These events are emitted to private user rooms: `user:{userId}`. They are invisible to other players.

### `game:whoisspy:role_data`
- **Direction**: Server -> Client
- **Purpose**: Delivers the secret role and word to the individual player.
- **Payload**:
```json
{
  "role": "Citizen" | "Spy",
  "word": "Coffee",
  "agoraToken": "..." // Audio token for the voice channel
}
```

---

## 3. Client emitted events

### `lobby:join` (Already in Phase 1)
- **Payload**: `{ "sessionId": "..." }`

### `game:whoisspy:get_role` (Optional/Legacy)
- **Purpose**: If a client misses the initial push, they can request their role again.
- **Response**: Triggers a private `game:whoisspy:role_data`.
