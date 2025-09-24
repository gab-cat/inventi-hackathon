'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, MessageSquare, UserPlus, Package, Wrench, Bell, Eye, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface QuickActionsProps {
  unreadMessages: number;
  pendingVisitorRequests: number;
  pendingDeliveries: number;
  activeMaintenanceRequests: number;
  emergencyRequests: number;
}

export function QuickActions({
  unreadMessages,
  pendingVisitorRequests,
  pendingDeliveries,
  activeMaintenanceRequests,
  emergencyRequests,
}: QuickActionsProps) {
  const actions = [
    {
      title: 'New Maintenance Request',
      description: 'Report a maintenance issue',
      icon: Wrench,
      href: '/maintenance',
      color: 'bg-blue-500 hover:bg-blue-600',
      urgent: emergencyRequests > 0,
    },
    {
      title: 'Send Message',
      description: 'Communicate with residents',
      icon: MessageSquare,
      href: '/messages',
      color: 'bg-green-500 hover:bg-green-600',
      badge: unreadMessages > 0 ? unreadMessages : undefined,
    },
    {
      title: 'Approve Visitors',
      description: 'Manage visitor requests',
      icon: UserPlus,
      href: '/visitors',
      color: 'bg-purple-500 hover:bg-purple-600',
      badge: pendingVisitorRequests > 0 ? pendingVisitorRequests : undefined,
    },
    {
      title: 'Manage Deliveries',
      description: 'Track package deliveries',
      icon: Package,
      href: '/deliveries',
      color: 'bg-orange-500 hover:bg-orange-600',
      badge: pendingDeliveries > 0 ? pendingDeliveries : undefined,
    },
  ];

  const alerts = [
    {
      title: 'Emergency Maintenance',
      count: emergencyRequests,
      icon: Bell,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      href: '/maintenance?priority=emergency',
      show: emergencyRequests > 0,
    },
    {
      title: 'Unread Messages',
      count: unreadMessages,
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/messages',
      show: unreadMessages > 0,
    },
    {
      title: 'Pending Visitors',
      count: pendingVisitorRequests,
      icon: UserPlus,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      href: '/visitors',
      show: pendingVisitorRequests > 0,
    },
    {
      title: 'Pending Deliveries',
      count: pendingDeliveries,
      icon: Package,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      href: '/deliveries',
      show: pendingDeliveries > 0,
    },
  ].filter(alert => alert.show);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className='space-y-6'
    >
      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Plus className='h-5 w-5' />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              {actions.map((action, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link href={action.href}>
                    <Button
                      className={`w-full h-auto p-4 flex flex-col items-start space-y-2 ${action.color} text-white`}
                      variant='default'
                    >
                      <div className='flex items-center justify-between w-full'>
                        <div className='flex items-center space-x-2'>
                          <action.icon className='h-5 w-5' />
                          <span className='font-medium'>{action.title}</span>
                        </div>
                        {action.badge && (
                          <Badge variant='secondary' className='bg-white/20 text-white'>
                            {action.badge}
                          </Badge>
                        )}
                        {action.urgent && (
                          <Badge variant='destructive' className='bg-red-500 text-white'>
                            Urgent
                          </Badge>
                        )}
                      </div>
                      <p className='text-sm text-white/80 text-left'>{action.description}</p>
                    </Button>
                  </Link>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Alerts & Notifications */}
      {alerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className='flex items-center gap-2'>
                <Bell className='h-5 w-5' />
                Alerts & Notifications
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className='space-y-3'>
                {alerts.map((alert, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.7 + index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    <Link href={alert.href}>
                      <div className={`p-3 mb-2 rounded-lg border hover:shadow-md transition-shadow cursor-pointer`}>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-3'>
                            <alert.icon className={`h-5 w-5 ${alert.color}`} />
                            <span className='font-medium'>{alert.title}</span>
                          </div>
                          <div className='flex items-center space-x-2'>
                            <Badge variant='secondary' className={alert.color}>
                              {alert.count}
                            </Badge>
                            <Eye className='h-4 w-4 text-muted-foreground' />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* System Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Settings className='h-5 w-5' />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.9 }}
                className='text-center'
              >
                <div className='text-2xl font-bold text-green-600'>Online</div>
                <p className='text-sm text-muted-foreground'>System Status</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 1.0 }}
                className='text-center'
              >
                <div className='text-2xl font-bold text-blue-600'>
                  {activeMaintenanceRequests + unreadMessages + pendingVisitorRequests + pendingDeliveries}
                </div>
                <p className='text-sm text-muted-foreground'>Pending Items</p>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 1.1 }}
                className='text-center'
              >
                <div className='text-2xl font-bold text-orange-600'>{emergencyRequests}</div>
                <p className='text-sm text-muted-foreground'>Urgent Items</p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
