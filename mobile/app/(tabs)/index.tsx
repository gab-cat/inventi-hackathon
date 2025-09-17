import { Image, Text, useWindowDimensions } from 'react-native';
import Carousel from 'react-native-reanimated-carousel';
import { Ionicons } from '@expo/vector-icons';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

// Carousel data
const carouselData = [
  require('@/assets/images/carousel/carousel-image-1.png'),
  require('@/assets/images/carousel/carousel-image-2.jpeg'),
  require('@/assets/images/carousel/carousel-image-3.jpeg'),
  require('@/assets/images/carousel/carousel-image-4.jpeg'),
  require('@/assets/images/carousel/carousel-image-5.jpeg'),
];

// Mock data for digital noticeboard
const mockAnnouncements = [
  {
    id: 1,
    title: 'Community Garden Maintenance',
    message:
      'The community garden will be closed for maintenance this Saturday from 9 AM to 12 PM. Please plan accordingly.',
    date: '2024-12-15',
    priority: 'normal',
  },
  {
    id: 2,
    title: 'Holiday Lighting Contest',
    message:
      'Show off your holiday spirit! Decorate your unit and enter our holiday lighting contest. Winner announced December 20th.',
    date: '2024-12-10',
    priority: 'normal',
  },
];

const mockPaymentReminders = [
  {
    id: 1,
    tenant: 'Unit 2B - Sarah Johnson',
    amount: '$1,250.00',
    dueDate: '2024-12-20',
    status: 'overdue',
    daysOverdue: 3,
  },
  {
    id: 2,
    tenant: 'Unit 3A - Michael Chen',
    amount: '$950.00',
    dueDate: '2024-12-25',
    status: 'pending',
    daysOverdue: 0,
  },
];

const mockUrgentAlerts = [
  {
    id: 1,
    title: 'Power Outage - Building A',
    message: 'Scheduled power maintenance in Building A tonight from 10 PM to 2 AM. Elevators will be out of service.',
    severity: 'warning',
    timestamp: '2024-12-15T18:30:00Z',
  },
  {
    id: 2,
    title: 'Parking Lot Closure',
    message: 'Visitor parking lot will be closed tomorrow for resurfacing. Please use alternate parking areas.',
    severity: 'info',
    timestamp: '2024-12-15T16:00:00Z',
  },
];

export default function HomeScreen() {
  const { width } = useWindowDimensions();

  const renderCarouselItem = ({ item }: { item: any }) => (
    <Image source={item} className='w-full h-60' resizeMode='cover' />
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'warning':
        return '#FF6B35';
      case 'info':
        return '#4A90E2';
      default:
        return '#666';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'overdue':
        return '#E74C3C';
      case 'pending':
        return '#F39C12';
      default:
        return '#27AE60';
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: 'transparent', dark: 'transparent' }}
      headerImage={
        <Carousel
          loop
          width={width}
          height={250}
          autoPlay={true}
          data={carouselData}
          scrollAnimationDuration={5000}
          renderItem={renderCarouselItem}
        />
      }
    >
      {/* Welcome Header */}
      <ThemedView className='py-0 items-start'>
        <Text className='text-3xl font-bold text-blue-800 text-left mb-2'>Welcome to Inventi App</Text>
        <ThemedText className='text-sm text-gray-600 text-left mb-4 leading-5'>
          Your digital noticeboard for all property updates and announcements
        </ThemedText>
      </ThemedView>

      {/* Property-wide Announcements */}
      <ThemedView className='mb-6'>
        <ThemedView className='flex-row items-center gap-3 mb-4'>
          <Ionicons name='megaphone' size={24} color='#4A90E2' />
          <ThemedText type='subtitle' className='text-lg font-semibold text-gray-800'>
            Property Announcements
          </ThemedText>
        </ThemedView>
        {mockAnnouncements.map(announcement => (
          <ThemedView key={announcement.id} className='bg-gray-50 rounded-xl p-4 mb-3 border-l-4 border-blue-800'>
            <ThemedView className='flex-row justify-between items-center mb-2'>
              <ThemedText type='defaultSemiBold' className='text-base text-gray-800 flex-1'>
                {announcement.title}
              </ThemedText>
              <ThemedText className='text-xs text-gray-600'>{formatDate(announcement.date)}</ThemedText>
            </ThemedView>
            <ThemedText className='text-sm text-gray-700 leading-5'>{announcement.message}</ThemedText>
          </ThemedView>
        ))}
      </ThemedView>

      {/* Payment Reminders */}
      <ThemedView className='mb-6'>
        <ThemedView className='flex-row items-center gap-3 mb-4'>
          <Ionicons name='card' size={24} color='#27AE60' />
          <ThemedText type='subtitle' className='text-lg font-semibold text-gray-800'>
            Payment Reminders
          </ThemedText>
        </ThemedView>
        {mockPaymentReminders.map(reminder => (
          <ThemedView
            key={reminder.id}
            className={`bg-gray-50 rounded-xl p-4 mb-3 border-l-4`}
            style={{ borderLeftColor: getStatusColor(reminder.status) }}
          >
            <ThemedView className='flex-row justify-between items-center mb-2'>
              <ThemedText type='defaultSemiBold' className='text-base text-gray-800 flex-1'>
                {reminder.tenant}
              </ThemedText>
              <ThemedText className='text-xs font-bold' style={{ color: getStatusColor(reminder.status) }}>
                {reminder.status.toUpperCase()}
              </ThemedText>
            </ThemedView>
            <ThemedView className='flex-row justify-between items-center mb-1'>
              <ThemedText className='text-lg font-bold text-green-600'>{reminder.amount}</ThemedText>
              <ThemedText className='text-sm text-gray-600'>Due: {formatDate(reminder.dueDate)}</ThemedText>
            </ThemedView>
            {reminder.daysOverdue > 0 && (
              <ThemedText className='text-xs text-red-600 font-bold'>{reminder.daysOverdue} days overdue</ThemedText>
            )}
          </ThemedView>
        ))}
      </ThemedView>

      {/* Urgent Alerts */}
      <ThemedView className='mb-6'>
        <ThemedView className='flex-row items-center gap-3 mb-4'>
          <Ionicons name='warning' size={24} color='#E74C3C' />
          <ThemedText type='subtitle' className='text-lg font-semibold text-gray-800'>
            Urgent Alerts
          </ThemedText>
        </ThemedView>
        {mockUrgentAlerts.map(alert => (
          <ThemedView
            key={alert.id}
            className='bg-gray-50 rounded-xl p-4 mb-3 border-l-4'
            style={{ borderLeftColor: getSeverityColor(alert.severity) }}
          >
            <ThemedView className='flex-row items-center gap-2 mb-2'>
              <Ionicons
                name={alert.severity === 'warning' ? 'warning' : 'information-circle'}
                size={20}
                color={getSeverityColor(alert.severity)}
              />
              <ThemedText type='defaultSemiBold' className='text-base text-gray-800 flex-1'>
                {alert.title}
              </ThemedText>
            </ThemedView>
            <ThemedText className='text-sm text-gray-700 leading-5 mb-2'>{alert.message}</ThemedText>
            <ThemedText className='text-xs text-gray-600'>{new Date(alert.timestamp).toLocaleString()}</ThemedText>
          </ThemedView>
        ))}
      </ThemedView>

      {/* Footer */}
      <ThemedView className='items-center py-6'>
        <ThemedText className='text-xs text-gray-500 mb-1'>Property Management System v1.0</ThemedText>
        <ThemedText className='text-xs text-gray-500 mb-1'>Last updated: {new Date().toLocaleDateString()}</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}
