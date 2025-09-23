import React from 'react';
import { RefreshControl, View, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useQuery } from 'convex/react';

import { ThemedView } from '@/components/themed-view';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { PageHeader } from '@/components/ui/page-header';
import { Cpu, Droplets, Zap, AlertTriangle, CheckCircle, Clock, X, ChevronRight } from 'lucide-react-native';
import { Id } from '@convex/_generated/dataModel';
import { api } from '@convex/_generated/api';

type Device = {
  _id: Id<'iotDevices'>;
  deviceId: string;
  deviceType: string;
  deviceName: string;
  location: string;
  isActive: boolean;
  lastReadingAt?: number;
};

type Reading = {
  _id: Id<'iotReadings'>;
  deviceId: Id<'iotDevices'>;
  readingType: string;
  value: number;
  unit: string;
  timestamp: number;
  isAnomaly: boolean;
  anomalyReason?: string;
};

export default function IoTScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [selectedDevice, setSelectedDevice] = React.useState<Device | null>(null);
  const [modalVisible, setModalVisible] = React.useState(false);

  // Get IoT devices
  const devicesData = useQuery(api.iot.getIoTDevicesMobile, {});
  const devices = devicesData?.success ? devicesData.devices : [];

  // Get recent readings for each device
  const readingsData = useQuery(api.iot.getIoTReadingsMobile, {
    limit: 50,
  });
  const readings = readingsData?.success ? readingsData.readings : [];

  const isLoading = devicesData === undefined || readingsData === undefined;

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  const handleDevicePress = (device: Device) => {
    setSelectedDevice(device);
    setModalVisible(true);
  };

  const getDeviceReadings = (deviceId: Id<'iotDevices'>) => {
    return readings?.filter(reading => reading.deviceId === deviceId) || [];
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'water_meter':
        return Droplets;
      case 'electricity_meter':
        return Zap;
      default:
        return Cpu;
    }
  };

  const getDeviceColor = (deviceType: string) => {
    switch (deviceType) {
      case 'water_meter':
        return '#3B82F6'; // blue
      case 'electricity_meter':
        return '#F59E0B'; // yellow
      default:
        return '#6B7280'; // gray
    }
  };

  const getDeviceBgColor = (deviceType: string) => {
    switch (deviceType) {
      case 'water_meter':
        return 'bg-blue-50';
      case 'electricity_meter':
        return 'bg-yellow-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getReadingStatus = (reading: Reading) => {
    if (reading.isAnomaly) {
      return { icon: AlertTriangle, color: '#EF4444', bgColor: 'bg-red-50', status: 'Anomaly' };
    }
    return { icon: CheckCircle, color: '#10B981', bgColor: 'bg-green-50', status: 'Normal' };
  };

  const formatValue = (value: number, unit: string, readingType: string) => {
    if (readingType === 'water_consumption') {
      return `${value.toFixed(2)} ${unit}`;
    } else if (readingType === 'electricity_consumption') {
      return `${value.toFixed(2)} ${unit}`;
    }
    return `${value} ${unit}`;
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) {
      return `${Math.floor(diffMs / (1000 * 60))}m ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <ThemedView style={{ flex: 1 }} className='bg-background'>
      <PageHeader title='IoT Devices' subtitle='Monitor smart devices and sensors' type='back' />

      <ScrollView
        className='flex-1 bg-slate-50'
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View className='p-5'>
          {/* Devices Section */}
          <View className='mb-8'>
            <View className='flex-row items-center mb-4'>
              <View className='w-1 h-6 bg-blue-800 rounded-sm mr-3' />
              <Text className='text-xl font-bold text-blue-800'>Connected Devices</Text>
            </View>

            {isLoading ? (
              <View className='py-8 items-center bg-white rounded-2xl'>
                <View className='w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin' />
                <Text className='text-sm text-gray-500 mt-3'>Loading devices...</Text>
              </View>
            ) : !devices || devices.length === 0 ? (
              <View className='py-16 items-center bg-white rounded-2xl'>
                <View className={`w-20 h-20 rounded-[20px] bg-gray-50 items-center justify-center mb-5`}>
                  <Icon as={Cpu} size={40} className='text-gray-400' />
                </View>
                <Text className='text-xl font-bold text-blue-800 mb-2'>No IoT Devices</Text>
                <Text className='text-sm text-gray-500 text-center leading-5 px-8'>
                  No IoT devices are currently connected to your properties.
                </Text>
              </View>
            ) : (
              <View className='gap-3'>
                {devices?.map(device => {
                  const DeviceIcon = getDeviceIcon(device.deviceType);
                  const deviceColor = getDeviceColor(device.deviceType);
                  const deviceBgColor = getDeviceBgColor(device.deviceType);

                  return (
                    <TouchableOpacity
                      key={device._id}
                      onPress={() => handleDevicePress(device)}
                      className='bg-white rounded-xl p-4 border border-gray-100'
                    >
                      <View className='flex-row items-center'>
                        <View className={`w-12 h-12 rounded-xl ${deviceBgColor} items-center justify-center mr-4`}>
                          <Icon as={DeviceIcon} size={24} className={`text-[${deviceColor}]`} />
                        </View>
                        <View className='flex-1'>
                          <Text className='text-lg font-semibold text-gray-900 mb-1'>{device.deviceName}</Text>
                          <Text className='text-sm text-gray-600 mb-1'>
                            {device.deviceType.replace('_', ' ').toUpperCase()}
                          </Text>
                          <Text className='text-xs text-gray-500'>Location: {device.location}</Text>
                          {device.lastReadingAt && (
                            <Text className='text-xs text-gray-500'>
                              Last reading: {formatTimestamp(device.lastReadingAt)}
                            </Text>
                          )}
                        </View>
                        <View className='flex-row items-center gap-2'>
                          <View className={`px-2 py-1 rounded-full ${device.isActive ? 'bg-green-100' : 'bg-red-100'}`}>
                            <Text
                              className={`text-xs font-medium ${device.isActive ? 'text-green-700' : 'text-red-700'}`}
                            >
                              {device.isActive ? 'Active' : 'Inactive'}
                            </Text>
                          </View>
                          <Icon as={ChevronRight} size={16} className='text-gray-400' />
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>

          {/* Recent Readings Section */}
          {readings && readings.length > 0 && (
            <View className='mb-8'>
              <View className='flex-row items-center mb-4'>
                <View className='w-1 h-6 bg-blue-800 rounded-sm mr-3' />
                <Text className='text-xl font-bold text-blue-800'>Recent Readings</Text>
              </View>

              <View className='gap-3'>
                {readings.slice(0, 10).map(reading => {
                  const device = devices?.find(d => d._id === reading.deviceId);
                  const statusInfo = getReadingStatus(reading);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <View key={reading._id} className='bg-white rounded-xl p-4 border border-gray-100'>
                      <View className='flex-row items-center justify-between mb-2'>
                        <Text className='text-sm font-medium text-gray-900'>
                          {device?.deviceName || 'Unknown Device'}
                        </Text>
                        <View className={`flex-row items-center gap-1 px-2 py-1 rounded-lg ${statusInfo.bgColor}`}>
                          <Icon as={StatusIcon} size={12} className={`text-[${statusInfo.color}]`} />
                          <Text className={`text-xs font-medium text-[${statusInfo.color}]`}>{statusInfo.status}</Text>
                        </View>
                      </View>

                      <View className='flex-row items-center justify-between'>
                        <View className='flex-1'>
                          <Text className='text-lg font-bold text-gray-900'>
                            {formatValue(reading.value, reading.unit, reading.readingType)}
                          </Text>
                          <Text className='text-xs text-gray-500'>
                            {reading.readingType.replace('_', ' ').toUpperCase()}
                          </Text>
                        </View>
                        <View className='items-end'>
                          <Text className='text-xs text-gray-500'>{formatTimestamp(reading.timestamp)}</Text>
                          {reading.isAnomaly && reading.anomalyReason && (
                            <Text className='text-xs text-red-600 mt-1 max-w-32' numberOfLines={2}>
                              {reading.anomalyReason}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Info Section */}
          <View className='bg-white rounded-xl p-4 border border-gray-100 shadow-sm'>
            <View className='flex-row items-center mb-3'>
              <Icon as={Cpu} size={20} className='text-blue-600 mr-2' />
              <Text className='text-base font-semibold text-blue-800'>IoT Monitoring</Text>
            </View>
            <Text className='text-sm text-gray-600 leading-5 mb-3'>
              Monitor your property&apos;s smart devices including water meters, electricity meters, and other IoT
              sensors. Get real-time readings and anomaly alerts.
            </Text>
            <Text className='text-xs text-gray-500'>
              Data is updated automatically when devices send readings to our webhook endpoints.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Device Details Modal */}
      <Modal
        animationType='slide'
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className='flex-1 bg-black/50 justify-end'>
          <View className='bg-white rounded-t-3xl' style={{ maxHeight: '85%', minHeight: '60%' }}>
            {/* Modal Header with Gradient */}
            <View className='relative'>
              <View className='absolute inset-0 opacity-10'>
                <View className='absolute top-4 right-8 w-12 h-12 rounded-full bg-white' />
                <View className='absolute bottom-4 left-6 w-6 h-6 rounded-full bg-white' />
                <View className='absolute top-6 left-8 w-3 h-3 rounded-full bg-white' />
              </View>

              <View
                className={`relative pt-8 rounded-t-3xl pb-6 px-6 ${selectedDevice?.deviceType === 'water_meter' ? 'bg-blue-800' : selectedDevice?.deviceType === 'electricity_meter' ? 'bg-yellow-800' : 'bg-gray-800'}`}
              >
                <View className='flex-row items-center justify-between'>
                  <View className='flex-1'>
                    <View className='flex-row items-center mb-2'>
                      <View
                        className={`w-10 h-10 rounded-xl ${getDeviceBgColor(selectedDevice?.deviceType || 'cpu')} items-center justify-center mr-3`}
                      >
                        <Icon
                          as={getDeviceIcon(selectedDevice?.deviceType || 'cpu')}
                          size={20}
                          className={`text-[${getDeviceColor(selectedDevice?.deviceType || 'cpu')}]`}
                        />
                      </View>
                      <Text className='text-2xl font-bold text-white'>Device Details</Text>
                    </View>
                    <Text className='text-white/80 text-sm font-medium'>Real-time monitoring & analytics</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setModalVisible(false)}
                    className='h-10 w-10 rounded-full bg-white/10 border border-white/20 items-center justify-center'
                  >
                    <Icon as={X} size={18} className='text-white' />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {selectedDevice && (
              <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{
                  padding: 20,
                  paddingBottom: 40,
                }}
                showsVerticalScrollIndicator={false}
              >
                {/* Device Status Card */}
                <View className='bg-white rounded-xl p-5 mb-4 border border-gray-100 shadow-sm'>
                  <View className='flex-row items-center justify-between mb-4'>
                    <View className='flex-row items-center'>
                      <View
                        className={`w-14 h-14 rounded-xl ${getDeviceBgColor(selectedDevice.deviceType)} items-center justify-center mr-4`}
                      >
                        <Icon
                          as={getDeviceIcon(selectedDevice.deviceType)}
                          size={28}
                          className={`text-[${getDeviceColor(selectedDevice.deviceType)}]`}
                        />
                      </View>
                      <View>
                        <Text className='text-xl font-bold text-gray-900 mb-1'>{selectedDevice.deviceName}</Text>
                        <Text className='text-sm text-gray-600'>
                          {selectedDevice.deviceType.replace('_', ' ').toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <View
                      className={`px-3 py-1.5 rounded-full ${selectedDevice.isActive ? 'bg-green-100 border border-green-200' : 'bg-red-100 border border-red-200'}`}
                    >
                      <View className='flex-row items-center'>
                        <View
                          className={`w-2 h-2 rounded-full mr-2 ${selectedDevice.isActive ? 'bg-green-500' : 'bg-red-500'}`}
                        />
                        <Text
                          className={`text-xs font-semibold ${selectedDevice.isActive ? 'text-green-700' : 'text-red-700'}`}
                        >
                          {selectedDevice.isActive ? 'Online' : 'Offline'}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Device Info Grid */}
                  <View className='flex-row justify-between'>
                    <View className='flex-1 mr-4'>
                      <Text className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-1'>Location</Text>
                      <Text className='text-gray-900 font-medium'>{selectedDevice.location}</Text>
                    </View>
                    {selectedDevice.lastReadingAt && (
                      <View className='flex-1'>
                        <Text className='text-xs font-medium text-gray-500 uppercase tracking-wide mb-1'>
                          Last Reading
                        </Text>
                        <Text className='text-gray-900 font-medium'>
                          {formatTimestamp(selectedDevice.lastReadingAt)}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Recent Readings Section */}
                <View>
                  <View className='flex-row items-center justify-between mb-4'>
                    <Text className='text-lg font-bold text-gray-900'>Recent Readings</Text>
                    <View className='flex-row items-center bg-blue-50 border border-blue-200 rounded-lg px-3 py-1'>
                      <Icon as={Clock} size={14} className='text-blue-600 mr-1.5' />
                      <Text className='text-xs font-medium text-blue-700'>Live Data</Text>
                    </View>
                  </View>

                  {(() => {
                    const deviceReadings = readings ? getDeviceReadings(selectedDevice._id) : [];
                    if (deviceReadings.length === 0) {
                      return (
                        <View className='bg-white rounded-xl p-8 items-center border border-gray-100'>
                          <View className='w-16 h-16 rounded-full bg-gray-100 items-center justify-center mb-4'>
                            <Icon as={Clock} size={24} className='text-gray-400' />
                          </View>
                          <Text className='text-gray-900 font-medium mb-2'>No Readings Yet</Text>
                          <Text className='text-gray-600 text-sm text-center'>
                            This device hasn&apos;t reported any readings yet. Check back soon for live data.
                          </Text>
                        </View>
                      );
                    }

                    return (
                      <View className='gap-3'>
                        {deviceReadings.slice(0, 15).map((reading, index) => {
                          const statusInfo = getReadingStatus(reading);
                          const StatusIcon = statusInfo.icon;
                          const isLatest = index === 0;

                          return (
                            <View
                              key={reading._id}
                              className={`bg-white border rounded-xl p-4 ${isLatest ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100'}`}
                            >
                              {isLatest && (
                                <View className='flex-row items-center mb-3'>
                                  <View className='bg-blue-500 rounded-full px-2 py-0.5 mr-2'>
                                    <Text className='text-white text-xs font-semibold'>LATEST</Text>
                                  </View>
                                  <Text className='text-blue-600 text-xs font-medium'>Most recent reading</Text>
                                </View>
                              )}

                              <View className='flex-row items-center justify-between mb-3'>
                                <View className='flex-row items-center'>
                                  <View
                                    className={`w-8 h-8 rounded-lg ${statusInfo.bgColor} items-center justify-center mr-3`}
                                  >
                                    <Icon as={StatusIcon} size={14} className={`text-[${statusInfo.color}]`} />
                                  </View>
                                  <View>
                                    <Text className='text-sm font-semibold text-gray-900'>
                                      {reading.readingType.replace('_', ' ').toUpperCase()}
                                    </Text>
                                    <Text
                                      className={`text-xs font-medium ${statusInfo.status === 'Normal' ? 'text-green-600' : 'text-red-600'}`}
                                    >
                                      {statusInfo.status}
                                    </Text>
                                  </View>
                                </View>
                                <Text className='text-xs text-gray-500'>{formatTimestamp(reading.timestamp)}</Text>
                              </View>

                              <View className='flex-row items-center justify-between'>
                                <View className='flex-1'>
                                  <Text className='text-2xl font-bold text-gray-900 mb-1'>
                                    {formatValue(reading.value, reading.unit, reading.readingType)}
                                  </Text>
                                  <Text className='text-xs text-gray-600 uppercase tracking-wide'>{reading.unit}</Text>
                                </View>
                              </View>

                              {reading.isAnomaly && reading.anomalyReason && (
                                <View className='mt-4 p-3 bg-red-50 rounded-lg border border-red-200'>
                                  <View className='flex-row items-start'>
                                    <Icon as={AlertTriangle} size={16} className='text-red-500 mr-2 mt-0.5' />
                                    <View className='flex-1'>
                                      <Text className='text-red-800 text-sm font-medium mb-1'>Anomaly Detected</Text>
                                      <Text className='text-red-700 text-sm'>{reading.anomalyReason}</Text>
                                    </View>
                                  </View>
                                </View>
                              )}
                            </View>
                          );
                        })}
                      </View>
                    );
                  })()}
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}
