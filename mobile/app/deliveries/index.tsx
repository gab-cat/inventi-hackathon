import React, { useState, useCallback } from 'react';
import { ScrollView, RefreshControl, Alert, Modal, TextInput, TouchableOpacity, View, Text } from 'react-native';
import { useQuery, useMutation, useAction } from 'convex/react';
import { useRouter } from 'expo-router';
import { api } from '@convex/_generated/api';
import { Ionicons } from '@expo/vector-icons';

import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/providers/notification.provider';
import { Id } from '@convex/_generated/dataModel';
import { cn } from '@/lib/utils';

type DeliveryStatus = 'registered' | 'arrived' | 'collected' | 'failed' | 'returned';

interface Delivery {
  _id: Id<'deliveries'>;
  deliveryType: string;
  senderName: string;
  recipientName: string;
  description: string;
  estimatedDelivery: number;
  actualDelivery?: number;
  status: DeliveryStatus;
  trackingNumber?: string;
  property: {
    _id: Id<'properties'>;
    name: string;
    address: string;
  };
  unit?: {
    _id: Id<'units'>;
    unitNumber: string;
  };
  createdAt: number;
}

const statusColors = {
  registered: '#F59E0B',
  arrived: '#3B82F6',
  collected: '#059669',
  failed: '#EF4444',
  returned: '#6B7280',
};

const statusIcons = {
  registered: 'document-outline',
  arrived: 'cube-outline',
  collected: 'checkmark-done-outline',
  failed: 'close-circle-outline',
  returned: 'return-up-back-outline',
} as const;

