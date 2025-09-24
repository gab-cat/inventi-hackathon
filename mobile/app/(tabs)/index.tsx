import { TouchableOpacity, ScrollView, RefreshControl, Alert, Animated } from 'react-native';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { useState, useCallback } from 'react';

import { ThemedView } from '@/components/themed-view';
import { Text } from '@/components/ui/text';
import { PageHeader } from '@/components/ui/page-header';
import { Id } from '@convex/_generated/dataModel';

export default function HomeScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedPollOptions, setSelectedPollOptions] = useState<{ [pollId: string]: number[] }>({});
  const [readAnimations, setReadAnimations] = useState<{ [noticeId: string]: Animated.Value }>({});
  const [animatingNotices, setAnimatingNotices] = useState<Set<string>>(new Set());
  const [acknowledgedNotices, setAcknowledgedNotices] = useState<Set<string>>(new Set());
  const [eventRSVPStatus, setEventRSVPStatus] = useState<{ [eventId: string]: 'attending' | 'maybe' | 'declined' }>({});

  const communityNews = useQuery(api.noticeboard.mobileGetCommunityNews, {
    paginationOpts: { numItems: 8, cursor: null },
  });

  const events = useQuery(api.noticeboard.mobileGetEvents, {
    paginationOpts: { numItems: 5, cursor: null },
  });

  // Use a stable key to ensure consistent query identity
  const activePolls = useQuery(api.noticeboard.mobileGetActivePolls, {
    paginationOpts: { numItems: 5, cursor: null },
  });

  // Noticeboard data queries
  const notices = useQuery(api.noticeboard.mobileGetNotices, {
    paginationOpts: { numItems: 10, cursor: null },
  });

  // Mutations
  const acknowledgeNotice = useMutation(api.noticeboard.mobileAcknowledgeNotice);
  const addEventToCalendar = useMutation(api.noticeboard.mobileAddEventToCalendar);
  const submitPollResponse = useMutation(api.noticeboard.mobileSubmitPollResponse);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Clear local state to sync with fresh data
    setAcknowledgedNotices(new Set());
    setEventRSVPStatus({});
    // Invalidate queries and refetch
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#EF4444';
      case 'high':
        return '#F97316';
      case 'medium':
        return '#F59E0B';
      case 'low':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'community':
        return 'users';
      case 'maintenance':
        return 'tools';
      case 'meeting':
        return 'user-friends';
      case 'social':
        return 'glass-cheers';
      case 'emergency':
        return 'exclamation-triangle';
      default:
        return 'calendar';
    }
  };

  const handleAcknowledgeNotice = async (noticeId: string) => {
    console.log('Attempting to acknowledge notice:', noticeId);
    try {
      const result = await acknowledgeNotice({ noticeId: noticeId as Id<'notices'> });
      console.log('Acknowledgment result:', result);

      // Immediately update local state to show checkmark
      setAcknowledgedNotices(prev => new Set(prev).add(noticeId));

      // Start read animation
      setAnimatingNotices(prev => new Set(prev).add(noticeId));
      const animation = new Animated.Value(0);
      setReadAnimations(prev => ({ ...prev, [noticeId]: animation }));

      Animated.sequence([
        Animated.timing(animation, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(500),
        Animated.timing(animation, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => {
        setAnimatingNotices(prev => {
          const newSet = new Set(prev);
          newSet.delete(noticeId);
          return newSet;
        });
      });
    } catch (error) {
      console.error('Error acknowledging notice:', error);
      Alert.alert('Error', 'Failed to acknowledge notice');
    }
  };

  const handleRSVP = async (eventId: string, status: 'attending' | 'maybe' | 'declined') => {
    try {
      const result = await addEventToCalendar({ eventId: eventId as Id<'events'>, status });
      console.log('RSVP result:', result);

      // Immediately update local state to show new RSVP status
      setEventRSVPStatus(prev => ({ ...prev, [eventId]: status }));

      const statusText = status === 'attending' ? 'attending' : status === 'maybe' ? 'maybe attending' : 'declining';
      Alert.alert('Success', `You've marked yourself as ${statusText}`);
    } catch (error) {
      console.error('Error updating RSVP:', error);
      Alert.alert('Error', 'Failed to update RSVP status');
    }
  };

  const handlePollOptionSelect = (pollId: string, optionIndex: number, pollType: string) => {
    setSelectedPollOptions(prev => {
      const current = prev[pollId] || [];
      if (pollType === 'single_choice') {
        return { ...prev, [pollId]: [optionIndex] };
      } else if (pollType === 'multiple_choice') {
        const newSelection = current.includes(optionIndex)
          ? current.filter(idx => idx !== optionIndex)
          : [...current, optionIndex];
        return { ...prev, [pollId]: newSelection };
      } else if (pollType === 'rating') {
        return { ...prev, [pollId]: [optionIndex] };
      }
      return prev;
    });
  };

  const handlePollSubmit = async (pollId: string) => {
    const selectedOptions = selectedPollOptions[pollId] || [];
    if (selectedOptions.length === 0) {
      Alert.alert('Error', 'Please select an option');
      return;
    }

    try {
      await submitPollResponse({ pollId: pollId as Id<'polls'>, selectedOptions });
      Alert.alert('Success', 'Poll response submitted');
      // Clear selection after successful submission
      setSelectedPollOptions(prev => ({ ...prev, [pollId]: [] }));
    } catch {
      Alert.alert('Error', 'Failed to submit poll response');
    }
  };

  const renderHeroSection = () => (
    <PageHeader title='Welcome to Inventi' subtitle='Your digital property noticeboard' type='root' icon='home' />
  );

  const renderNoticeCard = (notice: any) => {
    const isAnimating = animatingNotices.has(notice._id);
    const animation = readAnimations[notice._id];
    const isAcknowledged = notice.isRead || acknowledgedNotices.has(notice._id);

    return (
      <TouchableOpacity
        key={notice._id}
        className='bg-white rounded-xl p-3 mb-3 shadow-sm border border-gray-100'
        onPress={() => {
          console.log('Notice card clicked:', notice._id, 'isRead:', notice.isRead);
          if (!isAcknowledged) {
            handleAcknowledgeNotice(notice._id);
          } else {
            console.log('Notice already read, no action taken');
          }
        }}
      >
        <ThemedView className='flex-row items-start justify-between mb-2'>
          <ThemedView className='flex-row items-center flex-1'>
            <ThemedView
              className='w-1.5 h-1.5 rounded-full mr-2'
              style={{ backgroundColor: getPriorityColor(notice.priority) }}
            />
            <Text className='text-sm font-semibold text-gray-900 flex-1' numberOfLines={2}>
              {notice.title}
            </Text>
          </ThemedView>
          {(isAcknowledged || isAnimating) && (
            <Animated.View
              style={{
                transform: [
                  {
                    scale: animation
                      ? animation.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0, 1.2, 1],
                        })
                      : 1,
                  },
                ],
                opacity: animation || 1,
              }}
            >
              <MaterialIcons name='check-circle' size={14} color='#10B981' />
            </Animated.View>
          )}
        </ThemedView>

        <Text className='text-xs text-gray-600 mb-2 leading-4' numberOfLines={2}>
          {notice.content}
        </Text>

        <ThemedView className='flex-row items-center justify-between'>
          <ThemedView className='flex-row items-center'>
            <Ionicons name='location' size={10} color='#6B7280' />
            <Text className='text-xs text-gray-500 ml-1'>{notice.property.name}</Text>
          </ThemedView>
          <Text className='text-xs text-gray-500'>{formatDate(notice.createdAt)}</Text>
        </ThemedView>
      </TouchableOpacity>
    );
  };

  const renderEventCard = (event: any) => {
    // Use local state if available, otherwise fall back to server data
    const currentRSVPStatus = eventRSVPStatus[event._id] || event.isAttending;

    return (
      <ThemedView key={event._id} className='bg-white rounded-xl p-3 mb-3 shadow-sm border border-gray-100'>
        <ThemedView className='flex-row items-start justify-between mb-2'>
          <ThemedView className='flex-row items-center flex-1'>
            <ThemedView className='w-6 h-6 rounded-full bg-blue-100 items-center justify-center mr-2'>
              <FontAwesome5 name={getEventTypeIcon(event.eventType)} size={12} color='#3B82F6' />
            </ThemedView>
            <ThemedView className='flex-1'>
              <Text className='text-sm font-semibold text-gray-900' numberOfLines={2}>
                {event.title}
              </Text>
              <Text className='text-xs text-gray-600 mt-0.5' numberOfLines={1}>
                {event.description}
              </Text>
            </ThemedView>
          </ThemedView>
        </ThemedView>

        <ThemedView className='flex-row items-center justify-between mb-2'>
          <ThemedView className='flex-row items-center'>
            <Ionicons name='calendar' size={12} color='#6B7280' />
            <Text className='text-xs text-gray-500 ml-1'>
              {formatDate(event.startDate)} • {formatTime(event.startDate)}
            </Text>
          </ThemedView>
          <ThemedView className='flex-row items-center'>
            <Ionicons name='people' size={12} color='#6B7280' />
            <Text className='text-xs text-gray-500 ml-1'>
              {event.attendeeCount}/{event.maxAttendees || '∞'}
            </Text>
          </ThemedView>
        </ThemedView>

        {event.location && (
          <ThemedView className='flex-row items-center mb-2'>
            <Ionicons name='location' size={12} color='#6B7280' />
            <Text className='text-xs text-gray-500 ml-1'>{event.location}</Text>
          </ThemedView>
        )}

        <ThemedView className='flex-row gap-1'>
          <TouchableOpacity
            className={`flex-1 py-1.5 px-2 rounded-md ${currentRSVPStatus === 'attending' ? 'bg-green-100' : 'bg-gray-100'}`}
            onPress={() => handleRSVP(event._id, 'attending')}
            disabled={event.isFull}
          >
            <Text
              className={`text-xs font-medium text-center ${currentRSVPStatus === 'attending' ? 'text-green-700' : 'text-gray-700'}`}
            >
              {event.isFull ? 'Full' : 'Going'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-1.5 px-2 rounded-md ${currentRSVPStatus === 'maybe' ? 'bg-yellow-100' : 'bg-gray-100'}`}
            onPress={() => handleRSVP(event._id, 'maybe')}
          >
            <Text
              className={`text-xs font-medium text-center ${currentRSVPStatus === 'maybe' ? 'text-yellow-700' : 'text-gray-700'}`}
            >
              Maybe
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`flex-1 py-1.5 px-2 rounded-md ${currentRSVPStatus === 'declined' ? 'bg-red-100' : 'bg-gray-100'}`}
            onPress={() => handleRSVP(event._id, 'declined')}
          >
            <Text
              className={`text-xs font-medium text-center ${currentRSVPStatus === 'declined' ? 'text-red-700' : 'text-gray-700'}`}
            >
              Decline
            </Text>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    );
  };

  const renderPollCard = (poll: any) => (
    <ThemedView key={poll._id} className='bg-white rounded-xl p-3 mb-3 shadow-sm border border-gray-100'>
      <ThemedView className='flex-row items-start justify-between mb-2'>
        <ThemedView className='flex-row items-center flex-1'>
          <ThemedView className='w-6 h-6 rounded-full bg-purple-100 items-center justify-center mr-2'>
            <Ionicons name='help-circle' size={14} color='#8B5CF6' />
          </ThemedView>
          <ThemedView className='flex-1'>
            <Text className='text-sm font-semibold text-gray-900' numberOfLines={2}>
              {poll.title}
            </Text>
            <Text className='text-xs text-gray-600 mt-0.5' numberOfLines={1}>
              {poll.question}
            </Text>
          </ThemedView>
        </ThemedView>
        {poll.hasResponded && <MaterialIcons name='check-circle' size={14} color='#10B981' />}
      </ThemedView>

      {!poll.hasResponded && (
        <ThemedView className='mb-2'>
          {poll.pollType === 'single_choice' && (
            <ThemedView className='space-y-1'>
              {poll.options.map((option: string, index: number) => {
                const isSelected = selectedPollOptions[poll._id]?.includes(index);
                return (
                  <TouchableOpacity
                    key={index}
                    className={`flex-row items-center p-2 border rounded-md ${
                      isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                    onPress={() => handlePollOptionSelect(poll._id, index, poll.pollType)}
                  >
                    <ThemedView
                      className={`w-3 h-3 rounded-full border-2 mr-2 ${
                        isSelected ? 'border-blue-500 bg-blue-500' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <ThemedView className='w-1.5 h-1.5 bg-white rounded-full m-0.25' />}
                    </ThemedView>
                    <Text className={`text-xs ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-700'}`}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ThemedView>
          )}

          {poll.pollType === 'multiple_choice' && (
            <ThemedView className='space-y-1'>
              {poll.options.map((option: string, index: number) => {
                const isSelected = selectedPollOptions[poll._id]?.includes(index);
                return (
                  <TouchableOpacity
                    key={index}
                    className={`flex-row items-center p-2 border rounded-md ${
                      isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                    }`}
                    onPress={() => handlePollOptionSelect(poll._id, index, poll.pollType)}
                  >
                    <ThemedView
                      className={`w-3 h-3 border-2 mr-2 ${
                        isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                      }`}
                    >
                      {isSelected && <Ionicons name='checkmark' size={8} color='white' />}
                    </ThemedView>
                    <Text className={`text-xs ${isSelected ? 'text-purple-700 font-medium' : 'text-gray-700'}`}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ThemedView>
          )}

          {poll.pollType === 'rating' && (
            <ThemedView className='flex-row justify-center space-x-1'>
              {poll.options.map((option: string, index: number) => {
                const isSelected = selectedPollOptions[poll._id]?.includes(index);
                return (
                  <TouchableOpacity
                    key={index}
                    className={`w-8 h-8 rounded-full border-2 items-center justify-center ${
                      isSelected ? 'border-yellow-500 bg-yellow-100' : 'border-gray-300'
                    }`}
                    onPress={() => handlePollOptionSelect(poll._id, index, poll.pollType)}
                  >
                    <Text className={`text-xs font-medium ${isSelected ? 'text-yellow-700' : 'text-gray-500'}`}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ThemedView>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            className='bg-blue-500 rounded-md py-1.5 px-3 mt-2 items-center'
            onPress={() => handlePollSubmit(poll._id)}
            disabled={!selectedPollOptions[poll._id]?.length}
          >
            <Text
              className={`text-xs font-medium ${
                selectedPollOptions[poll._id]?.length ? 'text-white' : 'text-gray-300'
              }`}
            >
              Submit
            </Text>
          </TouchableOpacity>
        </ThemedView>
      )}

      <ThemedView className='flex-row items-center justify-between'>
        <Text className='text-xs text-gray-500'>{poll.responseCount} responses</Text>
        {poll.expiresAt && (
          <Text className='text-xs text-gray-500'>
            {poll.isExpired
              ? 'Expired'
              : `${Math.ceil((poll.expiresAt - Date.now()) / (1000 * 60 * 60 * 24))} days left`}
          </Text>
        )}
      </ThemedView>
    </ThemedView>
  );

  return (
    <ScrollView
      className='flex-1 bg-white'
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Hero Section */}
      {renderHeroSection()}

      <ThemedView className='px-3 pb-6'>
        {/* Community News Section */}
        <ThemedView className='mb-4 mt-4'>
          <ThemedView className='flex-row items-center mb-3'>
            <Ionicons name='newspaper' size={18} color='#3B82F6' />
            <Text className='text-base font-semibold text-gray-900 ml-2'>Community News</Text>
          </ThemedView>
          {communityNews === undefined ? (
            // Loading state
            <ThemedView className='bg-white rounded-xl p-3 shadow-sm border border-gray-100 mb-3'>
              <ThemedView className='animate-pulse'>
                <ThemedView className='h-3 bg-gray-200 rounded w-3/4 mb-2'></ThemedView>
                <ThemedView className='h-2 bg-gray-200 rounded w-full mb-1'></ThemedView>
                <ThemedView className='h-2 bg-gray-200 rounded w-2/3'></ThemedView>
              </ThemedView>
            </ThemedView>
          ) : communityNews?.page && communityNews.page.length > 0 ? (
            communityNews.page.slice(0, 3).map(renderNoticeCard)
          ) : (
            <ThemedView className='bg-white rounded-xl p-4 shadow-sm border border-gray-100 items-center'>
              <Ionicons name='newspaper-outline' size={24} color='#D1D5DB' />
              <Text className='text-gray-500 text-center mt-1 text-sm'>No community news</Text>
            </ThemedView>
          )}
        </ThemedView>

        {/* Upcoming Events Section */}
        <ThemedView className='mb-4'>
          <ThemedView className='flex-row items-center mb-3'>
            <Ionicons name='calendar' size={18} color='#10B981' />
            <Text className='text-base font-semibold text-gray-900 ml-2'>Upcoming Events</Text>
          </ThemedView>
          {events === undefined ? (
            // Loading state
            <ThemedView className='bg-white rounded-xl p-3 shadow-sm border border-gray-100 mb-3'>
              <ThemedView className='animate-pulse'>
                <ThemedView className='flex-row items-center mb-2'>
                  <ThemedView className='w-6 h-6 bg-gray-200 rounded-full mr-2'></ThemedView>
                  <ThemedView className='flex-1'>
                    <ThemedView className='h-3 bg-gray-200 rounded w-3/4 mb-1'></ThemedView>
                    <ThemedView className='h-2 bg-gray-200 rounded w-full'></ThemedView>
                  </ThemedView>
                </ThemedView>
                <ThemedView className='flex-row justify-between'>
                  <ThemedView className='h-2 bg-gray-200 rounded w-1/3'></ThemedView>
                  <ThemedView className='h-2 bg-gray-200 rounded w-1/4'></ThemedView>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          ) : events?.page && events.page.length > 0 ? (
            events.page.map(renderEventCard)
          ) : (
            <ThemedView className='bg-white rounded-xl p-4 shadow-sm border border-gray-100 items-center'>
              <Ionicons name='calendar-outline' size={24} color='#D1D5DB' />
              <Text className='text-gray-500 text-center mt-1 text-sm'>No upcoming events</Text>
            </ThemedView>
          )}
        </ThemedView>

        {/* Active Polls Section */}
        <ThemedView className='mb-4'>
          <ThemedView className='flex-row items-center mb-3'>
            <Ionicons name='help-circle' size={18} color='#8B5CF6' />
            <Text className='text-base font-semibold text-gray-900 ml-2'>Active Polls</Text>
          </ThemedView>
          {activePolls === undefined ? (
            // Loading state
            <ThemedView className='bg-white rounded-xl p-3 shadow-sm border border-gray-100 mb-3'>
              <ThemedView className='animate-pulse'>
                <ThemedView className='flex-row items-center mb-2'>
                  <ThemedView className='w-6 h-6 bg-gray-200 rounded-full mr-2'></ThemedView>
                  <ThemedView className='flex-1'>
                    <ThemedView className='h-3 bg-gray-200 rounded w-3/4 mb-1'></ThemedView>
                    <ThemedView className='h-2 bg-gray-200 rounded w-full'></ThemedView>
                  </ThemedView>
                </ThemedView>
                <ThemedView className='flex-row space-x-1'>
                  <ThemedView className='h-4 bg-gray-200 rounded w-12'></ThemedView>
                  <ThemedView className='h-4 bg-gray-200 rounded w-12'></ThemedView>
                  <ThemedView className='h-4 bg-gray-200 rounded w-12'></ThemedView>
                </ThemedView>
              </ThemedView>
            </ThemedView>
          ) : activePolls?.page && activePolls.page.length > 0 ? (
            activePolls.page.map(renderPollCard)
          ) : (
            <ThemedView className='bg-white rounded-xl p-4 shadow-sm border border-gray-100 items-center'>
              <Ionicons name='help-circle-outline' size={24} color='#D1D5DB' />
              <Text className='text-gray-500 text-center mt-1 text-sm'>No active polls</Text>
            </ThemedView>
          )}
        </ThemedView>

        {/* Property Notices Section */}
        <ThemedView className='mb-4'>
          <ThemedView className='flex-row items-center mb-3'>
            <Ionicons name='notifications' size={18} color='#F59E0B' />
            <Text className='text-base font-semibold text-gray-900 ml-2'>Property Notices</Text>
          </ThemedView>
          {notices === undefined ? (
            // Loading state
            <ThemedView className='bg-white rounded-xl p-3 shadow-sm border border-gray-100 mb-3'>
              <ThemedView className='animate-pulse'>
                <ThemedView className='h-3 bg-gray-200 rounded w-3/4 mb-2'></ThemedView>
                <ThemedView className='h-2 bg-gray-200 rounded w-full mb-1'></ThemedView>
                <ThemedView className='h-2 bg-gray-200 rounded w-2/3'></ThemedView>
              </ThemedView>
            </ThemedView>
          ) : notices?.page && notices.page.length > 0 ? (
            notices.page.slice(0, 5).map(renderNoticeCard)
          ) : (
            <ThemedView className='bg-white rounded-xl p-4 shadow-sm border border-gray-100 items-center'>
              <Ionicons name='notifications-outline' size={24} color='#D1D5DB' />
              <Text className='text-gray-500 text-center mt-1 text-sm'>No property notices</Text>
            </ThemedView>
          )}
        </ThemedView>

        {/* Empty State - Only show if all sections are empty and not loading */}
        {communityNews !== undefined &&
          communityNews?.page?.length === 0 &&
          events !== undefined &&
          events?.page?.length === 0 &&
          activePolls !== undefined &&
          activePolls?.page?.length === 0 &&
          notices !== undefined &&
          notices?.page?.length === 0 && (
            <ThemedView className='items-center justify-center py-12'>
              <Ionicons name='document-text-outline' size={48} color='#D1D5DB' />
              <Text className='text-gray-500 text-center mt-3 mb-1 text-sm'>No notices available</Text>
              <Text className='text-gray-400 text-center text-xs'>
                Check back later for updates from your property manager
              </Text>
            </ThemedView>
          )}
      </ThemedView>
    </ScrollView>
  );
}
