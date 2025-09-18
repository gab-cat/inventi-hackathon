'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { UtilizationChartProps } from '../../types';
import { CHART_COLORS, formatTooltipDate, formatNumber, getChartConfig } from '../../lib/chart-utils';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className='bg-white p-3 border border-gray-200 rounded-lg shadow-lg'>
        <p className='font-medium text-gray-900'>{formatTooltipDate(label || '')}</p>
        {payload.map((entry, index) => (
          <p key={index} className='text-sm' style={{ color: entry.color }}>
            {entry.name}: {formatNumber(entry.value)}
          </p>
        ))}
        {payload[0] && payload[1] && (
          <p className='text-sm text-gray-600 mt-1'>
            Net Change: {payload[0].value - payload[1].value > 0 ? '+' : ''}
            {formatNumber(payload[0].value - payload[1].value)}
          </p>
        )}
      </div>
    );
  }
  return null;
};

export function AssetUtilizationChart({
  data,
  showNetChange = true,
  className = '',
  showTooltip = true,
  showLegend = true,
}: UtilizationChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Activity className='h-5 w-5' />
            Asset Utilization Trend
          </CardTitle>
          <CardDescription>Track asset check-in and check-out patterns over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center h-64 text-gray-500'>No utilization data available</div>
        </CardContent>
      </Card>
    );
  }

  const config = getChartConfig('line');
  const totalCheckouts = data.reduce((sum, item) => sum + item.checkouts, 0);
  const totalCheckins = data.reduce((sum, item) => sum + item.checkins, 0);
  const netChange = totalCheckouts - totalCheckins;
  const utilizationRate = data.length > 0 ? data.reduce((sum, item) => sum + item.utilizationRate, 0) / data.length : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Activity className='h-5 w-5' />
          Asset Utilization Trend
        </CardTitle>
        <CardDescription>Track asset check-in and check-out patterns over time</CardDescription>
      </CardHeader>
      <CardContent>
        {/* KPI Cards */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
          <div className='bg-blue-50 p-3 rounded-lg'>
            <div className='flex items-center gap-2'>
              <TrendingUp className='h-4 w-4 text-blue-600' />
              <span className='text-sm font-medium text-blue-900'>Total Checkouts</span>
            </div>
            <p className='text-2xl font-bold text-blue-600'>{formatNumber(totalCheckouts)}</p>
          </div>
          <div className='bg-green-50 p-3 rounded-lg'>
            <div className='flex items-center gap-2'>
              <TrendingDown className='h-4 w-4 text-green-600' />
              <span className='text-sm font-medium text-green-900'>Total Checkins</span>
            </div>
            <p className='text-2xl font-bold text-green-600'>{formatNumber(totalCheckins)}</p>
          </div>
          <div className={`p-3 rounded-lg ${netChange >= 0 ? 'bg-orange-50' : 'bg-red-50'}`}>
            <div className='flex items-center gap-2'>
              {netChange >= 0 ? (
                <TrendingUp className='h-4 w-4 text-orange-600' />
              ) : (
                <TrendingDown className='h-4 w-4 text-red-600' />
              )}
              <span className={`text-sm font-medium ${netChange >= 0 ? 'text-orange-900' : 'text-red-900'}`}>
                Net Change
              </span>
            </div>
            <p className={`text-2xl font-bold ${netChange >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
              {netChange >= 0 ? '+' : ''}
              {formatNumber(netChange)}
            </p>
          </div>
          <div className='bg-purple-50 p-3 rounded-lg'>
            <div className='flex items-center gap-2'>
              <Activity className='h-4 w-4 text-purple-600' />
              <span className='text-sm font-medium text-purple-900'>Avg Utilization</span>
            </div>
            <p className='text-2xl font-bold text-purple-600'>{Math.round(utilizationRate)}%</p>
          </div>
        </div>

        {/* Chart */}
        <div className='h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            {showNetChange ? (
              <AreaChart data={data} margin={config.margin}>
                <defs>
                  <linearGradient id='checkoutGradient' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                    <stop offset='95%' stopColor={CHART_COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id='checkinGradient' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor={CHART_COLORS.secondary} stopOpacity={0.3} />
                    <stop offset='95%' stopColor={CHART_COLORS.secondary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                <XAxis dataKey='date' stroke='#666' fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke='#666' fontSize={12} tickLine={false} axisLine={false} />
                {showTooltip && <Tooltip content={<CustomTooltip />} />}
                {showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} iconType='rect' />}
                <Area
                  type='monotone'
                  dataKey='checkouts'
                  stroke={CHART_COLORS.primary}
                  fill='url(#checkoutGradient)'
                  strokeWidth={2}
                  name='Checkouts'
                />
                <Area
                  type='monotone'
                  dataKey='checkins'
                  stroke={CHART_COLORS.secondary}
                  fill='url(#checkinGradient)'
                  strokeWidth={2}
                  name='Checkins'
                />
              </AreaChart>
            ) : (
              <LineChart data={data} margin={config.margin}>
                <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                <XAxis dataKey='date' stroke='#666' fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke='#666' fontSize={12} tickLine={false} axisLine={false} />
                {showTooltip && <Tooltip content={<CustomTooltip />} />}
                {showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} iconType='rect' />}
                <Line
                  type='monotone'
                  dataKey='checkouts'
                  stroke={CHART_COLORS.primary}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name='Checkouts'
                />
                <Line
                  type='monotone'
                  dataKey='checkins'
                  stroke={CHART_COLORS.secondary}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name='Checkins'
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