export default function DeliveriesScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'all'>('all');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [issueDescription, setIssueDescription] = useState('');
  const [issueType, setIssueType] = useState<'damaged' | 'missing' | 'wrong_item' | 'other'>('other');

  const { isTokenRegistered } = useNotifications();

  // Fetch deliveries
  const deliveriesData = useQuery(api.delivery.getMyDeliveries, {
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit: 50,
  });

  // Fetch delivery logs for selected delivery
  const deliveryLogsData = useQuery(
    api.delivery.getDeliveryLog,
    selectedDelivery ? { deliveryId: selectedDelivery._id, paginationOpts: { numItems: 20, cursor: null } } : 'skip'
  );

  // Mutations
  const confirmDeliveryReceipt = useAction(api.delivery.confirmDeliveryReceipt);
  const reportDeliveryIssue = useMutation(api.delivery.reportDeliveryIssue);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const handleConfirmReceipt = async (delivery: Delivery) => {
    try {
      const result = await confirmDeliveryReceipt({
        deliveryId: delivery._id,
        notes: `Confirmed receipt via mobile app`,
      });

      if (result.success) {
        Alert.alert('Success', 'Delivery receipt confirmed successfully!');
      } else {
        Alert.alert('Error', result.message || 'Failed to confirm receipt');
      }
    } catch (error) {
      console.error('Error confirming receipt:', error);
      Alert.alert('Error', 'Failed to confirm delivery receipt');
    }
  };

  const handleReportIssue = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setShowIssueModal(true);
  };

  const handleViewDeliveryDetails = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setShowDetailModal(true);
  };

  const submitIssueReport = async () => {
    if (!selectedDelivery || !issueDescription.trim()) {
      Alert.alert('Error', 'Please provide a description of the issue');
      return;
    }

    try {
      const result = await reportDeliveryIssue({
        deliveryId: selectedDelivery._id,
        issueType,
        description: issueDescription,
      });

      if (result.success) {
        Alert.alert('Success', 'Issue reported successfully. A manager will be notified.');
        setShowIssueModal(false);
        setIssueDescription('');
        setSelectedDelivery(null);
      } else {
        Alert.alert('Error', result.message || 'Failed to report issue');
      }
    } catch (error) {
      console.error('Error reporting issue:', error);
      Alert.alert('Error', 'Failed to report delivery issue');
    }
  };

  const renderDeliveryCard = (delivery: Delivery) => {
    const statusColor = statusColors[delivery.status];
    const statusIcon = statusIcons[delivery.status];
    const canConfirm = ['arrived'].includes(delivery.status);
    const canReportIssue = !['collected', 'returned', 'failed'].includes(delivery.status);

    const cardContent = (
      <View className='bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-3'>
        {/* Header */}
        <View className='flex-row items-center justify-between mb-3'>
          <View className='flex-row items-center flex-1'>
            <View
              className='w-10 h-10 rounded-full items-center justify-center mr-3'
              style={{ backgroundColor: `${statusColor}20` }}
            >
              <Ionicons name={statusIcon} size={20} color={statusColor} />
            </View>
            <View className='flex-1'>
              <Text className='font-semibold text-gray-900 capitalize'>{delivery.deliveryType} Delivery</Text>
              <Text className='text-sm text-gray-600 capitalize' style={{ color: statusColor }}>
                {delivery.status.replace('_', ' ')}
              </Text>
            </View>
          </View>
          {delivery.trackingNumber && (
            <Text className='text-xs text-gray-500 font-mono'>#{delivery.trackingNumber}</Text>
          )}
        </View>

        {/* Details */}
        <View className='space-y-2 mb-3'>
          <View className='flex-row'>
            <Text className='text-sm text-gray-600 w-20'>From:</Text>
            <Text className='text-sm text-gray-900 flex-1'>{delivery.senderName}</Text>
          </View>
          <View className='flex-row'>
            <Text className='text-sm text-gray-600 w-20'>To:</Text>
            <Text className='text-sm text-gray-900 flex-1'>{delivery.recipientName}</Text>
          </View>
          <View className='flex-row'>
            <Text className='text-sm text-gray-600 w-20'>Item:</Text>
            <Text className='text-sm text-gray-900 flex-1'>{delivery.description}</Text>
          </View>
          <View className='flex-row'>
            <Text className='text-sm text-gray-600 w-20'>Location:</Text>
            <Text className='text-sm text-gray-900 flex-1'>
              {delivery.property.name}
              {delivery.unit && ` - Unit ${delivery.unit.unitNumber}`}
            </Text>
          </View>
          <View className='flex-row'>
            <Text className='text-sm text-gray-600 w-20'>Expected:</Text>
            <Text className='text-sm text-gray-900 flex-1'>
              {new Date(delivery.estimatedDelivery).toLocaleDateString()} at{' '}
              {new Date(delivery.estimatedDelivery).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </View>
          {delivery.actualDelivery && (
            <View className='flex-row'>
              <Text className='text-sm text-gray-600 w-20'>Actual:</Text>
              <Text className='text-sm text-gray-900 flex-1'>
                {new Date(delivery.actualDelivery).toLocaleDateString()} at{' '}
                {new Date(delivery.actualDelivery).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {(canConfirm || canReportIssue) && (
          <View className='flex-row space-x-2 gap-2 border-t border-gray-100 pt-3'>
            {canConfirm && (
              <Button
                onPress={() => handleConfirmReceipt(delivery)}
                variant='default'
                size='sm'
                className='flex-1 bg-green-500 hover:bg-green-600'
              >
                <Ionicons name='checkmark' size={16} color='white' />
                <Text className='text-white font-medium ml-1 text-sm'>Confirm Receipt</Text>
              </Button>
            )}
            {canReportIssue && (
              <Button onPress={() => handleReportIssue(delivery)} variant='destructive' size='sm' className='flex-1'>
                <Ionicons name='warning' size={16} color='white' />
                <Text className='text-white font-medium ml-1 text-sm'>Report Issue</Text>
              </Button>
            )}
          </View>
        )}
      </View>
    );

    return (
      <TouchableOpacity key={delivery._id} onPress={() => handleViewDeliveryDetails(delivery)} activeOpacity={0.7}>
        {cardContent}
      </TouchableOpacity>
    );
  };

  const statusFilters = [
    { key: 'all' as const, label: 'All', count: deliveriesData?.deliveries?.length || 0 },
    {
      key: 'registered' as const,
      label: 'Registered',
      count: deliveriesData?.deliveries?.filter(d => d.status === 'registered').length || 0,
    },
    {
      key: 'arrived' as const,
      label: 'Arrived',
      count: deliveriesData?.deliveries?.filter(d => d.status === 'arrived').length || 0,
    },
    {
      key: 'collected' as const,
      label: 'Collected',
      count: deliveriesData?.deliveries?.filter(d => d.status === 'collected').length || 0,
    },
    {
      key: 'failed' as const,
      label: 'Failed',
      count: deliveriesData?.deliveries?.filter(d => d.status === 'failed').length || 0,
    },
    {
      key: 'returned' as const,
      label: 'Returned',
      count: deliveriesData?.deliveries?.filter(d => d.status === 'returned').length || 0,
    },
  ];

  return (
    <View className='flex-1 bg-gray-50'>
      <PageHeader
        title='My Deliveries'
        type='back'
        icon='cube'
        subtitle='Track your deliveries'
        className='mb-4'
        rightSlot={
          <TouchableOpacity
            onPress={() => router.push('/deliveries/register')}
            className='bg-white/20 border border-white/25 rounded-lg px-3 py-2'
          >
            <Text className='text-blue-800 text-sm font-medium'>Register</Text>
          </TouchableOpacity>
        }
      />

      {!isTokenRegistered && (
        <View className='bg-yellow-50 border border-yellow-200 rounded-lg p-3 mx-4 mb-4'>
          <View className='flex-row items-center'>
            <Ionicons name='warning' size={20} color='#F59E0B' />
            <Text className='text-yellow-800 ml-2 flex-1 text-sm'>
              Push notifications are not enabled. You may miss delivery updates.
            </Text>
          </View>
        </View>
      )}

      {/* Status Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className='px-4 mb-4' style={{ flexGrow: 0 }}>
        <View className='flex-row space-x-2 gap-1'>
          {statusFilters.map(filter => (
            <Button
              key={filter.key}
              onPress={() => setStatusFilter(filter.key)}
              variant={statusFilter === filter.key ? 'default' : 'outline'}
              size='sm'
              className='rounded-full'
            >
              <Text className={cn('text-sm font-medium', statusFilter === filter.key ? 'text-white' : 'text-gray-900')}>
                {filter.label} ({filter.count})
              </Text>
            </Button>
          ))}
        </View>
      </ScrollView>

      <ScrollView
        className='flex-1 px-4'
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {deliveriesData === undefined ? (
          // Loading state
          <View className='space-y-3'>
            {[1, 2, 3].map(i => (
              <View key={i} className='bg-white rounded-xl p-4 shadow-sm border border-gray-100'>
                <View className='animate-pulse'>
                  <View className='h-4 bg-gray-200 rounded w-3/4 mb-2'></View>
                  <View className='h-3 bg-gray-200 rounded w-full mb-1'></View>
                  <View className='h-3 bg-gray-200 rounded w-2/3'></View>
                </View>
              </View>
            ))}
          </View>
        ) : deliveriesData.success && deliveriesData.deliveries.length > 0 ? (
          deliveriesData.deliveries.map(renderDeliveryCard)
        ) : (
          <View className='flex-1 items-center justify-center py-20'>
            <Ionicons name='cube-outline' size={64} color='#D1D5DB' />
            <Text className='text-gray-500 text-center mt-4 text-lg font-medium'>No deliveries found</Text>
            <Text className='text-gray-400 text-center mt-1 text-sm'>
              {statusFilter === 'all'
                ? "You don't have any deliveries yet"
                : `No ${statusFilter.replace('_', ' ')} deliveries`}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Issue Report Modal */}
      <Modal visible={showIssueModal} animationType='slide' presentationStyle='pageSheet'>
        <View className='flex-1 bg-slate-50'>
          <PageHeader
            title='Report Issue'
            subtitle='Help us resolve delivery problems'
            type='back'
            icon='warning'
            rightSlot={
              <TouchableOpacity onPress={() => setShowIssueModal(false)}>
                <View className='bg-blue-800/10 border border-blue-800/20 rounded-lg px-3 py-2'>
                  <Ionicons name='close' size={16} color='#1e40af' />
                </View>
              </TouchableOpacity>
            }
            className='mb-4'
          />

          <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
            <View className='px-4 py-4'>
              {/* Issue Type Section */}
              <View className='bg-white rounded-2xl p-6 mb-6 border border-gray-100 shadow-sm'>
                <View className='flex-row items-center mb-4'>
                  <View className='w-8 h-8 rounded-lg bg-red-100 items-center justify-center mr-3'>
                    <Ionicons name='help-circle' size={16} color='#EF4444' />
                  </View>
                  <Text className='text-lg font-bold text-gray-900'>Issue Type</Text>
                </View>

                <Text className='text-gray-600 text-sm mb-4'>Select the type of issue you&apos;re experiencing</Text>

                <View className='space-y-3 gap-2'>
                  {[
                    { key: 'damaged', label: 'Package Damaged', icon: 'cube', color: '#EF4444' },
                    { key: 'missing', label: 'Package Missing', icon: 'search', color: '#F59E0B' },
                    { key: 'wrong_item', label: 'Wrong Item', icon: 'swap-horizontal', color: '#8B5CF6' },
                    { key: 'other', label: 'Other Issue', icon: 'ellipsis-horizontal', color: '#6B7280' },
                  ].map(type => (
                    <Button
                      key={type.key}
                      onPress={() => setIssueType(type.key as any)}
                      variant={issueType === type.key ? 'default' : 'outline'}
                      className={cn(
                        'w-full justify-start p-3 h-auto border',
                        issueType === type.key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                      )}
                    >
                      <View className='flex-row items-center flex-1'>
                        <View
                          className='w-10 h-10 rounded-lg items-center justify-center mr-3'
                          style={{
                            backgroundColor: issueType === type.key ? '#3B82F6' : '#F3F4F6',
                          }}
                        >
                          <Ionicons
                            name={type.icon as any}
                            size={18}
                            color={issueType === type.key ? 'white' : type.color}
                          />
                        </View>
                        <Text
                          className={cn(
                            'text-base font-medium',
                            issueType === type.key ? 'text-blue-900' : 'text-gray-700'
                          )}
                        >
                          {type.label}
                        </Text>
                        {issueType === type.key && (
                          <View className='ml-auto'>
                            <Ionicons name='checkmark-circle' size={20} color='#3B82F6' />
                          </View>
                        )}
                      </View>
                    </Button>
                  ))}
                </View>
              </View>

              {/* Description Section */}
              <View className='bg-white rounded-xl p-4 mb-4 border border-gray-100 shadow-sm'>
                <View className='flex-row items-center mb-3'>
                  <View className='w-6 h-6 rounded-md bg-blue-100 items-center justify-center mr-2'>
                    <Ionicons name='document-text' size={12} color='#3B82F6' />
                  </View>
                  <Text className='text-base font-bold text-gray-900'>Description</Text>
                </View>

                <Text className='text-gray-600 text-xs mb-3'>Please provide details about the issue</Text>

                <TextInput
                  value={issueDescription}
                  onChangeText={setIssueDescription}
                  placeholder='Describe what happened with your delivery...'
                  multiline
                  numberOfLines={3}
                  className='border border-gray-200 rounded-lg p-3 text-gray-900 text-sm leading-5'
                  style={{ textAlignVertical: 'top', minHeight: 80 }}
                />

                <View className='flex-row items-center mt-2'>
                  <Ionicons name='information-circle' size={12} color='#6B7280' />
                  <Text className='text-xs text-gray-500 ml-1'>Your report will be reviewed within 24 hours</Text>
                </View>
              </View>

              {/* Submit Button */}
              <View className='bg-white rounded-xl p-4 border border-gray-100 shadow-sm'>
                <Button
                  onPress={submitIssueReport}
                  variant='default'
                  disabled={!issueDescription.trim()}
                  className={cn('w-full rounded-lg', issueDescription.trim() ? 'bg-red-500' : 'bg-gray-600')}
                >
                  <View className='flex-row items-center justify-center'>
                    <Ionicons name='send' size={16} color='white' />
                    <Text className='text-white font-semibold text-sm ml-2'>Submit Report</Text>
                  </View>
                </Button>

                <Text className='text-center text-xs text-gray-500 mt-2'>By submitting, you agree to our terms</Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>

      {/* Delivery Details Modal */}
      <Modal visible={showDetailModal} animationType='slide' presentationStyle='pageSheet'>
        <View className='flex-1 bg-slate-50'>
          <PageHeader
            title='Delivery Details'
            subtitle='Track your package journey'
            type='back'
            icon='cube'
            rightSlot={
              <TouchableOpacity onPress={() => setShowDetailModal(false)}>
                <View className='bg-blue-800/10 border border-blue-800/20 rounded-lg px-3 py-2'>
                  <Ionicons name='close' size={18} color='#1e40af' />
                </View>
              </TouchableOpacity>
            }
            className='mb-4'
          />

          <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
            {selectedDelivery && (
              <View className='p-4'>
                {/* Status Card */}
                <View className='bg-white rounded-lg p-4 mb-4 border border-gray-200'>
                  <View className='flex-row items-center mb-3'>
                    <View
                      className='w-12 h-12 rounded-lg items-center justify-center mr-3'
                      style={{ backgroundColor: statusColors[selectedDelivery.status] }}
                    >
                      <Ionicons name={statusIcons[selectedDelivery.status]} size={20} color='white' />
                    </View>
                    <View className='flex-1'>
                      <Text className='text-lg font-bold text-gray-900 capitalize'>
                        {selectedDelivery.deliveryType} Delivery
                      </Text>
                      <Text
                        className='text-sm text-gray-600 capitalize'
                        style={{ color: statusColors[selectedDelivery.status] }}
                      >
                        {selectedDelivery.status.replace('_', ' ')}
                      </Text>
                    </View>
                  </View>

                  {/* Tracking Number */}
                  {selectedDelivery.trackingNumber && (
                    <View className='flex-row items-center pt-2 border-t border-gray-100'>
                      <Ionicons name='barcode-outline' size={16} color='#6B7280' />
                      <Text className='text-sm text-gray-600 ml-2'>Tracking: </Text>
                      <Text className='text-sm text-gray-900 font-mono'>#{selectedDelivery.trackingNumber}</Text>
                    </View>
                  )}
                </View>

                {/* Delivery Information */}
                <View className='bg-white rounded-lg p-4 mb-4 border border-gray-200'>
                  <Text className='text-lg font-bold text-gray-900 mb-3'>Delivery Information</Text>

                  <View className='space-y-2'>
                    <View className='flex-row justify-between py-2 border-b border-gray-100'>
                      <Text className='text-gray-600'>From:</Text>
                      <Text className='text-gray-900 font-medium text-right flex-1 ml-2'>
                        {selectedDelivery.senderName}
                      </Text>
                    </View>
                    <View className='flex-row justify-between py-2 border-b border-gray-100'>
                      <Text className='text-gray-600'>To:</Text>
                      <Text className='text-gray-900 font-medium text-right flex-1 ml-2'>
                        {selectedDelivery.recipientName}
                      </Text>
                    </View>
                    <View className='flex-row justify-between py-2 border-b border-gray-100'>
                      <Text className='text-gray-600'>Package:</Text>
                      <Text className='text-gray-900 font-medium text-right flex-1 ml-2'>
                        {selectedDelivery.description}
                      </Text>
                    </View>
                    <View className='flex-row justify-between py-2 border-b border-gray-100'>
                      <Text className='text-gray-600'>Location:</Text>
                      <Text className='text-gray-900 font-medium text-right flex-1 ml-2'>
                        {selectedDelivery.property.name}
                        {selectedDelivery.unit && ` • ${selectedDelivery.unit.unitNumber}`}
                      </Text>
                    </View>
                    <View className='flex-row justify-between py-2 border-b border-gray-100'>
                      <Text className='text-gray-600'>Expected:</Text>
                      <Text className='text-gray-900 font-medium text-right flex-1 ml-2'>
                        {new Date(selectedDelivery.estimatedDelivery).toLocaleDateString()}
                      </Text>
                    </View>
                    {selectedDelivery.actualDelivery && (
                      <View className='flex-row justify-between py-2 border-b border-gray-100'>
                        <Text className='text-gray-600'>Actual:</Text>
                        <Text className='text-gray-900 font-medium text-right flex-1 ml-2'>
                          {new Date(selectedDelivery.actualDelivery).toLocaleDateString()}
                        </Text>
                      </View>
                    )}
                    <View className='flex-row justify-between py-2'>
                      <Text className='text-gray-600'>Created:</Text>
                      <Text className='text-gray-900 font-medium text-right flex-1 ml-2'>
                        {new Date(selectedDelivery.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Delivery History */}
                <View className='mb-4'>
                  <Text className='text-lg font-bold text-gray-900 mb-3'>Delivery History</Text>

                  {deliveryLogsData === undefined ? (
                    <View className='space-y-2'>
                      {[1, 2, 3].map(i => (
                        <View key={i} className='bg-white rounded-lg p-3 border border-gray-200'>
                          <View className='animate-pulse'>
                            <View className='h-4 bg-gray-200 rounded w-3/4 mb-2'></View>
                            <View className='h-3 bg-gray-200 rounded w-1/2'></View>
                          </View>
                        </View>
                      ))}
                    </View>
                  ) : deliveryLogsData && deliveryLogsData.page.length > 0 ? (
                    <View className='space-y-2'>
                      {deliveryLogsData.page.map((log: any, index: number) => (
                        <View key={log._id} className='bg-white rounded-lg p-3 border border-gray-200'>
                          <View className='flex-row justify-between items-start mb-2'>
                            <Text className='text-sm font-semibold text-gray-900 capitalize flex-1'>
                              {log.action.replace(/_/g, ' ')}
                            </Text>
                            <Text className='text-xs text-gray-500'>
                              {new Date(log.timestamp).toLocaleDateString()}
                            </Text>
                          </View>

                          {log.performer && (
                            <Text className='text-xs text-gray-600 mb-1'>
                              by {log.performer.firstName} {log.performer.lastName}
                            </Text>
                          )}

                          {log.notes && <Text className='text-sm text-gray-700 mb-1'>{log.notes}</Text>}

                          {log.blockchainTxHash && (
                            <View className='flex-row items-center mt-1'>
                              <Ionicons name='shield-checkmark' size={12} color='#10B981' />
                              <Text className='text-xs text-green-600 ml-1'>Verified</Text>
                            </View>
                          )}
                        </View>
                      ))}
                    </View>
                  ) : (
                    <View className='bg-white rounded-lg p-6 border border-gray-200 items-center'>
                      <Ionicons name='time-outline' size={32} color='#9CA3AF' />
                      <Text className='text-gray-500 text-center text-sm mt-2'>No history available</Text>
                    </View>
                  )}
                </View>

                {/* Action Buttons */}
                {(() => {
                  const canConfirm = ['arrived'].includes(selectedDelivery.status);
                  const canReportIssue = !['collected', 'returned', 'failed'].includes(selectedDelivery.status);

                  return (
                    (canConfirm || canReportIssue) && (
                      <View className='bg-white rounded-lg p-4 border border-gray-200'>
                        <View className='space-y-2 gap-2'>
                          {canConfirm && (
                            <Button
                              onPress={() => {
                                setShowDetailModal(false);
                                handleConfirmReceipt(selectedDelivery);
                              }}
                              variant='default'
                              className='w-full bg-green-500'
                            >
                              <View className='flex-row items-center justify-center'>
                                <Ionicons name='checkmark' size={16} color='white' />
                                <Text className='text-white font-medium ml-2'>Confirm Receipt</Text>
                              </View>
                            </Button>
                          )}
                          {canReportIssue && (
                            <Button
                              onPress={() => {
                                setShowDetailModal(false);
                                handleReportIssue(selectedDelivery);
                              }}
                              variant='destructive'
                              className='w-full'
                            >
                              <View className='flex-row items-center justify-center'>
                                <Ionicons name='warning' size={16} color='white' />
                                <Text className='text-white font-medium ml-2'>Report Issue</Text>
                              </View>
                            </Button>
                          )}
                        </View>
                      </View>
                    )
                  );
                })()}
              </View>
            )}
          </ScrollView>

          {/* Bottom padding for safe area */}
          <View className='h-8' />
        </View>
      </Modal>
    </View>
  );
}
