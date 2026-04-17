import { useEffect } from 'react';
import { VoiceService } from '../services/VoiceService';

export const useAgoraVoice = (
  userId: string, 
  agoraToken: string | null, 
  channelName: string | null, 
  phase: string, 
  currentSpeakerId: string | null
) => {
  useEffect(() => {
    const voice = VoiceService.getInstance();

    const setupVoice = async () => {
      if (agoraToken && channelName) {
        // Deterministic UID from userId string
        const uid = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        await voice.joinChannel(agoraToken, channelName, uid);
        
        // Initial state: Muted
        await voice.setMute(true);
      }
    };

    setupVoice();

    return () => {
      voice.leaveChannel();
    };
  }, [agoraToken, channelName, userId]);

  // Turn-based Microphone Control
  useEffect(() => {
    const voice = VoiceService.getInstance();
    
    if (phase === 'DISCUSSION') {
      const isMyTurn = currentSpeakerId === userId;
      voice.setMute(!isMyTurn);
    } else {
      // Mute in all other phases (Reveal, Voting, Result)
      voice.setMute(true);
    }
  }, [phase, currentSpeakerId, userId]);
};
