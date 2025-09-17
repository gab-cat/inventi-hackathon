import { mutation } from '../_generated/server';
import { v } from 'convex/values';

export const seedNotices = mutation({
  args: {},
  returns: v.object({
    notices: v.number(),
    events: v.number(),
    polls: v.number(),
    acknowledgments: v.number(),
  }),
  handler: async ctx => {
    // Get existing data to seed notices
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', q => q.eq('clerkId', 'user_32msooiDCcy4XFaNVVRL3wIlIg1'))
      .unique();

    if (!existingUser) {
      throw new Error('Manager user not found. Please run the main seed first.');
    }

    const properties = await ctx.db.query('properties').collect();
    if (properties.length === 0) {
      throw new Error('No properties found. Please run the main seed first.');
    }

    const tenants = await ctx.db
      .query('users')
      .filter(q => q.eq(q.field('role'), 'tenant'))
      .collect();
    const units = await ctx.db
      .query('units')
      .filter(q => q.eq(q.field('isOccupied'), true))
      .collect();

    let noticesCount = 0;
    let eventsCount = 0;
    let pollsCount = 0;
    let acknowledgmentsCount = 0;

    // Helper function to get random items from array
    const getRandomItems = <T>(array: T[], count: number): T[] => {
      const shuffled = [...array].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, count);
    };

    // Helper function to get random item from array
    const getRandomItem = <T>(array: T[]): T => {
      return array[Math.floor(Math.random() * array.length)];
    };

    // Create property-wide announcements
    const announcements = [
      {
        title: 'Welcome to Sunset Apartments!',
        content:
          "Welcome to your new home! We're excited to have you as part of our community. Please take a moment to review our community guidelines and get to know your neighbors.",
        noticeType: 'announcement',
        priority: 'low',
        targetAudience: 'all',
      },
      {
        title: 'Holiday Decorating Contest',
        content:
          'Show off your holiday spirit! Decorate your unit and enter our annual holiday decorating contest. Winner receives a $100 gift card and bragging rights!',
        noticeType: 'announcement',
        priority: 'medium',
        targetAudience: 'tenants',
      },
      {
        title: 'Community Garden Update',
        content:
          'The community garden maintenance is now complete. All garden areas are open and ready for planting. Seeds and tools are available in the lobby.',
        noticeType: 'announcement',
        priority: 'low',
        targetAudience: 'all',
      },
      {
        title: 'Fitness Center Renovation',
        content:
          'Our fitness center will be closed for renovations starting next Monday. We expect to reopen in two weeks with brand new equipment!',
        noticeType: 'maintenance',
        priority: 'medium',
        targetAudience: 'tenants',
      },
    ];

    // Create property notices
    for (const property of properties) {
      for (const announcement of announcements) {
        const noticeId = await ctx.db.insert('notices', {
          propertyId: property._id,
          createdBy: existingUser._id,
          title: announcement.title,
          content: announcement.content,
          noticeType: announcement.noticeType,
          priority: announcement.priority,
          targetAudience: announcement.targetAudience,
          targetUnits: undefined,
          isActive: true,
          scheduledAt: undefined,
          expiresAt: undefined,
          attachments: [],
          createdAt: Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000, // Random time within last week
          updatedAt: Date.now(),
        });
        noticesCount++;

        // Create some acknowledgments for recent notices
        if (Math.random() > 0.5) {
          const noticeTenants = tenants.filter(t => Math.random() > 0.7);
          for (const tenant of noticeTenants) {
            await ctx.db.insert('noticeAcknowledgments', {
              noticeId,
              userId: tenant._id,
              acknowledgedAt: Date.now() - Math.random() * 24 * 60 * 60 * 1000, // Random time within last day
            });
            acknowledgmentsCount++;
          }
        }
      }

      // Create payment reminders
      const paymentReminders = [
        {
          title: 'Rent Payment Due',
          content:
            'Your monthly rent payment is due in 3 days. Please ensure payment is made by the due date to avoid late fees.',
          noticeType: 'payment_reminder',
          priority: 'high',
          targetAudience: 'tenants',
        },
        {
          title: 'Parking Fee Reminder',
          content:
            'Monthly parking fees are due this Friday. Reserved parking spots are assigned on a first-come, first-served basis.',
          noticeType: 'payment_reminder',
          priority: 'medium',
          targetAudience: 'tenants',
        },
      ];

      for (const reminder of paymentReminders) {
        const noticeId = await ctx.db.insert('notices', {
          propertyId: property._id,
          createdBy: existingUser._id,
          title: reminder.title,
          content: reminder.content,
          noticeType: reminder.noticeType,
          priority: reminder.priority,
          targetAudience: reminder.targetAudience,
          targetUnits: undefined,
          isActive: true,
          scheduledAt: undefined,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // Expires in 1 week
          attachments: [],
          createdAt: Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000, // Random time within last 3 days
          updatedAt: Date.now(),
        });
        noticesCount++;
      }

      // Create emergency notices
      const emergencies = [
        {
          title: 'Emergency Maintenance - Water Main Break',
          content:
            'Due to a water main break in the area, water service may be intermittent for the next few hours. Please conserve water and report any issues.',
          noticeType: 'emergency',
          priority: 'urgent',
          targetAudience: 'all',
        },
        {
          title: 'Fire Alarm Test',
          content:
            'Monthly fire alarm test scheduled for tomorrow at 10 AM. You will hear a series of beeps. This is a test - no action required.',
          noticeType: 'emergency',
          priority: 'medium',
          targetAudience: 'all',
        },
      ];

      for (const emergency of emergencies) {
        const noticeId = await ctx.db.insert('notices', {
          propertyId: property._id,
          createdBy: existingUser._id,
          title: emergency.title,
          content: emergency.content,
          noticeType: emergency.noticeType,
          priority: emergency.priority,
          targetAudience: emergency.targetAudience,
          targetUnits: undefined,
          isActive: true,
          scheduledAt: undefined,
          expiresAt: Date.now() + 24 * 60 * 60 * 1000, // Expires in 24 hours
          attachments: [],
          createdAt: Date.now() - Math.random() * 24 * 60 * 60 * 1000, // Random time within last day
          updatedAt: Date.now(),
        });
        noticesCount++;
      }
    }

    // Create events
    const events = [
      {
        title: 'Community Potluck Dinner',
        description:
          'Join us for our monthly community potluck! Bring your favorite dish and meet your neighbors. Location: Community Room.',
        eventType: 'community',
        startDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // Next week
        endDate: Date.now() + 7 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000, // 3 hours later
        location: 'Community Room',
        isRecurring: false,
        maxAttendees: 50,
        isPublic: true,
      },
      {
        title: 'Fitness Class - Yoga',
        description: 'Free yoga class for all residents. Bring your own mat. Beginner-friendly session.',
        eventType: 'social',
        startDate: Date.now() + 3 * 24 * 60 * 60 * 1000, // In 3 days
        endDate: Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000, // 1 hour later
        location: 'Fitness Center',
        isRecurring: true,
        maxAttendees: 20,
        isPublic: true,
      },
      {
        title: 'Board Meeting',
        description: 'Monthly board meeting to discuss property matters and community concerns.',
        eventType: 'meeting',
        startDate: Date.now() + 14 * 24 * 60 * 60 * 1000, // In 2 weeks
        endDate: Date.now() + 14 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000, // 2 hours later
        location: 'Conference Room',
        isRecurring: true,
        maxAttendees: undefined,
        isPublic: false,
      },
      {
        title: 'Elevator Maintenance',
        description:
          'Scheduled maintenance on Building A elevators. Elevators will be out of service from 10 PM to 6 AM.',
        eventType: 'maintenance',
        startDate: Date.now() + 2 * 24 * 60 * 60 * 1000, // In 2 days at 10 PM
        endDate: Date.now() + 2 * 24 * 60 * 60 * 1000 + 8 * 60 * 60 * 1000, // 8 hours later
        location: 'Building A',
        isRecurring: false,
        maxAttendees: undefined,
        isPublic: true,
      },
    ];

    for (const property of properties) {
      for (const event of events) {
        const eventId = await ctx.db.insert('events', {
          propertyId: property._id,
          createdBy: existingUser._id,
          title: event.title,
          description: event.description,
          eventType: event.eventType,
          startDate: event.startDate,
          endDate: event.endDate,
          location: event.location,
          isRecurring: event.isRecurring,
          recurringPattern: event.isRecurring ? 'monthly' : undefined,
          maxAttendees: event.maxAttendees,
          isPublic: event.isPublic,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        eventsCount++;

        // Create some event RSVPs
        if (event.isPublic) {
          const rsvpTenants = getRandomItems(tenants, Math.min(tenants.length, event.maxAttendees || 10));
          for (const tenant of rsvpTenants) {
            const status = Math.random() > 0.3 ? 'attending' : Math.random() > 0.5 ? 'maybe' : 'declined';
            await ctx.db.insert('eventAttendees', {
              eventId,
              userId: tenant._id,
              status,
              registeredAt: Date.now() - Math.random() * 24 * 60 * 60 * 1000,
            });
          }
        }
      }
    }

    // Create polls
    const polls = [
      {
        title: 'Property Improvement Survey',
        description: "Help us improve our property! Tell us what amenities you'd like to see added.",
        question: 'Which amenity would you most like to see added to the property?',
        options: ['Rooftop Garden', 'Additional Parking', 'Swimming Pool', 'Community Theater', 'Pet Park'],
        pollType: 'single_choice',
        isActive: true,
        allowAnonymous: false,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 1 week
      },
      {
        title: 'Noise Policy Feedback',
        description: "We're reviewing our noise policy. Your input helps us maintain a comfortable living environment.",
        question: 'What are your thoughts on quiet hours?',
        options: ['Current hours are perfect', 'Should start earlier', 'Should end later', 'Need more enforcement'],
        pollType: 'multiple_choice',
        isActive: true,
        allowAnonymous: true,
        expiresAt: Date.now() + 14 * 24 * 60 * 60 * 1000, // 2 weeks
      },
      {
        title: 'Holiday Decorations',
        description: 'Share your thoughts on holiday decorations this year.',
        question: 'How would you rate our holiday decorations?',
        options: ['1', '2', '3', '4', '5'],
        pollType: 'rating',
        isActive: true,
        allowAnonymous: false,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      },
      {
        title: 'Maintenance Satisfaction',
        description: 'How satisfied are you with our maintenance response times?',
        question: 'Please share any additional feedback about maintenance services.',
        options: [],
        pollType: 'text',
        isActive: true,
        allowAnonymous: false,
        expiresAt: Date.now() + 21 * 24 * 60 * 60 * 1000, // 3 weeks
      },
    ];

    for (const property of properties) {
      for (const poll of polls) {
        const pollId = await ctx.db.insert('polls', {
          propertyId: property._id,
          createdBy: existingUser._id,
          title: poll.title,
          description: poll.description,
          question: poll.question,
          options: poll.options,
          pollType: poll.pollType,
          isActive: poll.isActive,
          allowAnonymous: poll.allowAnonymous,
          expiresAt: poll.expiresAt,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        });
        pollsCount++;

        // Create some poll responses
        const responseTenants = getRandomItems(tenants, Math.floor(tenants.length * 0.6)); // 60% response rate
        for (const tenant of responseTenants) {
          let selectedOptions: number[] = [];
          let textResponse: string | undefined;

          if (poll.pollType === 'single_choice' || poll.pollType === 'rating') {
            selectedOptions = [Math.floor(Math.random() * poll.options.length)];
          } else if (poll.pollType === 'multiple_choice') {
            const numOptions = Math.floor(Math.random() * poll.options.length) + 1;
            selectedOptions = getRandomItems(
              Array.from({ length: poll.options.length }, (_, i) => i),
              numOptions
            );
          } else if (poll.pollType === 'text') {
            const responses = [
              'Very satisfied with the quick response times!',
              'Could be faster during peak hours.',
              'Excellent service overall.',
              'Need better communication about maintenance schedules.',
              'Staff is very professional and helpful.',
            ];
            textResponse = getRandomItem(responses);
          }

          await ctx.db.insert('pollResponses', {
            pollId,
            userId: poll.allowAnonymous && Math.random() > 0.5 ? undefined : tenant._id,
            selectedOptions,
            textResponse,
            submittedAt: Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000, // Random time within last 3 days
          });
        }
      }
    }

    return {
      notices: noticesCount,
      events: eventsCount,
      polls: pollsCount,
      acknowledgments: acknowledgmentsCount,
    };
  },
});
