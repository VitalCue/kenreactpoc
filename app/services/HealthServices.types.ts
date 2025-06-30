import type { AnyMap } from 'react-native-nitro-modules';

export enum AuthorizationRequestStatus {
    unknown = 0,
    shouldRequest = 1,
    unnecessary = 2
}
export enum AuthorizationStatus {
    notDetermined = 0,
    sharingDenied = 1,
    sharingAuthorized = 2
}
//Porting of our own type from the healthkit library, used for most of the apple health objects
export interface QuantitySample {
    readonly uuid: string;
    readonly device?: any; //Device object used by apple
    readonly quantityType: any; //Object used by apple
    readonly startDate: Date;
    readonly endDate: Date;
    readonly quantity: number;
    readonly unit: string;
    readonly metadata: AnyMap;
    readonly sourceRevision?: any; //SourceRevision object used by apple
}

export interface HealthData { 
    steps: QuantitySample | undefined;
    heartRate: QuantitySample | undefined;
    //can add other quantity samples
}

export interface HealthServiceHook {
    isAvailable: boolean;
    authStatus: AuthorizationRequestStatus;
    requestAuth: () => Promise<AuthorizationRequestStatus>;
    stepData: QuantitySample | undefined;
    heartRateData: QuantitySample | undefined;
    getMostRecentData: () => Promise<HealthData>;
    AuthorizationRequestStatus: typeof AuthorizationRequestStatus;

}

