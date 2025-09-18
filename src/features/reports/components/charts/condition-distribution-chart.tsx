'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ConditionChartProps } from '../../types';
import { formatNumber, formatPercentage, getChartConfig } from '../../lib/chart-utils';
import { Shield, AlertTriangle, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: {
      condition: string;
      count: number;
      percentage: number;
    };
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className='bg-white p-3 border border-gray-200 rounded-lg shadow-lg'>
        <p className='font-medium text-gray-900 capitalize'>{data.condition} Condition</p>
        <p className='text-sm text-gray-600'>Count: {formatNumber(data.count)}</p>
        <p className='text-sm text-gray-600'>Percentage: {formatPercentage(data.percentage)}</p>
      </div>
    );
  }
  return null;
};

const getConditionIcon = (condition: string) => {
  switch (condition) {
    case 'excellent':
      return <CheckCircle className='h-4 w-4' />;
    case 'good':
      return <Shield className='h-4 w-4' />;
    case 'fair':
      return <AlertCircle className='h-4 w-4' />;
    case 'poor':
      return <AlertTriangle className='h-4 w-4' />;
    case 'broken':
      return <XCircle className='h-4 w-4' />;
    default:
      return <Shield className='h-4 w-4' />;
  }
};

const getConditionLabel = (condition: string) => {
  switch (condition) {
    case 'excellent':
      return 'Excellent';
    case 'good':
      return 'Good';
    case 'fair':
      return 'Fair';
    case 'poor':
      return 'Poor';
    case 'broken':
      return 'Broken';
    default:
      return condition;
  }
};

export function ConditionDistributionChart({
  data,
  className = '',
  showTooltip = true,
  showLegend = true,
}: ConditionChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5' />
            Asset Condition Distribution
          </CardTitle>
          <CardDescription>Overview of asset conditions across your inventory</CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex items-center justify-center h-64 text-gray-500'>No condition data available</div>
        </CardContent>
      </Card>
    );
  }

  const config = getChartConfig('pie');
  const totalAssets = data.reduce((sum, item) => sum + item.count, 0);
  const excellentCount = data.find(item => item.condition === 'excellent')?.count || 0;
  const goodCount = data.find(item => item.condition === 'good')?.count || 0;
  const poorCount = data.find(item => item.condition === 'poor')?.count || 0;
  const brokenCount = data.find(item => item.condition === 'broken')?.count || 0;

  const healthyAssets = excellentCount + goodCount;
  const unhealthyAssets = poorCount + brokenCount;
  const healthScore = totalAssets > 0 ? Math.round((healthyAssets / totalAssets) * 100) : 0;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Shield className='h-5 w-5' />
          Asset Condition Distribution
        </CardTitle>
        <CardDescription>Overview of asset conditions across your inventory</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Health Score */}
        <div className='mb-6'>
          <div className='flex items-center justify-between mb-2'>
            <span className='text-sm font-medium text-gray-700'>Overall Health Score</span>
            <span
              className={`text-2xl font-bold ${
                healthScore >= 80 ? 'text-green-600' : healthScore >= 60 ? 'text-yellow-600' : 'text-red-600'
              }`}
            >
              {healthScore}%
            </span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                healthScore >= 80 ? 'bg-green-500' : healthScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${healthScore}%` }}
            />
          </div>
        </div>

        {/* Condition Summary Cards */}
        <div className='grid grid-cols-2 md:grid-cols-5 gap-3 mb-6'>
          {data.map(item => (
            <div
              key={item.condition}
              className='p-3 rounded-lg border'
              style={{ borderColor: item.color, backgroundColor: `${item.color}10` }}
            >
              <div className='flex items-center gap-2 mb-1'>
                {getConditionIcon(item.condition)}
                <span className='text-sm font-medium capitalize'>{getConditionLabel(item.condition)}</span>
              </div>
              <p className='text-xl font-bold' style={{ color: item.color }}>
                {formatNumber(item.count)}
              </p>
              <p className='text-xs text-gray-600'>{formatPercentage(item.percentage)}</p>
            </div>
          ))}
        </div>

        {/* Pie Chart */}
        <div className='h-80'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={data}
                cx='50%'
                cy='50%'
                innerRadius={config.innerRadius}
                outerRadius={config.outerRadius}
                paddingAngle={config.paddingAngle}
                dataKey='count'
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && (
                <Legend
                  wrapperStyle={{ paddingTop: '20px' }}
                  iconType='circle'
                  formatter={(value, entry) => (
                    <span className='text-sm'>
                      {getConditionLabel(value)} ({formatNumber(entry.payload.count)})
                    </span>
                  )}
                />
              )}
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        <div className='mt-6 p-4 bg-gray-50 rounded-lg'>
          <h4 className='font-medium text-gray-900 mb-2'>Key Insights</h4>
          <ul className='text-sm text-gray-600 space-y-1'>
            {healthScore >= 80 && (
              <li>• Excellent asset health! {formatPercentage(healthScore)} of assets are in good condition.</li>
            )}
            {healthScore < 80 && healthScore >= 60 && (
              <li>• Asset health is moderate. Consider maintenance for {formatNumber(unhealthyAssets)} assets.</li>
            )}
            {healthScore < 60 && (
              <li>
                • Asset health needs attention. {formatNumber(unhealthyAssets)} assets require immediate attention.
              </li>
            )}
            {brokenCount > 0 && <li>• {formatNumber(brokenCount)} broken assets need replacement or repair.</li>}
            {poorCount > 0 && (
              <li>• {formatNumber(poorCount)} assets in poor condition should be prioritized for maintenance.</li>
            )}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
