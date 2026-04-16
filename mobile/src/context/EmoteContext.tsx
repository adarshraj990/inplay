import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface EmoteEvent {
  userId: string;
  emoji: string;
  timestamp: number;
}

interface EmoteContextType {
  activeEmotes: Record<string, EmoteEvent | null>;
  triggerEmote: (sessionId: string, gameType: string, emoji: string) => void;
  broadcastEmote: (userId: string, emoji: string) => void;
}

const EmoteContext = createContext<EmoteContextType | undefined>(undefined);

export const EmoteProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeEmotes, setActiveEmotes] = useState<Record<string, EmoteEvent | null>>({});

  // Internal trigger to show emote locally (or via socket broadcast)
  const broadcastEmote = useCallback((userId: string, emoji: string) => {
    const event: EmoteEvent = { userId, emoji, timestamp: Date.now() };
    
    setActiveEmotes(prev => ({ ...prev, [userId]: event }));

    // Reset after animation duration (2.5s)
    setTimeout(() => {
      setActiveEmotes(prev => {
        if (prev[userId]?.timestamp === event.timestamp) {
          return { ...prev, [userId]: null };
        }
        return prev;
      });
    }, 3000); // Slightly longer than animation
  }, []);

  // API to trigger an emote via socket
  const triggerEmote = useCallback((sessionId: string, gameType: string, emoji: string) => {
    // In a real app: socket.emit('expression:trigger', { sessionId, gameType, emoji });
    // For now, we simulate broadcasting locally for the current user
    console.log(`[Emote] Triggering ${emoji} in room ${sessionId}`);
    broadcastEmote('1', emoji); // Assume '1' is current user ID
  }, [broadcastEmote]);

  return (
    <EmoteContext.Provider value={{ activeEmotes, triggerEmote, broadcastEmote }}>
      {children}
    </EmoteContext.Provider>
  );
};

export const useEmotes = () => {
  const context = useContext(EmoteContext);
  if (!context) throw new Error('useEmotes must be used within an EmoteProvider');
  return context;
};
