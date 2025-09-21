import React from 'react';
import { View, ScrollView, Alert, Image } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import {
  MapPin,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Calendar,
  Settings,
  MessageCircle,
  Camera,
  ArrowLeft,
  X,
} from 'lucide-react-native';
import { Id } from '@convex/_generated/dataModel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { cn, formatDate } from '@/lib/utils';

export default function MaintenanceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const data = useQuery(api.maintenance.getRequestsById, id ? { requestId: id as Id<'maintenanceRequests'> } : 'skip');
  const req = data && 'success' in data && data.success ? data.request : null;
  const updates = data && 'success' in data && data.success ? data.updates : [];
  const cancel = useMutation(api.maintenance.cancelRequest);
  const tenantConfirm = useMutation(api.maintenance.tenantConfirmCompletion);

  if (!id) return null;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return CheckCircle;
      case 'cancelled':
        return XCircle;
      case 'in_progress':
        return Clock;
      default:
        return AlertTriangle;
    }
  };

  const handleTenantConfirmation = async () => {
    if (!req) return;

    Alert.alert('Confirm Completion', `Are you satisfied with the work completed for "${req.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Mark as Completed',
        style: 'default',
        onPress: async () => {
          try {
            const result = await tenantConfirm({ requestId: req._id });
            if (result.success) {
              Alert.alert('Success', 'Thank you for confirming the completion!');
              router.back();
            } else {
              Alert.alert('Error', result.message || 'Failed to confirm completion');
            }
          } catch {
            Alert.alert('Error', 'Failed to confirm completion. Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <ThemedView style={{ flex: 1 }} className='bg-slate-50'>
      {/* Header */}
      <View className='pt-12 px-5 pb-4 bg-blue-800 rounded-b-[20px]'>
        <View className='flex-row justify-between items-center'>
          <Button className='bg-white/15 border border-white/25 rounded-lg px-3 py-2' onPress={() => router.back()}>
            <View className='flex-row items-center gap-2'>
              <Icon as={ArrowLeft} size={16} className='text-white' />
              <Text className='text-white text-sm font-medium'>Back</Text>
            </View>
          </Button>

          <View className='flex-1 ml-4'>
            <Text className='text-3xl font-bold text-white tracking-tight'>Progress</Text>
            <Text className='text-sm text-white/80 mt-0.5'>Track your maintenance request</Text>
          </View>

          {req && req.status !== 'completed' && req.status !== 'cancelled' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button className='bg-red-500/20 border border-red-400/30 rounded-lg px-3 py-2'>
                  <View className='flex-row items-center gap-2'>
                    <Icon as={X} size={16} className='text-red-400' />
                    <Text className='text-red-400 text-sm font-medium'>Cancel</Text>
                  </View>
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Cancel request?</DialogTitle>
                  <DialogDescription>This action cannot be undone.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant='outline'>
                      <View className='flex-row items-center gap-2'>
                        <Icon as={X} size={16} className='text-gray-600' />
                        <Text>No</Text>
                      </View>
                    </Button>
                  </DialogClose>
                  <DialogClose asChild>
                    <Button
                      variant='destructive'
                      onPress={async () => {
                        try {
                          await cancel({ requestId: req._id });
                          router.back();
                        } catch {}
                      }}
                    >
                      <View className='flex-row items-center gap-2'>
                        <Icon as={CheckCircle} size={16} className='text-white' />
                        <Text>Yes, cancel</Text>
                      </View>
                    </Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </View>
      </View>

      {req ? (
        <ScrollView contentContainerStyle={{ padding: 12, paddingTop: 6 }} showsVerticalScrollIndicator={false}>
          {/* Hero Section with Status */}
          <View className='rounded-xl p-4 mb-3'>
            <View className='flex-row justify-between items-start mb-3'>
              <View className='flex-1'>
                <Text className='text-blue-800 text-2xl font-bold leading-tight mb-2'>{req.title}</Text>
                <Text className='text-black text-sm leading-relaxed'>{req.description}</Text>
              </View>
              <View className='ml-3'>
                <View
                  className={`
                  w-14 h-14 rounded-lg items-center justify-center
                  ${
                    req.status === 'completed'
                      ? 'bg-green-500 !text-white'
                      : req.status === 'in_progress'
                        ? 'bg-blue-800 text-white'
                        : req.status === 'assigned'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-500/30 text-black'
                  }
                `}
                >
                  <Icon
                    as={getStatusIcon(req.status)}
                    size={24}
                    className={
                      req.status === 'completed' || req.status === 'in_progress' || req.status === 'assigned'
                        ? 'text-white'
                        : 'text-black'
                    }
                  />
                </View>
              </View>
            </View>

            {/* Status and Priority Badges */}
            <View className='flex-row justify-between items-center'>
              <View
                className={`
                px-3 py-1 rounded-lg
                ${
                  req.status === 'completed'
                    ? 'bg-green-500 !text-white'
                    : req.status === 'in_progress'
                      ? 'bg-blue-800 text-white'
                      : req.status === 'assigned'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-500/30 text-black'
                }
              `}
              >
                <Text
                  className={cn(
                    'text-xs font-bold uppercase tracking-wide',
                    req.status === 'pending' ? 'text-black' : 'text-white'
                  )}
                >
                  {req.status.replace('_', ' ')}
                </Text>
              </View>

              <View
                className={`
                px-3 py-1 rounded-lg
                ${
                  req.priority === 'emergency'
                    ? 'bg-red-500 text-white'
                    : req.priority === 'high'
                      ? 'bg-orange-500 text-white'
                      : req.priority === 'medium'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-500/30'
                }
              `}
              >
                <Text className={`text-xs font-bold uppercase tracking-wide`}>{req.priority}</Text>
              </View>
            </View>
          </View>

          {/* Quick Info Cards */}
          <View className='flex-row gap-2 mb-3'>
            <View className='flex-1 bg-white rounded-lg p-3 border border-gray-100'>
              <View className='flex-row items-center gap-2 mb-1'>
                <Icon as={MapPin} size={14} className='text-blue-800' />
                <Text className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>Location</Text>
              </View>
              <Text className='text-gray-900 font-medium text-sm'>{req.location}</Text>
            </View>

            <View className='flex-1 bg-white rounded-lg p-3 border border-gray-100'>
              <View className='flex-row items-center gap-2 mb-1'>
                <Icon as={Settings} size={14} className='text-blue-800' />
                <Text className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>Type</Text>
              </View>
              <Text className='text-gray-900 font-medium text-sm capitalize'>{req.requestType}</Text>
            </View>
          </View>

          {/* Timeline Section */}
          <View className='bg-white rounded-lg p-3 border border-gray-100 mb-3'>
            <View className='flex-row items-center gap-2 mb-3'>
              <Icon as={Calendar} size={16} className='text-blue-800' />
              <Text className='text-lg font-bold text-blue-800'>Timeline</Text>
            </View>

            <View className='space-y-2'>
              <View className='flex-row items-center gap-3 mb-4'>
                <View className='w-7 h-7 rounded-full bg-blue-100 items-center justify-center'>
                  <Icon as={Clock} size={12} className='text-blue-600' />
                </View>
                <View className='flex-1'>
                  <Text className='text-sm font-semibold text-gray-900'>Request Created</Text>
                  <Text className='text-xs text-gray-500'>
                    {new Date(req.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Text>
                </View>
              </View>

              {req.assignedAt && (
                <View className='flex-row items-center gap-3'>
                  <View className='w-7 h-7 rounded-full bg-yellow-100 items-center justify-center'>
                    <Icon as={User} size={12} className='text-yellow-600' />
                  </View>
                  <View className='flex-1'>
                    <Text className='text-sm font-semibold text-gray-900'>Assigned to Technician</Text>
                    <Text className='text-xs text-gray-500'>{formatDate(new Date(req.assignedAt))}</Text>
                  </View>
                </View>
              )}

              <View className='flex-row items-center gap-3'>
                <View className='w-7 h-7 rounded-full bg-gray-100 items-center justify-center'>
                  <Icon as={Clock} size={12} className='text-gray-600' />
                </View>
                <View className='flex-1'>
                  <Text className='text-sm font-semibold text-gray-900'>Last Updated</Text>
                  <Text className='text-xs text-gray-500'>{formatDate(new Date(req.updatedAt))}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Photos Section */}
          {req.photos && req.photos.length > 0 && (
            <View className='bg-white rounded-lg p-3 border border-gray-100 mb-3'>
              <View className='flex-row items-center gap-2 mb-3'>
                <Icon as={Camera} size={16} className='text-blue-800' />
                <Text className='text-lg font-bold text-blue-800'>Photos</Text>
                <View className='bg-blue-100 rounded-full px-2 py-0.5'>
                  <Text className='text-xs font-semibold text-blue-600'>{req.photos.length}</Text>
                </View>
              </View>

              <View className='flex-row flex-wrap gap-2'>
                {req.photos.map((photoUrl, index) => (
                  <View key={index} className='relative'>
                    <Image source={{ uri: photoUrl }} className='w-20 h-20 rounded-lg bg-gray-200' resizeMode='cover' />
                    <View className='absolute top-1 right-1 w-5 h-5 rounded-full bg-black/50 items-center justify-center'>
                      <Text className='text-xs text-white font-semibold'>{index + 1}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Tenant Confirmation Section */}
          {req && ['in_progress', 'completed'].includes(req.status) && !req.tenantApproval && (
            <View className='bg-green-50 rounded-lg p-4 border border-green-200 mb-3'>
              <View className='flex-row items-center gap-3 mb-3'>
                <View className='w-10 h-10 rounded-full bg-green-100 items-center justify-center'>
                  <Icon as={CheckCircle} size={20} className='text-green-600' />
                </View>
                <View className='flex-1'>
                  <Text className='text-base font-bold text-green-800'>Confirm Completion</Text>
                  <Text className='text-sm text-green-600'>Mark this request as completed and satisfied</Text>
                </View>
              </View>

              <Button onPress={handleTenantConfirmation} className='bg-green-600 hover:bg-green-700'>
                <View className='flex-row items-center gap-2'>
                  <Icon as={CheckCircle} size={16} className='text-white' />
                  <Text className='text-white font-semibold'>Mark as Completed</Text>
                </View>
              </Button>
            </View>
          )}

          {/* Maintenance Updates */}
          <View className='bg-white rounded-lg p-3 border border-gray-100'>
            <View className='flex-row items-center gap-2 mb-4'>
              <Icon as={MessageCircle} size={16} className='text-blue-800' />
              <Text className='text-lg font-bold text-blue-800'>Updates</Text>
              {updates && updates.length > 0 && (
                <View className='bg-blue-100 rounded-full px-2 py-0.5'>
                  <Text className='text-xs font-semibold text-blue-600'>{updates.length}</Text>
                </View>
              )}
            </View>

            {updates && updates.length > 0 ? (
              <View className='space-y-2'>
                {updates.map((update, index) => (
                  <View key={update._id} className='flex-row gap-3 mb-4'>
                    <View className='flex-shrink-0'>
                      <View className='w-7 h-7 rounded-full bg-blue-100 items-center justify-center'>
                        <Icon as={MessageCircle} size={12} className='text-blue-600' />
                      </View>
                    </View>
                    <View className='flex-1'>
                      <View className='flex-row items-center justify-between mb-0'>
                        <View className='flex-row items-center gap-2'>
                          <Text className='text-sm font-semibold text-gray-900 capitalize'>
                            {update.status.replace('_', ' ')}
                          </Text>
                          {update.photos && update.photos.length > 0 && (
                            <View className='flex-row items-center gap-1'>
                              <Icon as={Camera} size={12} className='text-gray-400' />
                              <Text className='text-xs text-gray-400'>{update.photos.length}</Text>
                            </View>
                          )}
                        </View>
                        <Text className='text-xs text-gray-500'>{formatDate(new Date(update.timestamp))}</Text>
                      </View>
                      {update.description && (
                        <Text className='text-xs text-gray-600 leading-relaxed'>{update.description}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className='py-6 items-center'>
                <View className='w-12 h-12 rounded-full bg-blue-50 items-center justify-center mb-2'>
                  <Icon as={MessageCircle} size={20} className='text-blue-400' />
                </View>
                <Text className='text-gray-900 font-semibold text-center mb-1'>No Updates Yet</Text>
                <Text className='text-gray-500 text-center text-sm leading-5'>
                  Maintenance updates will appear here once work begins on your request
                </Text>
              </View>
            )}
          </View>

          {/* Assignment Status */}
          {req.assignedTo && (
            <View className='bg-white rounded-lg p-3 border border-gray-100 mt-2'>
              <View className='flex-row items-center gap-3'>
                <View className='w-8 h-8 rounded-full bg-green-100 items-center justify-center'>
                  <Icon as={User} size={14} className='text-green-600' />
                </View>
                <View className='flex-1'>
                  <Text className='text-sm font-semibold text-gray-900'>Assigned Technician</Text>
                  <Text className='text-xs text-gray-500'>Request is being handled by our team</Text>
                </View>
                <View className='w-2 h-2 rounded-full bg-green-500'></View>
              </View>
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading...</Text>
        </View>
      )}
    </ThemedView>
  );
}
