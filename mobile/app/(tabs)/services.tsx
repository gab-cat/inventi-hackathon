import React from 'react';
import { TouchableOpacity, ScrollView, View, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

import { ThemedView } from '@/components/themed-view';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { PageHeader } from '@/components/ui/page-header';
import { Wrench, Users, Truck, CreditCard, Cpu, MessageCircle } from 'lucide-react-native';

const { width } = Dimensions.get('window');
const cardWidth = (width - 40) / 2 - 8; // Account for padding and gap

export default function ServicesScreen() {
  const services = [
    {
      id: 'maintenance',
      title: 'Maintenance',
      description: 'Request repairs & services',
      icon: Wrench,
      gradient: ['#FEE2E2', '#FECACA', '#FCA5A5'],
      iconColor: '#DC2626',
      route: '/maintenance' as const,
    },
    {
      id: 'visitor-management',
      title: 'Visitor Access',
      description: 'Manage visitor requests',
      icon: Users,
      gradient: ['#D1FAE5', '#A7F3D0', '#6EE7B7'],
      iconColor: '#059669',
      route: '/visitor',
    },
    {
      id: 'deliveries',
      title: 'Deliveries',
      description: 'Track packages',
      icon: Truck,
      gradient: ['#FEF3C7', '#FDE68A', '#FCD34D'],
      iconColor: '#D97706',
      route: '/deliveries',
    },
    {
      id: 'payment-gateway',
      title: 'Payments',
      description: 'Bills & transactions',
      icon: CreditCard,
      gradient: ['#EDE9FE', '#DDD6FE', '#C4B5FD'],
      iconColor: '#7C3AED',
      route: '/payments',
    },
    {
      id: 'iot',
      title: 'Smart Devices',
      description: 'IoT controls',
      icon: Cpu,
      gradient: ['#DBEAFE', '#BFDBFE', '#93C5FD'],
      iconColor: '#2563EB',
      route: '/iot',
    },
    {
      id: 'chat',
      title: 'Chat Support',
      description: 'Contact managers',
      icon: MessageCircle,
      gradient: ['#FCE7F3', '#FBCFE8', '#F9A8D4'],
      iconColor: '#DB2777',
      route: '/messaging',
    },
  ];

  const renderServiceCard = (service: (typeof services)[0]) => {
    const ServiceIcon = service.icon;

    return (
      // @ts-expect-error TODO: fix this
      <Link key={service.id} href={service.route} asChild>
        <TouchableOpacity
          style={{ width: cardWidth }}
          className='bg-white rounded-2xl p-4 shadow-sm border border-gray-100/50 active:scale-95 active:shadow-sm'
          activeOpacity={0.9}
        >
          <ThemedView className='items-center'>
            {/* Gradient Icon Container */}
            <ThemedView
              className='w-16 h-16 rounded-2xl items-center justify-center mb-3 shadow-sm'
              style={{
                backgroundColor: service.gradient[0],
                shadowColor: service.iconColor,
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <Icon as={ServiceIcon} size={28} className={`text-[${service.iconColor}]`} />
            </ThemedView>

            {/* Service Info */}
            <ThemedView className='items-center'>
              <Text className='text-base font-bold text-gray-900 mb-1 text-center'>{service.title}</Text>
              <Text className='text-xs text-gray-600 text-center leading-4'>{service.description}</Text>
            </ThemedView>

            {/* Chevron */}
            <ThemedView className='mt-3'>
              <Ionicons name='chevron-forward' size={16} color='#9CA3AF' />
            </ThemedView>
          </ThemedView>
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <ThemedView style={{ flex: 1 }} className='bg-background'>
      <PageHeader title='Services' subtitle='Access all property services' type='root' icon='grid' />

      {/* Content */}
      <ScrollView className='flex-1' style={{ backgroundColor: '#F8FAFC' }}>
        <ThemedView className='px-5 pt-8 pb-6'>
          {/* Services Header */}
          <ThemedView className='mb-6'>
            <ThemedView className='flex-row items-center mb-2'>
              <View
                className='w-1 h-8 bg-gradient-to-b from-blue-600 to-blue-800 rounded-full mr-3'
                style={{ backgroundColor: '#2563EB' }}
              />
              <Text className='text-2xl font-bold text-gray-900'>Quick Access</Text>
            </ThemedView>
            <Text className='text-sm text-gray-600 ml-4'>Tap any service to get started</Text>
          </ThemedView>

          {/* Services Grid */}
          <ThemedView className='flex-row flex-wrap justify-between' style={{ gap: 16 }}>
            {services.map(renderServiceCard)}
          </ThemedView>

          {/* Help Section */}
          <ThemedView
            className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-5 mt-8 border border-blue-100'
            style={{
              shadowColor: '#3B82F6',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 6,
              elevation: 2,
            }}
          >
            <ThemedView className='flex-row items-center mb-3'>
              <View
                className='w-10 h-10 rounded-xl items-center justify-center mr-3'
                style={{ backgroundColor: '#DBEAFE' }}
              >
                <Ionicons name='help-circle' size={20} color='#2563EB' />
              </View>
              <Text className='text-lg font-bold text-blue-900'>Need Assistance?</Text>
            </ThemedView>
            <Text className='text-sm text-blue-800 leading-6 ml-13'>
              Our property management team is here to help. Contact them directly through the Chat Support service for
              immediate assistance.
            </Text>
          </ThemedView>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}
