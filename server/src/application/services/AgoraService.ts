import { RtcTokenBuilder, RtcRole } from 'agora-token';
import { AppConfig } from "../../shared/config/AppConfig.js";
import { Logger } from "../../shared/utils/Logger.js";

const logger = Logger.getInstance();
const config = AppConfig.getInstance();

export class AgoraService {
  private static instance: AgoraService;

  private constructor() {}

  public static getInstance(): AgoraService {
    if (!AgoraService.instance) {
      AgoraService.instance = new AgoraService();
    }
    return AgoraService.instance;
  }

  /**
   * Generates an RTC token for a specific user and channel.
   * Agora RTC requires numeric UIDs, so we hash the string userId.
   */
  public generateRtcToken(channelName: string, userId: string): string {
    const appId = config.agoraAppId;
    const appCertificate = config.agoraAppCertificate;
    const role = RtcRole.PUBLISHER;

    // Convert string userId to a numeric UID for Agora
    const uid = this.stringToUid(userId);
    
    // Token expiration time in seconds (e.g., 1 hour)
    const expirationTimeInSeconds = 3600;
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    logger.debug(`Generating Agora RTC token for channel: ${channelName}, userId: ${userId} (uid: ${uid})`);

    try {
      const token = RtcTokenBuilder.buildTokenWithUid(
        appId,
        appCertificate,
        channelName,
        uid,
        role,
        privilegeExpiredTs,
        privilegeExpiredTs // Use same for overall and privilege expiration for simplicity
      );
      return token;
    } catch (error: any) {
      logger.error(`Failed to generate Agora token: ${error.message}`);
      throw new Error('Agora token generation failed');
    }
  }

  /**
   * Simple deterministic hashing to convert string UUID to a numeric UID.
   */
  private stringToUid(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}
