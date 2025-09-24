'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { TrendingUp, Activity, Users, Package } from 'lucide-react';

interface ActivityTrendsProps {
  trends: {
    maintenanceTrend: Array<{ date: string; count: number }>;
    revenueTrend: Array<{ date: string; amount: number }>;
    visitorTrend: Array<{ date: string; count: number }>;
    deliveryTrend: Array<{ date: string; count: number }>;
  };
}

export function ActivityTrends({ trends }: ActivityTrendsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-3 border border-gray-200 rounded-lg shadow-lg'>
          <p className='font-medium text-gray-900'>{formatDate(label)}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className='text-sm' style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Revenue') ? formatCurrency(entry.value) : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Calculate totals for summary cards
  const totalMaintenance = trends.maintenanceTrend.reduce((sum, item) => sum + item.count, 0);
  const totalRevenue = trends.revenueTrend.reduce((sum, item) => sum + item.amount, 0);
  const totalVisitors = trends.visitorTrend.reduce((sum, item) => sum + item.count, 0);
  const totalDeliveries = trends.deliveryTrend.reduce((sum, item) => sum + item.count, 0);

  return (
    <div className='space-y-6'>
      {/* Summary Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Maintenance (30d)</CardTitle>
            <Activity className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalMaintenance}</div>
            <p className='text-xs text-muted-foreground'>Total requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Revenue (30d)</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{formatCurrency(totalRevenue)}</div>
            <p className='text-xs text-muted-foreground'>Total collected</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Visitors (30d)</CardTitle>
            <Users className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalVisitors}</div>
            <p className='text-xs text-muted-foreground'>Total visitors</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Deliveries (30d)</CardTitle>
            <Package className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{totalDeliveries}</div>
            <p className='text-xs text-muted-foreground'>Total deliveries</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
         {/* Maintenance Trend */}
         <Card>
           <CardHeader>
             <CardTitle className='flex items-center gap-2'>
               <Activity className='h-5 w-5' />
               Maintenance Requests Trend
             </CardTitle>
             <p className='text-sm text-muted-foreground'>
               Daily maintenance request volume over the last 30 days
             </p>
           </CardHeader>
           <CardContent>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={trends.maintenanceTrend}>
                  <defs>
                    <linearGradient id='maintenanceGradient' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#3b82f6' stopOpacity={0.3} />
                      <stop offset='95%' stopColor='#3b82f6' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                  <XAxis
                    dataKey='date'
                    stroke='#666'
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatDate}
                  />
                  <YAxis stroke='#666' fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type='monotone'
                    dataKey='count'
                    stroke='#3b82f6'
                    fill='url(#maintenanceGradient)'
                    strokeWidth={2}
                    name='Maintenance Requests'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

         {/* Revenue Trend */}
         <Card>
           <CardHeader>
             <CardTitle className='flex items-center gap-2'>
               <TrendingUp className='h-5 w-5' />
               Revenue Trend
             </CardTitle>
             <p className='text-sm text-muted-foreground'>
               Daily revenue collection trends over the last 30 days
             </p>
           </CardHeader>
           <CardContent>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={trends.revenueTrend}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                  <XAxis
                    dataKey='date'
                    stroke='#666'
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatDate}
                  />
                  <YAxis stroke='#666' fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type='monotone'
                    dataKey='amount'
                    stroke='#10b981'
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name='Daily Revenue'
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

         {/* Visitor Trend */}
         <Card>
           <CardHeader>
             <CardTitle className='flex items-center gap-2'>
               <Users className='h-5 w-5' />
               Visitor Activity Trend
             </CardTitle>
             <p className='text-sm text-muted-foreground'>
               Daily visitor check-ins and activity over the last 30 days
             </p>
           </CardHeader>
           <CardContent>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <AreaChart data={trends.visitorTrend}>
                  <defs>
                    <linearGradient id='visitorGradient' x1='0' y1='0' x2='0' y2='1'>
                      <stop offset='5%' stopColor='#f59e0b' stopOpacity={0.3} />
                      <stop offset='95%' stopColor='#f59e0b' stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                  <XAxis
                    dataKey='date'
                    stroke='#666'
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatDate}
                  />
                  <YAxis stroke='#666' fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type='monotone'
                    dataKey='count'
                    stroke='#f59e0b'
                    fill='url(#visitorGradient)'
                    strokeWidth={2}
                    name='Daily Visitors'
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

         {/* Delivery Trend */}
         <Card>
           <CardHeader>
             <CardTitle className='flex items-center gap-2'>
               <Package className='h-5 w-5' />
               Delivery Activity Trend
             </CardTitle>
             <p className='text-sm text-muted-foreground'>
               Daily package and delivery volume over the last 30 days
             </p>
           </CardHeader>
           <CardContent>
            <div className='h-80'>
              <ResponsiveContainer width='100%' height='100%'>
                <LineChart data={trends.deliveryTrend}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                  <XAxis
                    dataKey='date'
                    stroke='#666'
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatDate}
                  />
                  <YAxis stroke='#666' fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type='monotone'
                    dataKey='count'
                    stroke='#8b5cf6'
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                    name='Daily Deliveries'
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
