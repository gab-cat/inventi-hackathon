import React from 'react';
import { FlatList, RefreshControl, View, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { PageHeader } from '@/components/ui/page-header';
import { Search, Plus, Users, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react-native';
import { Id } from '@convex/_generated/dataModel';

export default function VisitorManagementScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<
    'all' | 'pending' | 'approved' | 'denied' | 'cancelled' | 'expired'
  >('all');

  const data = useQuery(api.visitorRequest.getMyVisitors, {
    status: statusFilter === 'all' ? undefined : statusFilter,
    limit: 50,
  });

  const cancelVisitorRequest = useMutation(api.visitorRequest.cancelVisitorRequest);

  const isLoading = data === undefined;

  const filteredRequests = React.useMemo(() => {
    if (!data || !('success' in data) || !data.success) return [];

    let requests = data.visitors;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      requests = requests.filter(
        (request: any) =>
          request.visitorName.toLowerCase().includes(query) || request.purpose.toLowerCase().includes(query)
      );
    }

    return requests;
  }, [data, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  const handleCancelRequest = async (requestId: string, visitorName: string) => {
    Alert.alert('Cancel Visitor Request', `Are you sure you want to cancel the visitor request for ${visitorName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Yes, Cancel Request',
        style: 'destructive',
        onPress: async () => {
          try {
            const result = await cancelVisitorRequest({ requestId: requestId as Id<'visitorRequests'> });
            if (result.success) {
              Alert.alert('Success', 'Visitor request cancelled successfully');
              onRefresh();
            } else {
              Alert.alert('Error', result.message || 'Failed to cancel request');
            }
          } catch {
            Alert.alert('Error', 'Failed to cancel request. Please try again.');
          }
        },
      },
    ]);
  };

  return (
    <ThemedView style={{ flex: 1 }} className='bg-background'>
      <PageHeader
        title='Visitor Management'
        type='back'
        subtitle='Manage your visitor requests'
        icon='people'
        rightSlot={
          <Link href='/visitor/new' asChild>
            <Button className='bg-white rounded-lg px-3 py-2' onPress={() => {}}>
              <View className='flex-row items-center gap-1.5'>
                <Icon as={Plus} size={14} className='text-blue-800' />
                <Text className='text-blue-800 text-xs font-semibold'>New</Text>
              </View>
            </Button>
          </Link>
        }
      />

      {/* Search Bar */}
      <View className='px-5 pb-3 mt-4'>
        <View className='flex-row items-center bg-white rounded-lg px-3 py-2 shadow-sm'>
          <Icon as={Search} size={16} className='text-gray-400 mr-2' />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder='Search visitor requests...'
            placeholderTextColor='rgba(156, 163, 175, 1)'
            className='flex-1 text-gray-900 text-sm'
          />
        </View>
      </View>

      {/* Status Filter */}
      <View className='px-5 pb-3'>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { key: 'all', label: 'All', color: 'bg-gray-100 text-gray-700 border-gray-700' },
            { key: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-700 border-yellow-700' },
            { key: 'approved', label: 'Approved', color: 'bg-green-100 text-green-700 border-green-700' },
            { key: 'denied', label: 'Denied', color: 'bg-red-100 text-red-700 border-red-700' },
            { key: 'cancelled', label: 'Cancelled', color: 'bg-gray-100 text-gray-700 border-gray-700' },
          ]}
          keyExtractor={item => item.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setStatusFilter(item.key as typeof statusFilter)}
              className={`px-4 py-2 rounded-full mr-2 ${
                statusFilter === item.key ? `${item.color} border` : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              <Text className={`text-sm font-medium ${statusFilter === item.key ? '' : 'text-gray-600'}`}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Content */}
      <FlatList
        data={filteredRequests}
        keyExtractor={item => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ padding: 16, paddingTop: 8 }}
        className='bg-slate-50'
        ItemSeparatorComponent={() => <View className='h-2' />}
        ListEmptyComponent={() =>
          isLoading ? (
            <View className='py-16 items-center bg-white rounded-2xl mx-1'>
              <View className='w-20 h-20 rounded-[20px] bg-cyan-50 items-center justify-center mb-5'>
                <View className='w-8 h-8 border-4 border-blue-400 border-t-transparent rounded-full animate-spin' />
              </View>
              <Text className='text-xl font-bold text-blue-800 mb-2'>Loading requests...</Text>
              <Text className='text-sm text-gray-500 text-center leading-5 px-8'>
                Please wait while we fetch your visitor requests
              </Text>
            </View>
          ) : (
            <View className='py-16 items-center bg-white rounded-2xl mx-1'>
              <View className='w-20 h-20 rounded-[20px] bg-cyan-50 items-center justify-center mb-5'>
                <Icon as={Users} size={40} className='text-blue-400' />
              </View>
              <Text className='text-xl font-bold text-blue-800 mb-2'>
                {searchQuery.trim() || statusFilter !== 'all' ? 'No matching requests' : 'No visitor requests'}
              </Text>
              <Text className='text-sm text-gray-500 text-center leading-5 px-8'>
                {searchQuery.trim()
                  ? 'Try a different search term or filter'
                  : statusFilter !== 'all'
                    ? `No ${statusFilter} requests found. Try changing the filter.`
                    : 'Create your first visitor request to get started'}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const getStatusIcon = () => {
            switch (item.status) {
              case 'approved':
                return <CheckCircle size={16} className='text-green-600' />;
              case 'pending':
                return <Clock size={16} className='text-yellow-600' />;
              case 'denied':
                return <XCircle size={16} className='text-red-600' />;
              case 'cancelled':
                return <XCircle size={16} className='text-gray-600' />;
              default:
                return <Clock size={16} className='text-gray-400' />;
            }
          };

          const getStatusBgColor = () => {
            switch (item.status) {
              case 'approved':
                return 'bg-green-50';
              case 'pending':
                return 'bg-yellow-50';
              case 'denied':
                return 'bg-red-50';
              case 'cancelled':
                return 'bg-gray-50';
              default:
                return 'bg-gray-50';
            }
          };

          const canCancel = ['pending', 'approved'].includes(item.status);
          const arrivalTime = new Date(item.expectedArrival);

          return (
            <View className='mb-2'>
              <Link href={`/visitor/${item._id}`} asChild>
                <TouchableOpacity className='bg-white rounded-xl p-3 border border-gray-100'>
                  <View className='w-full'>
                    <View className='flex-row justify-between items-start mb-2'>
                      <Text className='text-lg font-bold text-gray-900 flex-1 mr-3' numberOfLines={1}>
                        {item.visitorName}
                      </Text>
                      <View className={`flex-row items-center gap-1 px-2 py-1 rounded-lg ${getStatusBgColor()}`}>
                        {getStatusIcon()}
                        <Text className='text-xs font-bold uppercase tracking-wide'>{item.status}</Text>
                      </View>
                    </View>

                    <Text className='text-gray-600 mb-2 leading-5' numberOfLines={1}>
                      {item.purpose}
                    </Text>

                    <View className='flex-row justify-between items-center mb-2'>
                      <View className='flex-row items-center gap-2'>
                        <Icon as={Users} size={14} className='text-blue-400' />
                        <Text className='text-sm text-gray-500'>
                          {item.numberOfVisitors} visitor{item.numberOfVisitors > 1 ? 's' : ''}
                        </Text>
                      </View>
                      <Text className='text-xs text-gray-400'>
                        {arrivalTime.toLocaleDateString()} at{' '}
                        {arrivalTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>

                    {item.documents && item.documents.length > 0 && (
                      <View className='flex-row items-center gap-1 mb-2'>
                        <Icon as={AlertTriangle} size={14} className='text-blue-500' />
                        <Text className='text-xs text-blue-600'>
                          {item.documents.length} document{item.documents.length > 1 ? 's' : ''} uploaded
                        </Text>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              </Link>

              {/* Cancel Button */}
              {canCancel && (
                <TouchableOpacity
                  onPress={() => handleCancelRequest(item._id, item.visitorName)}
                  className='mt-2 bg-red-600 rounded-lg py-2 px-4 flex-row items-center justify-center gap-2'
                >
                  <Icon as={XCircle} size={16} className='text-white' />
                  <Text className='text-white font-semibold text-sm'>Cancel Request</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        }}
      />
    </ThemedView>
  );
}
