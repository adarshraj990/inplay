import createAgoraRtcEngine, { 
  IRtcEngine, 
  ChannelProfileType, 
  ClientRoleType,
  RtcConnection,
  IRtcEngineEventHandler
} from 'react-native-agora';
import { Platform, PermissionsAndroid } from 'react-native';

// Note: Replace with your actual Agora App ID in production
const AGORA_APP_ID = 'd4a3ee9b40a04436a1bc8743190a4183';

export class VoiceService {
  private static instance: VoiceService;
  private engine?: IRtcEngine;
  private isMuted: boolean = true;

  private constructor() {}

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  public async init(): Promise<void> {
    if (this.engine) return;

    if (Platform.OS === 'android') {
      await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ]);
    }

    this.engine = createAgoraRtcEngine();
    this.engine.initialize({
      appId: AGORA_APP_ID,
      channelProfile: ChannelProfileType.ChannelProfileCommunication,
    });

    this.engine.registerEventHandler({
      onJoinChannelSuccess: (connection: RtcConnection, elapsed: number) => {
        console.log('[Agora] Joined channel:', connection.channelId);
      },
      onError: (err: number, msg: string) => {
        console.error('[Agora] Error:', err, msg);
      },
      // @ts-ignore - Agora event handler types can be strict with library versions
    } as IRtcEngineEventHandler);

    // Default to muted
    await this.setMute(true);
  }

  public async joinChannel(token: string, channelName: string, uid: number): Promise<void> {
    if (!this.engine) await this.init();
    
    console.log(`[Agora] Joining channel ${channelName} as uid ${uid}`);
    this.engine?.joinChannel(token, channelName, uid, {
      clientRoleType: ClientRoleType.ClientRoleBroadcaster,
    });
  }

  public async setMute(muted: boolean): Promise<void> {
    this.isMuted = muted;
    await this.engine?.muteLocalAudioStream(muted);
    console.log(`[Agora] Microphone ${muted ? 'MUTED' : 'UNMUTED'}`);
  }

  public async leaveChannel(): Promise<void> {
    await this.engine?.leaveChannel();
    console.log('[Agora] Left channel');
  }

  public destroy(): void {
    this.engine?.release();
    this.engine = undefined;
  }
}
