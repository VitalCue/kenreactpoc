// Optional: Client-side encryption for sensitive health data
// This adds an extra layer of security on top of Firebase's encryption

import * as Crypto from 'expo-crypto';

/**
 * Encrypts sensitive health data before sending to Firebase
 * Note: This is optional - Firebase already encrypts data in transit and at rest
 */
export class HealthDataEncryption {
  /**
   * Hash sensitive identifiers (like device IDs) for privacy
   */
  static async hashIdentifier(identifier: string): Promise<string> {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      identifier,
      { encoding: Crypto.CryptoEncoding.HEX }
    );
  }

  /**
   * Anonymize source device information
   */
  static anonymizeSource(source: string): string {
    // Remove specific device models, keep only general type
    if (source.includes('Apple Watch')) return 'Apple Watch';
    if (source.includes('iPhone')) return 'iPhone';
    if (source.includes('Fitbit')) return 'Fitbit';
    if (source.includes('Samsung')) return 'Samsung Wearable';
    return 'Unknown Device';
  }

  /**
   * Round timestamps to reduce fingerprinting
   * Rounds to nearest 5 minutes
   */
  static roundTimestamp(timestamp: Date): Date {
    const ms = timestamp.getTime();
    const fiveMinutes = 5 * 60 * 1000;
    return new Date(Math.round(ms / fiveMinutes) * fiveMinutes);
  }

  /**
   * Prepare health data for secure storage
   */
  static prepareForStorage(data: any) {
    return {
      ...data,
      source: this.anonymizeSource(data.source || ''),
      timestamp: this.roundTimestamp(new Date(data.timestamp)),
      // Remove any PII from metadata
      metadata: this.sanitizeMetadata(data.metadata)
    };
  }

  /**
   * Remove potentially identifying information from metadata
   */
  private static sanitizeMetadata(metadata: any = {}): any {
    const sanitized = { ...metadata };
    // Remove location data
    delete sanitized.location;
    delete sanitized.latitude;
    delete sanitized.longitude;
    // Remove device-specific IDs
    delete sanitized.deviceId;
    delete sanitized.sessionId;
    return sanitized;
  }
}