'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { FinancialChartProps } from '../../types';
import { CHART_COLORS, formatTooltipDate, formatCurrency, formatNumber, getChartConfig } from '../../lib/chart-utils';
import { DollarSign, TrendingUp, TrendingDown, Wrench } from 'lucide-react';

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
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function FinancialTrendsChart({
  data,
  showMaintenance = true,
  className = '',
  showTooltip = true,
  showLegend = true,
}: FinancialChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <DollarSign className='h-5 w-5' />
            Financial Trends
          </CardTitle>
          <CardDescription>Track asset values, depreciation, and maintenance costs over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center h-64 text-gray-500'>No financial data available</div>
        </CardContent>
      </Card>
    );
  }

  const config = getChartConfig('area');

  // Calculate totals and trends
  const totalPurchaseValue = data.reduce((sum, item) => sum + item.purchaseValue, 0);
  const totalCurrentValue = data.reduce((sum, item) => sum + item.currentValue, 0);
  const totalDepreciation = data.reduce((sum, item) => sum + item.depreciation, 0);
  const totalMaintenanceCost = data.reduce((sum, item) => sum + item.maintenanceCost, 0);

  const depreciationRate = totalPurchaseValue > 0 ? Math.round((totalDepreciation / totalPurchaseValue) * 100) : 0;

  const valueRetention = totalPurchaseValue > 0 ? Math.round((totalCurrentValue / totalPurchaseValue) * 100) : 0;

  // Calculate trend direction
  const firstValue = data[0]?.currentValue || 0;
  const lastValue = data[data.length - 1]?.currentValue || 0;
  const valueTrend = lastValue > firstValue ? 'up' : 'down';
  const trendPercentage = firstValue > 0 ? Math.round(((lastValue - firstValue) / firstValue) * 100) : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <DollarSign className='h-5 w-5' />
          Financial Trends
        </CardTitle>
        <CardDescription>Track asset values, depreciation, and maintenance costs over time</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Financial KPIs */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
          <div className='bg-blue-50 p-3 rounded-lg'>
            <div className='flex items-center gap-2'>
              <DollarSign className='h-4 w-4 text-blue-600' />
              <span className='text-sm font-medium text-blue-900'>Total Purchase Value</span>
            </div>
            <p className='text-xl font-bold text-blue-600'>{formatCurrency(totalPurchaseValue)}</p>
          </div>
          <div className='bg-green-50 p-3 rounded-lg'>
            <div className='flex items-center gap-2'>
              <DollarSign className='h-4 w-4 text-green-600' />
              <span className='text-sm font-medium text-green-900'>Current Value</span>
            </div>
            <p className='text-xl font-bold text-green-600'>{formatCurrency(totalCurrentValue)}</p>
          </div>
          <div className='bg-red-50 p-3 rounded-lg'>
            <div className='flex items-center gap-2'>
              <TrendingDown className='h-4 w-4 text-red-600' />
              <span className='text-sm font-medium text-red-900'>Total Depreciation</span>
            </div>
            <p className='text-xl font-bold text-red-600'>{formatCurrency(totalDepreciation)}</p>
          </div>
          <div className='bg-orange-50 p-3 rounded-lg'>
            <div className='flex items-center gap-2'>
              <Wrench className='h-4 w-4 text-orange-600' />
              <span className='text-sm font-medium text-orange-900'>Maintenance Cost</span>
            </div>
            <p className='text-xl font-bold text-orange-600'>{formatCurrency(totalMaintenanceCost)}</p>
          </div>
        </div>

        {/* Trend Indicators */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-6'>
          <div className={`p-3 rounded-lg ${valueTrend === 'up' ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className='flex items-center gap-2'>
              {valueTrend === 'up' ? (
                <TrendingUp className='h-4 w-4 text-green-600' />
              ) : (
                <TrendingDown className='h-4 w-4 text-red-600' />
              )}
              <span className={`text-sm font-medium ${valueTrend === 'up' ? 'text-green-900' : 'text-red-900'}`}>
                Value Trend
              </span>
            </div>
            <p className={`text-lg font-bold ${valueTrend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trendPercentage >= 0 ? '+' : ''}
              {trendPercentage}%
            </p>
          </div>
          <div className='bg-purple-50 p-3 rounded-lg'>
            <div className='flex items-center gap-2'>
              <DollarSign className='h-4 w-4 text-purple-600' />
              <span className='text-sm font-medium text-purple-900'>Depreciation Rate</span>
            </div>
            <p className='text-lg font-bold text-purple-600'>{depreciationRate}%</p>
          </div>
          <div className='bg-indigo-50 p-3 rounded-lg'>
            <div className='flex items-center gap-2'>
              <TrendingUp className='h-4 w-4 text-indigo-600' />
              <span className='text-sm font-medium text-indigo-900'>Value Retention</span>
            </div>
            <p className='text-lg font-bold text-indigo-600'>{valueRetention}%</p>
          </div>
        </div>

        {/* Chart */}
        <div className='h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            <AreaChart data={data} margin={config.margin}>
              <defs>
                <linearGradient id='purchaseGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
                  <stop offset='95%' stopColor={CHART_COLORS.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id='currentGradient' x1='0' y1='0' x2='0' y2='1'>
                  <stop offset='5%' stopColor={CHART_COLORS.secondary} stopOpacity={0.3} />
                  <stop offset='95%' stopColor={CHART_COLORS.secondary} stopOpacity={0} />
                </linearGradient>
                {showMaintenance && (
                  <linearGradient id='maintenanceGradient' x1='0' y1='0' x2='0' y2='1'>
                    <stop offset='5%' stopColor={CHART_COLORS.accent} stopOpacity={0.3} />
                    <stop offset='95%' stopColor={CHART_COLORS.accent} stopOpacity={0} />
                  </linearGradient>
                )}
              </defs>
              <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
              <XAxis dataKey='date' stroke='#666' fontSize={12} tickLine={false} axisLine={false} />
              <YAxis
                stroke='#666'
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={value => `$${formatNumber(value / 1000)}k`}
              />
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && <Legend wrapperStyle={{ paddingTop: '20px' }} iconType='rect' />}
              <Area
                type='monotone'
                dataKey='purchaseValue'
                stroke={CHART_COLORS.primary}
                fill='url(#purchaseGradient)'
                strokeWidth={2}
                name='Purchase Value'
              />
              <Area
                type='monotone'
                dataKey='currentValue'
                stroke={CHART_COLORS.secondary}
                fill='url(#currentGradient)'
                strokeWidth={2}
                name='Current Value'
              />
              {showMaintenance && (
                <Area
                  type='monotone'
                  dataKey='maintenanceCost'
                  stroke={CHART_COLORS.accent}
                  fill='url(#maintenanceGradient)'
                  strokeWidth={2}
                  name='Maintenance Cost'
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Financial Insights */}
        <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
          <h4 className='font-medium text-gray-900 mb-2'>Financial Insights</h4>
          <ul className='text-sm text-gray-600 space-y-1'>
            {depreciationRate < 20 && (
              <li>• Low depreciation rate ({depreciationRate}%) indicates good asset management.</li>
            )}
            {depreciationRate >= 20 && depreciationRate < 40 && (
              <li>• Moderate depreciation rate ({depreciationRate}%) - consider maintenance optimization.</li>
            )}
            {depreciationRate >= 40 && (
              <li>• High depreciation rate ({depreciationRate}%) - review asset lifecycle management.</li>
            )}
            {valueRetention > 80 && (
              <li>• Excellent value retention ({valueRetention}%) shows effective asset care.</li>
            )}
            {totalMaintenanceCost > 0 && (
              <li>• Total maintenance investment: {formatCurrency(totalMaintenanceCost)}</li>
            )}
            {trendPercentage > 0 && (
              <li>• Asset values are trending upward (+{trendPercentage}%) - good performance!</li>
            )}
            {trendPercentage < 0 && (
              <li>• Asset values declining ({trendPercentage}%) - review maintenance strategies.</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
