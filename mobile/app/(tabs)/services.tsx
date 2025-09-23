import React from 'react';
import { TouchableOpacity, ScrollView, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { PageHeader } from '@/components/ui/page-header';
import { Wrench, Users, Truck, CreditCard, Cpu, MessageCircle } from 'lucide-react-native';

export default function ServicesScreen() {
  const services = [
    {
      id: 'maintenance',
      title: 'Maintenance',
      description: 'Request repairs and maintenance services',
      icon: Wrench,
      iconColor: '#EF4444',
      bgColor: 'bg-red-50',
      route: '/maintenance' as const,
      available: true,
    },
    {
      id: 'visitor-management',
      title: 'Visitor Management',
      description: 'Manage visitor access and requests',
      icon: Users,
      iconColor: '#10B981',
      bgColor: 'bg-green-50',
      route: '/visitor',
      available: true,
    },
    {
      id: 'deliveries',
      title: 'Deliveries',
      description: 'Track packages and deliveries',
      icon: Truck,
      iconColor: '#F59E0B',
      bgColor: 'bg-yellow-50',
      route: '/deliveries',
      available: true,
    },
    {
      id: 'payment-gateway',
      title: 'Payment Gateway',
      description: 'Make payments and view billing',
      icon: CreditCard,
      iconColor: '#8B5CF6',
      bgColor: 'bg-purple-50',
      route: '/payments',
      available: false,
    },
    {
      id: 'iot',
      title: 'IoT Devices',
      description: 'Monitor and control smart devices',
      icon: Cpu,
      iconColor: '#3B82F6',
      bgColor: 'bg-blue-50',
      route: '/iot',
      available: false,
    },
    {
      id: 'chat',
      title: 'Chat to Managers',
      description: 'Contact your property managers',
      icon: MessageCircle,
      iconColor: '#EC4899',
      bgColor: 'bg-pink-50',
      route: '/chat',
      available: false,
    },
  ];

  const renderServiceCard = (service: (typeof services)[0]) => {
    const ServiceIcon = service.icon;

    const cardContent = (
      <ThemedView className='flex-row items-center'>
        <ThemedView className={`w-12 h-12 rounded-xl ${service.bgColor} items-center justify-center mr-4`}>
          <Icon as={ServiceIcon} size={24} className={`text-[${service.iconColor}]`} />
        </ThemedView>
        <ThemedView className='flex-1'>
          <Text className='text-lg font-semibold text-gray-900 mb-1'>{service.title}</Text>
          <Text className='text-sm text-gray-600 leading-5'>{service.description}</Text>
          {!service.available && <Text className='text-xs text-gray-400 mt-1'>Coming soon</Text>}
        </ThemedView>
        {service.available ? (
          <Ionicons name='chevron-forward' size={20} color='#D1D5DB' />
        ) : (
          <Ionicons name='lock-closed' size={16} color='#D1D5DB' />
        )}
      </ThemedView>
    );

    if (
      service.available &&
      (service.id === 'maintenance' || service.id === 'visitor-management' || service.id === 'deliveries')
    ) {
      return (
        // @ts-expect-error TODO: fix this
        <Link key={service.id} href={service.route} asChild>
          <TouchableOpacity className='bg-white rounded-xl p-4 shadow-sm border border-gray-100'>
            {cardContent}
          </TouchableOpacity>
        </Link>
      );
    }

    return (
      <TouchableOpacity
        key={service.id}
        className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 ${!service.available ? 'opacity-60' : ''}`}
        disabled={!service.available}
      >
        {cardContent}
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={{ flex: 1 }} className='bg-background'>
      <PageHeader title='Services' subtitle='Access all property services' type='root' icon='grid' />

      {/* Content */}
      <ScrollView className='flex-1 bg-slate-50'>
        <ThemedView className='px-5 pt-6 pb-6'>
          {/* Available Services */}
          <ThemedView className='mb-8'>
            <ThemedView className='flex-row items-center mb-4'>
              <View className='w-1 h-6 bg-blue-800 rounded-sm mr-3' />
              <Text className='text-xl font-bold text-blue-800'>Available Services</Text>
            </ThemedView>
            <ThemedView className='gap-3'>
              {services.filter(service => service.available).map(renderServiceCard)}
            </ThemedView>
          </ThemedView>

          {/* Coming Soon Services */}
          <ThemedView className='mb-8'>
            <ThemedView className='flex-row items-center mb-4'>
              <View className='w-1 h-6 bg-blue-800 rounded-sm mr-3' />
              <Text className='text-xl font-bold text-blue-800'>Coming Soon</Text>
            </ThemedView>
            <ThemedView className='gap-3'>
              {services.filter(service => !service.available).map(renderServiceCard)}
            </ThemedView>
          </ThemedView>

          {/* Help Section */}
          <ThemedView className='bg-white rounded-xl p-4 border border-gray-100 shadow-sm'>
            <ThemedView className='flex-row items-center mb-3'>
              <Ionicons name='help-circle' size={20} color='#3B82F6' />
              <Text className='text-base font-semibold text-blue-800 ml-2'>Need Help?</Text>
            </ThemedView>
            <Text className='text-sm text-gray-600 leading-5'>
              Contact your property manager for assistance with any service or to report an issue.
            </Text>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}
