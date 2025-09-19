'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CheckCircle, Clock, XCircle, UserCheck, UserX, AlertTriangle } from 'lucide-react';
import { VisitorRequestWithDetails } from '../types/api';

interface VisitorStatsProps {
  visitors: VisitorRequestWithDetails[];
  activeVisitors: number;
}

export function VisitorStats({ visitors, activeVisitors }: VisitorStatsProps) {
  const stats = {
    total: visitors.length,
    pending: visitors.filter(v => v.status === 'pending').length,
    approved: visitors.filter(v => v.status === 'approved').length,
    denied: visitors.filter(v => v.status === 'denied').length,
    cancelled: visitors.filter(v => v.status === 'cancelled').length,
    expired: visitors.filter(v => v.status === 'expired').length,
    active: activeVisitors,
  };

  const statCards = [
    {
      title: 'Total Requests',
      value: stats.total,
      icon: Users,
      description: 'All visitor requests',
      color: 'text-blue-600',
    },
    {
      title: 'Pending',
      value: stats.pending,
      icon: Clock,
      description: 'Awaiting approval',
      color: 'text-yellow-600',
    },
    {
      title: 'Approved',
      value: stats.approved,
      icon: CheckCircle,
      description: 'Approved requests',
      color: 'text-green-600',
    },
    {
      title: 'Active',
      value: stats.active,
      icon: UserCheck,
      description: 'Currently checked in',
      color: 'text-emerald-600',
    },
    {
      title: 'Denied',
      value: stats.denied,
      icon: XCircle,
      description: 'Rejected requests',
      color: 'text-red-600',
    },
    {
      title: 'No Shows',
      value: stats.expired,
      icon: UserX,
      description: 'Missed appointments',
      color: 'text-orange-600',
    },
  ];

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4'>
      {statCards.map(stat => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title}>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{stat.value}</div>
              <p className='text-xs text-muted-foreground'>{stat.description}</p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
