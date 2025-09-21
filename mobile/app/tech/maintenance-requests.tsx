import React from 'react';
import { FlatList, RefreshControl, View, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { ThemedView } from '@/components/themed-view';
import { Link } from 'expo-router';
import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import {
  Wrench,
  Search,
  AlertTriangle,
  Clock,
  CheckCircle,
  User,
  MapPin,
  Calendar,
  ChevronRight,
} from 'lucide-react-native';
import {
  MaintenanceRequest,
  MaintenanceRequestsResponse,
  RequestStatusFilter,
  RequestPriorityFilter,
} from '@/lib/tech.types';

export default function TechMaintenanceRequestsScreen() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<RequestStatusFilter>(null);
  const [priorityFilter, setPriorityFilter] = React.useState<RequestPriorityFilter>(null);

  // Fetch assigned requests
  const requestsData: MaintenanceRequestsResponse | undefined = useQuery(api.tech.getAssignedRequests, {
    status: statusFilter || undefined,
    priority: priorityFilter || undefined,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    setRefreshing(false);
  };

  const filteredRequests = React.useMemo(() => {
    const requests: MaintenanceRequest[] = requestsData?.success ? requestsData.data || [] : [];
    if (!searchQuery.trim()) return requests;
    return requests.filter(
      req =>
        req.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.propertyName.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [requestsData, searchQuery]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'assigned':
        return <Icon as={User} size={16} className='text-blue-600' />;
      case 'in_progress':
        return <Icon as={Clock} size={16} className='text-orange-600' />;
      case 'completed':
        return <Icon as={CheckCircle} size={16} className='text-green-600' />;
      case 'cancelled':
        return <Icon as={AlertTriangle} size={16} className='text-red-600' />;
      default:
        return <Icon as={Clock} size={16} className='text-gray-600' />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
      case 'in_progress':
        return 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800';
      case 'completed':
        return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
      case 'cancelled':
        return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800';
      default:
        return 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-100 dark:bg-red-900/30 text-red-600';
      case 'high':
        return 'bg-orange-100 dark:bg-orange-900/30 text-orange-600';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600';
      case 'low':
        return 'bg-green-100 dark:bg-green-900/30 text-green-600';
      default:
        return 'bg-gray-100 dark:bg-gray-900/30 text-gray-600';
    }
  };

  const renderRequest = ({ item }: { item: MaintenanceRequest }) => (
    <Link href={`/tech/request-details?requestId=${item._id}`} asChild>
      <TouchableOpacity
        className={`mx-5 mb-4 p-4 rounded-xl border border-gray-200/50 dark:border-gray-700/50 ${getStatusColor(item.status)}`}
      >
        <View className='flex-row justify-between items-start mb-3'>
          <View className='flex-1'>
            <Text className='text-lg font-semibold mb-1'>{item.title}</Text>
            <Text className='text-sm text-muted-foreground mb-2 line-clamp-2'>{item.description}</Text>
          </View>
          <View className='flex-row items-center gap-2'>
            {getStatusIcon(item.status)}
            <Icon as={ChevronRight} size={16} className='text-muted-foreground' />
          </View>
        </View>

        <View className='flex-row items-center justify-between mb-3'>
          <View className='flex-row items-center gap-2'>
            <Icon as={MapPin} size={14} className='text-muted-foreground' />
            <Text className='text-sm text-muted-foreground'>{item.location}</Text>
          </View>
          <View
            className={`px-2 py-1 rounded-full border border-gray-200/50 dark:border-gray-700/50 ${getPriorityColor(item.priority)}`}
          >
            <Text className='text-xs font-medium capitalize'>{item.priority}</Text>
          </View>
        </View>

        <View className='flex-row items-center justify-between'>
          <View className='flex-row items-center gap-2'>
            <Icon as={Calendar} size={14} className='text-muted-foreground' />
            <Text className='text-sm text-muted-foreground'>
              {item.propertyName}
              {item.unitNumber && ` • Unit ${item.unitNumber}`}
            </Text>
          </View>
          <Text className='text-xs text-muted-foreground capitalize'>{item.requestType.replace('_', ' ')}</Text>
        </View>
      </TouchableOpacity>
    </Link>
  );

  return (
    <ThemedView style={{ flex: 1 }} className='bg-background'>
      {/* Header */}
      <View className='pt-12 px-5 pb-8 bg-blue-800 rounded-b-[20px]'>
        <View className='flex-row justify-between items-center mb-6'>
          <View className='flex-row items-center gap-3'>
            <View className='w-12 h-12 rounded-xl bg-white/20 items-center justify-center'>
              <Icon as={Wrench} size={28} className='text-white' />
            </View>
            <View>
              <Text className='text-3xl font-bold text-white tracking-tight'>My Requests</Text>
              <Text className='text-sm text-white/80 mt-0.5'>Assigned maintenance tasks</Text>
            </View>
          </View>
        </View>

        {/* Search */}
        <View className='relative'>
          <Icon as={Search} size={20} className='absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60' />
          <TextInput
            className='w-full h-12 pl-12 pr-4 bg-white/10 rounded-xl placeholder:text-white/60'
            placeholder='Search requests...'
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      {/* Filters */}
      <View className='px-5 py-4 border-b border-gray-200/50 dark:border-gray-700/50'>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className='gap-2'>
          <Button
            onPress={() => setStatusFilter(null)}
            variant={!statusFilter ? 'default' : 'outline'}
            size='sm'
            className='rounded-full'
          >
            <Text className='text-sm font-medium'>All Status</Text>
          </Button>
          {(['assigned', 'in_progress', 'completed'] as const).map(status => (
            <Button
              key={status}
              onPress={() => setStatusFilter(status)}
              variant={statusFilter === status ? 'default' : 'outline'}
              size='sm'
              className='rounded-full'
            >
              <Text className='text-sm font-medium capitalize'>{status.replace('_', ' ')}</Text>
            </Button>
          ))}
        </ScrollView>
      </View>

      {/* Priority Filters */}
      <View className='px-5 py-4 border-b border-gray-200/50 dark:border-gray-700/50'>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} className='gap-2'>
          <Button
            onPress={() => setPriorityFilter(null)}
            variant={!priorityFilter ? 'default' : 'outline'}
            size='sm'
            className='rounded-full'
          >
            <Text className='text-sm font-medium'>All Priority</Text>
          </Button>
          {(['low', 'medium', 'high', 'emergency'] as const).map(priority => (
            <Button
              key={priority}
              onPress={() => setPriorityFilter(priority)}
              variant={priorityFilter === priority ? 'default' : 'outline'}
              size='sm'
              className='rounded-full'
            >
              <Text className='text-sm font-medium capitalize'>{priority}</Text>
            </Button>
          ))}
        </ScrollView>
      </View>

      {/* Request List */}
      <FlatList
        data={filteredRequests}
        renderItem={renderRequest}
        keyExtractor={item => item._id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListEmptyComponent={
          <View className='flex-1 items-center justify-center py-12'>
            <Icon as={Wrench} size={48} className='text-muted-foreground mb-4' />
            <Text className='text-lg font-medium text-muted-foreground mb-2'>No requests found</Text>
            <Text className='text-sm text-muted-foreground text-center px-8'>
              {searchQuery ? 'Try adjusting your search or filters' : 'You have no assigned maintenance requests'}
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 32 }}
      />
    </ThemedView>
  );
}
