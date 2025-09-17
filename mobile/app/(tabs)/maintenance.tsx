import React from 'react';
import { FlatList, RefreshControl, View, TextInput } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { Search, Plus, Wrench, AlertTriangle, Clock, CheckCircle, User } from 'lucide-react-native';

export default function MaintenanceListScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const data = useQuery(api.maintenance.getMyCurrentRequests);

  const isLoading = data === undefined;

  const filteredRequests = React.useMemo(() => {
    const requests = data && 'success' in data && data.success ? data.requests : [];
    if (!searchQuery.trim()) return requests;
    return (
      requests?.filter(
        req =>
          req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.location.toLowerCase().includes(searchQuery.toLowerCase())
      ) || []
    );
  }, [data, searchQuery]);

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  return (
    <ThemedView style={{ flex: 1 }} className='bg-background'>
      {/* Header */}
      <View className='pt-16 px-5 pb-5 bg-blue-800 rounded-b-[20px]'>
        <View className='flex-row justify-between items-center'>
          <View className='flex-row items-center gap-3'>
            <View className='w-12 h-12 rounded-xl bg-white/20 items-center justify-center'>
              <Icon as={Wrench} size={28} className='text-white' />
            </View>
            <View>
              <Text className='text-3xl font-bold text-white tracking-tight'>Maintenance</Text>
              <Text className='text-sm text-white/80 mt-0.5'>Manage your maintenance requests</Text>
            </View>
          </View>

          <Link href='/maintenance/new' asChild>
            <Button className='bg-white rounded-lg px-3 py-2' onPress={() => {}}>
              <View className='flex-row items-center gap-1.5'>
                <Icon as={Plus} size={14} className='text-blue-800' />
                <Text className='text-blue-800 text-xs font-semibold'>New</Text>
              </View>
            </Button>
          </Link>
        </View>
      </View>

      {/* Search Bar */}
      <View className='px-5 pb-3'>
        <View className='flex-row items-center bg-white rounded-lg px-3 py-2 shadow-sm'>
          <Icon as={Search} size={16} className='text-gray-400 mr-2' />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder='Search maintenance requests...'
            placeholderTextColor='rgba(156, 163, 175, 1)'
            className='flex-1 text-gray-900 text-sm'
          />
        </View>
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
                Please wait while we fetch your maintenance requests
              </Text>
            </View>
          ) : (
            <View className='py-16 items-center bg-white rounded-2xl mx-1'>
              <View className='w-20 h-20 rounded-[20px] bg-cyan-50 items-center justify-center mb-5'>
                <Icon as={Wrench} size={40} className='text-blue-400' />
              </View>
              <Text className='text-xl font-bold text-blue-800 mb-2'>
                {searchQuery ? 'No matching requests' : 'No active maintenance requests'}
              </Text>
              <Text className='text-sm text-gray-500 text-center leading-5 px-8'>
                {searchQuery ? 'Try a different search term' : 'Create your first maintenance request to get started'}
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => {
          const getStatusIcon = () => {
            switch (item.status) {
              case 'completed':
                return <CheckCircle size={16} className='text-green-600' />;
              case 'in_progress':
                return <Clock size={16} className='text-blue-600' />;
              case 'assigned':
                return <User size={16} className='text-yellow-600' />;
              default:
                return <Clock size={16} className='text-gray-400' />;
            }
          };

          const getPriorityIcon = () => {
            switch (item.priority) {
              case 'emergency':
                return <AlertTriangle size={14} className='text-red-600' />;
              case 'high':
                return <AlertTriangle size={14} className='text-orange-600' />;
              case 'medium':
                return <AlertTriangle size={14} className='text-yellow-600' />;
              default:
                return <AlertTriangle size={14} className='text-gray-400' />;
            }
          };

          const getPriorityBgColor = () => {
            switch (item.priority) {
              case 'emergency':
                return 'bg-red-50';
              case 'high':
                return 'bg-orange-50';
              case 'medium':
                return 'bg-yellow-50';
              default:
                return 'bg-gray-50';
            }
          };

          const getStatusBgColor = () => {
            switch (item.status) {
              case 'completed':
                return 'bg-green-50';
              case 'in_progress':
                return 'bg-blue-50';
              case 'assigned':
                return 'bg-yellow-50';
              default:
                return 'bg-gray-50';
            }
          };

          return (
            <Link href={`/maintenance/${item._id}`} asChild>
              <Button className='bg-white rounded-xl p-3 mb-2 border h-full border-gray-100'>
                <View className='w-full'>
                  <View className='flex-row justify-between items-start mb-2'>
                    <Text className='text-lg font-bold text-gray-900 flex-1 mr-3' numberOfLines={1}>
                      {item.title}
                    </Text>
                    <View className={`flex-row items-center gap-1 px-2 py-1 rounded-lg ${getPriorityBgColor()}`}>
                      {getPriorityIcon()}
                      <Text className='text-xs font-bold uppercase tracking-wide'>{item.priority}</Text>
                    </View>
                  </View>

                  <Text className='text-gray-600 mb-3 leading-5' numberOfLines={2}>
                    {item.description}
                  </Text>

                  <View className='flex-row justify-between items-center'>
                    <View className='flex-row items-center gap-2'>
                      <Icon as={Wrench} size={16} className='text-blue-400' />
                      <Text className='text-sm text-gray-500'>{item.location}</Text>
                    </View>
                    <View className={`flex-row items-center gap-1 px-2 py-1 rounded-lg ${getStatusBgColor()}`}>
                      {getStatusIcon()}
                      <Text className='text-xs font-bold uppercase tracking-wide'>{item.status.replace('_', ' ')}</Text>
                    </View>
                  </View>
                </View>
              </Button>
            </Link>
          );
        }}
      />
    </ThemedView>
  );
}
