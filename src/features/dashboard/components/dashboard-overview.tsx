'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatCard } from '@/components/ui/stat-card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, Wrench, UserCheck, Package, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
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
} from 'recharts';

interface DashboardOverviewProps {
  propertyOverview: {
    totalUnits: number;
    occupiedUnits: number;
    occupancyRate: number;
    totalTenants: number;
    activeMaintenanceRequests: number;
    pendingVisitorRequests: number;
    pendingDeliveries: number;
  };
  financialMetrics: {
    totalRevenue: number;
    pendingPayments: number;
    overduePayments: number;
    monthlyRevenue: number;
    collectionRate: number;
    maintenanceCosts: number;
  };
}

export function DashboardOverview({ propertyOverview, financialMetrics }: DashboardOverviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getOccupancyStatus = (rate: number) => {
    if (rate >= 95) return { color: 'bg-green-100 text-green-800', label: 'Excellent' };
    if (rate >= 85) return { color: 'bg-blue-100 text-blue-800', label: 'Good' };
    if (rate >= 70) return { color: 'bg-yellow-100 text-yellow-800', label: 'Fair' };
    return { color: 'bg-red-100 text-red-800', label: 'Low' };
  };

  const occupancyStatus = getOccupancyStatus(propertyOverview.occupancyRate);

  // Chart data
  const occupancyData = [
    { name: 'Occupied', value: propertyOverview.occupiedUnits, color: '#10b981' },
    { name: 'Vacant', value: propertyOverview.totalUnits - propertyOverview.occupiedUnits, color: '#ef4444' },
  ];

  const operationalData = [
    { name: 'Maintenance', value: propertyOverview.activeMaintenanceRequests, color: '#f59e0b' },
    { name: 'Visitors', value: propertyOverview.pendingVisitorRequests, color: '#8b5cf6' },
    { name: 'Deliveries', value: propertyOverview.pendingDeliveries, color: '#06b6d4' },
  ];

  const financialData = [
    { name: 'Total Revenue', value: financialMetrics.totalRevenue, color: '#10b981' },
    { name: 'Pending Payments', value: financialMetrics.pendingPayments, color: '#3b82f6' },
    { name: 'Overdue Payments', value: financialMetrics.overduePayments, color: '#ef4444' },
  ];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className='bg-white p-3 border border-gray-200 rounded-lg shadow-lg'>
          <p className='font-medium text-gray-900'>{payload[0].name}</p>
          <p className='text-sm' style={{ color: payload[0].color }}>
            {payload[0].name.includes('Revenue') || payload[0].name.includes('Payments')
              ? formatCurrency(payload[0].value)
              : payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className='space-y-6'>
      {/* Property Overview Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        <StatCard
          title='Total Units'
          value={propertyOverview.totalUnits}
          description={`${propertyOverview.occupiedUnits} occupied`}
          icon={Building2}
        />

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Occupancy Rate</CardTitle>
            <Building2 className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{propertyOverview.occupancyRate.toFixed(1)}%</div>
            <div className='flex items-center space-x-2 mt-1'>
              <Badge className={occupancyStatus.color}>{occupancyStatus.label}</Badge>
            </div>
          </CardContent>
        </Card>

        <StatCard
          title='Active Tenants'
          value={propertyOverview.totalTenants}
          description='Registered tenants'
          icon={Users}
        />

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Monthly Revenue</CardTitle>
            <TrendingUp className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{formatCurrency(financialMetrics.monthlyRevenue)}</div>
            <p className='text-xs text-muted-foreground'>
              Collection rate: {financialMetrics.collectionRate.toFixed(1)}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Operational Status Cards */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Maintenance</CardTitle>
            <Wrench className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{propertyOverview.activeMaintenanceRequests}</div>
            <p className='text-xs text-muted-foreground'>Active requests</p>
            {propertyOverview.activeMaintenanceRequests > 0 && (
              <div className='flex items-center mt-2'>
                <AlertTriangle className='h-3 w-3 text-orange-500 mr-1' />
                <span className='text-xs text-orange-600'>Needs attention</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Visitors</CardTitle>
            <UserCheck className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{propertyOverview.pendingVisitorRequests}</div>
            <p className='text-xs text-muted-foreground'>Pending approvals</p>
            {propertyOverview.pendingVisitorRequests === 0 && (
              <div className='flex items-center mt-2'>
                <CheckCircle className='h-3 w-3 text-green-500 mr-1' />
                <span className='text-xs text-green-600'>All clear</span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
            <CardTitle className='text-sm font-medium'>Deliveries</CardTitle>
            <Package className='h-4 w-4 text-muted-foreground' />
          </CardHeader>
          <CardContent>
            <div className='text-2xl font-bold'>{propertyOverview.pendingDeliveries}</div>
            <p className='text-xs text-muted-foreground'>Awaiting collection</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
        {/* Occupancy Chart */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <Building2 className='h-5 w-5' />
              Unit Occupancy
            </CardTitle>
            <p className='text-sm text-muted-foreground'>
              Visual breakdown of occupied vs vacant units in your property
            </p>
          </CardHeader>
          <CardContent>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <PieChart>
                  <Pie
                    data={occupancyData}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey='value'
                  >
                    {occupancyData.map((entry, index) => (
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

        {/* Operational Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className='flex items-center gap-2'>
              <AlertTriangle className='h-5 w-5' />
              Pending Operations
            </CardTitle>
            <p className='text-sm text-muted-foreground'>
              Current pending items requiring attention across different operations
            </p>
          </CardHeader>
          <CardContent>
            <div className='h-64'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={operationalData}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                  <XAxis dataKey='name' stroke='#666' fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke='#666' fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey='value' radius={[4, 4, 0, 0]}>
                    {operationalData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Financial Overview
          </CardTitle>
          <p className='text-sm text-muted-foreground'>
            Revenue collection status and payment tracking across all units
          </p>
        </CardHeader>
        <CardContent>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Financial Summary Cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='text-center'>
                <div className='text-2xl font-bold text-green-600'>{formatCurrency(financialMetrics.totalRevenue)}</div>
                <p className='text-sm text-muted-foreground'>Total Revenue</p>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-blue-600'>
                  {formatCurrency(financialMetrics.pendingPayments)}
                </div>
                <p className='text-sm text-muted-foreground'>Pending Payments</p>
              </div>
              <div className='text-center'>
                <div className='text-2xl font-bold text-red-600'>
                  {formatCurrency(financialMetrics.overduePayments)}
                </div>
                <p className='text-sm text-muted-foreground'>Overdue Payments</p>
              </div>
            </div>

            {/* Financial Chart */}
            <div className='h-48'>
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart data={financialData}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                  <XAxis dataKey='name' stroke='#666' fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke='#666' fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey='value' radius={[4, 4, 0, 0]}>
                    {financialData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
