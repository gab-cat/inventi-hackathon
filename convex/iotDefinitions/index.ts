// Web functions - direct export
export * from './web/mutations/handleWaterMeterReading';
export * from './web/mutations/handleElectricityMeterReading';
export * from './web/queries/getIoTDevices';
export * from './web/queries/getIoTReadings';

// Mobile functions - renamed export
export {
  mobileGetIoTDevicesArgs as getIoTDevicesArgs,
  mobileGetIoTDevicesHandler as getIoTDevicesHandler,
} from './mobile/queries/mobileGetIoTDevices';

export {
  mobileGetIoTReadingsArgs as getIoTReadingsMobileArgs,
  mobileGetIoTReadingsHandler as getIoTReadingsMobileHandler,
} from './mobile/queries/mobileGetIoTReadings';