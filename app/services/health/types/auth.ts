/**
 * Authorization request status enumeration
 */
export enum AuthorizationRequestStatus {
  unknown = 0,
  shouldRequest = 1,
  unnecessary = 2
}

/**
 * Authorization status enumeration
 */
export enum AuthorizationStatus {
  notDetermined = 0,
  sharingDenied = 1,
  sharingAuthorized = 2
}