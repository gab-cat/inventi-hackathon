'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Wrench, Clock, AlertTriangle, CheckCircle, Zap, Droplets, Thermometer, Settings, Hammer } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadialBarChart,
  RadialBar,
} from 'recharts';

interface MaintenanceMetricsProps {
  maintenanceMetrics: {
    totalRequests: number;
    completedThisMonth: number;
    averageResolutionTime: number;
    emergencyRequests: number;
    requestsByPriority: {
      low: number;
      medium: number;
      high: number;
      emergency: number;
    };
    requestsByType: {
      plumbing: number;
      electrical: number;
      hvac: number;
      appliance: number;
      general: number;
    };
  };
}

export function MaintenanceMetrics({ maintenanceMetrics }: MaintenanceMetricsProps) {
  const formatTime = (milliseconds: number) => {
    const hours = Math.floor(milliseconds / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'plumbing':
        return Droplets;
      case 'electrical':
        return Zap;
      case 'hvac':
        return Thermometer;
      case 'appliance':
        return Settings;
      case 'general':
        return Hammer;
      default:
        return Wrench;
    }
  };

  const completionRate =
    maintenanceMetrics.totalRequests > 0
      ? (maintenanceMetrics.completedThisMonth / maintenanceMetrics.totalRequests) * 100
      : 0;

  // Chart data
  const priorityData = Object.entries(maintenanceMetrics.requestsByPriority).map(([priority, count]) => ({
    name: priority.charAt(0).toUpperCase() + priority.slice(1),
    value: count,
    color: getPriorityColor(priority).includes('red')
      ? '#ef4444'
      : getPriorityColor(priority).includes('orange')
        ? '#f59e0b'
        : getPriorityColor(priority).includes('yellow')
          ? '#eab308'
          : '#10b981',
  }));

  const typeData = Object.entries(maintenanceMetrics.requestsByType).map(([type, count]) => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    value: count,
    color:
      type === 'plumbing'
        ? '#06b6d4'
        : type === 'electrical'
          ? '#f59e0b'
          : type === 'hvac'
            ? '#8b5cf6'
            : type === 'appliance'
              ? '#ef4444'
              : '#10b981',
  }));

  const completionData = [
    { name: 'Completed', value: completionRate, fill: '#10b981' },
    { name: 'Remaining', value: 100 - completionRate, fill: '#e5e7eb' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-3 border border-gray-200 rounded-lg shadow-lg'>
          <p className='font-medium text-gray-900'>{payload[0].name}</p>
          <p className='text-sm' style={{ color: payload[0].color }}>
            {payload[0].value}{' '}
            {payload[0].name.includes('Completed') || payload[0].name.includes('Remaining') ? '%' : 'requests'}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className='space-y-6'>
      {/* Main Metrics */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
        <Card className='h-full flex flex-col'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Total Requests</CardTitle>
            <Wrench className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent className='flex-1 flex flex-col justify-between'>
            <div className='text-2xl font-bold'>{maintenanceMetrics.totalRequests}</div>
            <p className='text-xs text-muted-foreground'>All time requests</p>
          </CardContent>
        </Card>

        <Card className='h-full flex flex-col'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Completed This Month</CardTitle>
            <CheckCircle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent className='flex-1 flex flex-col justify-between'>
            <div className='text-2xl font-bold'>{maintenanceMetrics.completedThisMonth}</div>
            <div className='mt-2'>
              <Progress value={completionRate} className='h-2' />
              <p className='text-xs text-muted-foreground mt-1'>{completionRate.toFixed(1)}% completion rate</p>
            </div>
          </CardContent>
        </Card>

        <Card className='h-full flex flex-col'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Avg Resolution Time</CardTitle>
            <Clock className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent className='flex-1 flex flex-col justify-between'>
            <div className='text-2xl font-bold'>{formatTime(maintenanceMetrics.averageResolutionTime)}</div>
            <p className='text-xs text-muted-foreground'>Average time to complete</p>
          </CardContent>
        </Card>

        <Card className='h-full flex flex-col'>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Emergency Requests</CardTitle>
            <AlertTriangle className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent className='flex-1 flex flex-col justify-between'>
            <div>
              <div className='text-2xl font-bold text-red-600'>{maintenanceMetrics.emergencyRequests}</div>
              <p className='text-xs text-muted-foreground'>Urgent issues</p>
            </div>
            {maintenanceMetrics.emergencyRequests > 0 && (
              <div className='flex items-center mt-2'>
                <AlertTriangle className='h-3 w-3 text-red-500 mr-1' />
                <span className='text-xs text-red-600'>Immediate attention needed</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className='grid grid-cols-1 xl:grid-cols-2 gap-6'>
        {/* Completion Rate Chart */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <CheckCircle className='h-5 w-5' />
              Completion Rate
            </CardTitle>
            <p className='text-sm text-muted-foreground'>Percentage of maintenance requests completed this month</p>
          </CardHeader>
          <CardContent>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <RadialBarChart cx='50%' cy='50%' innerRadius='60%' outerRadius='90%' data={completionData}>
                  <RadialBar dataKey='value' cornerRadius={10} fill='#10b981' />
                  <text
                    x='50%'
                    y='50%'
                    textAnchor='middle'
                    dominantBaseline='middle'
                    className='text-2xl font-bold fill-gray-900'
                  >
                    {completionRate.toFixed(1)}%
                  </text>
                  <text x='50%' y='60%' textAnchor='middle' dominantBaseline='middle' className='text-sm fill-gray-600'>
                    Completion Rate
                  </text>
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5' />
              Requests by Priority
            </CardTitle>
            <p className='text-sm text-muted-foreground'>Distribution of maintenance requests by urgency level</p>
          </CardHeader>
          <CardContent>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey='value'
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Type Breakdown Chart */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Wrench className='h-5 w-5' />
            Requests by Type
          </CardTitle>
          <p className='text-sm text-muted-foreground'>Breakdown of maintenance requests by category and type</p>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Type Chart */}
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={typeData}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                  <XAxis dataKey='name' stroke='#666' fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke='#666' fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey='value' radius={[4, 4, 0, 0]}>
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Type Icons and Stats */}
            <div className='space-y-4'>
              {Object.entries(maintenanceMetrics.requestsByType).map(([type, count]) => {
                const Icon = getTypeIcon(type);
                const percentage =
                  maintenanceMetrics.totalRequests > 0 ? (count / maintenanceMetrics.totalRequests) * 100 : 0;

                return (
                  <div key={type} className='flex items-center justify-between p-3 bg-accent/50 border rounded-lg'>
                    <div className='flex items-center space-x-3'>
                      <Icon className='h-6 w-6 text-muted-foreground' />
                      <div>
                        <p className='font-medium capitalize'>{type}</p>
                        <p className='text-sm text-muted-foreground'>{percentage.toFixed(1)}% of total</p>
                      </div>
                    </div>
                    <div className='text-right'>
                      <div className='text-2xl font-bold'>{count}</div>
                      <div className='w-16 bg-gray-200 rounded-full h-2 mt-1'>
                        <div className='bg-blue-500 h-2 rounded-full' style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
