import { format } from 'date-fns';
import { ConditionDistribution, CategoryDistribution, UtilizationDataPoint, LocationDistribution } from '../types';

// Chart Colors
export const CHART_COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#f59e0b',
  danger: '#ef4444',
  warning: '#f97316',
  info: '#06b6d4',
  success: '#22c55e',
  purple: '#8b5cf6',
  pink: '#ec4899',
  gray: '#6b7280',
};

export const CONDITION_COLORS = {
  excellent: CHART_COLORS.success,
  good: CHART_COLORS.primary,
  fair: CHART_COLORS.warning,
  poor: CHART_COLORS.danger,
  broken: CHART_COLORS.gray,
};

export const CATEGORY_COLORS = {
  tool: CHART_COLORS.primary,
  equipment: CHART_COLORS.secondary,
  material: CHART_COLORS.accent,
  furniture: CHART_COLORS.purple,
  appliance: CHART_COLORS.pink,
};

// Date formatting utilities
export const formatChartDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd');
};

export const formatTooltipDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MMM dd, yyyy');
};

// Data transformation utilities
export const transformUtilizationData = (data: Array<Record<string, unknown>>): UtilizationDataPoint[] => {
  return data.map(item => ({
    date: formatChartDate(item.date),
    checkouts: item.checkouts || 0,
    checkins: item.checkins || 0,
    netChange: item.netChange || 0,
    utilizationRate: item.utilizationRate || 0,
  }));
};

export const transformConditionData = (data: Record<string, unknown>): ConditionDistribution[] => {
  const conditions = ['excellent', 'good', 'fair', 'poor', 'broken'] as const;
  const total = conditions.reduce((sum, condition) => sum + (data[`${condition}Condition`] || 0), 0);

  return conditions
    .map(condition => {
      const count = data[`${condition}Condition`] || 0;
      return {
        condition,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
        color: CONDITION_COLORS[condition],
      };
    })
    .filter(item => item.count > 0);
};

export const transformCategoryData = (data: Record<string, unknown>): CategoryDistribution[] => {
  const categories = ['tool', 'equipment', 'material', 'furniture', 'appliance'] as const;
  const totalCount = categories.reduce((sum, category) => sum + (data[category] || 0), 0);
  const totalValue = data.totalPurchaseValue || 0;

  return categories
    .map(category => {
      const count = data[category] || 0;
      const categoryValue = (count / totalCount) * totalValue;
      return {
        category,
        count,
        percentage: totalCount > 0 ? Math.round((count / totalCount) * 100) : 0,
        totalValue: categoryValue,
        averageValue: count > 0 ? categoryValue / count : 0,
      };
    })
    .filter(item => item.count > 0);
};

export const transformLocationData = (data: Array<Record<string, unknown>>): LocationDistribution[] => {
  return data.map(item => ({
    location: item.location,
    count: item.count,
    percentage: item.percentage,
    totalValue: item.totalValue || 0,
  }));
};

// Chart configuration utilities
export const getChartConfig = (type: 'line' | 'bar' | 'pie' | 'area') => {
  const baseConfig = {
    margin: { top: 20, right: 30, left: 20, bottom: 5 },
    colors: Object.values(CHART_COLORS),
  };

  switch (type) {
    case 'line':
      return {
        ...baseConfig,
        strokeWidth: 2,
        dot: { r: 4 },
        activeDot: { r: 6 },
      };
    case 'bar':
      return {
        ...baseConfig,
        barSize: 60,
        radius: [4, 4, 0, 0],
      };
    case 'pie':
      return {
        ...baseConfig,
        innerRadius: 60,
        outerRadius: 120,
        paddingAngle: 2,
      };
    case 'area':
      return {
        ...baseConfig,
        strokeWidth: 2,
        fillOpacity: 0.3,
      };
    default:
      return baseConfig;
  }
};

// Tooltip formatters
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

export const formatPercentage = (value: number): string => {
  return `${Math.round(value)}%`;
};

// Responsive chart dimensions
export const getChartDimensions = (containerWidth: number, type: 'line' | 'bar' | 'pie' | 'area') => {
  const baseHeight = 300;
  const baseWidth = Math.min(containerWidth - 40, 800);

  switch (type) {
    case 'pie':
      return {
        width: Math.min(baseWidth, 400),
        height: Math.min(baseWidth, 400),
      };
    case 'line':
    case 'area':
      return {
        width: baseWidth,
        height: baseHeight,
      };
    case 'bar':
      return {
        width: baseWidth,
        height: baseHeight,
      };
    default:
      return {
        width: baseWidth,
        height: baseHeight,
      };
  }
};

// Data aggregation utilities
export const aggregateDataByPeriod = (
  data: Array<Record<string, unknown>>,
  period: 'day' | 'week' | 'month' = 'day'
): Array<Record<string, unknown>> => {
  const grouped = data.reduce((acc, item) => {
    let key: string;
    const date = new Date(item.date);

    switch (period) {
      case 'week':
        key = format(date, 'yyyy-ww');
        break;
      case 'month':
        key = format(date, 'yyyy-MM');
        break;
      default:
        key = format(date, 'yyyy-MM-dd');
    }

    if (!acc[key]) {
      acc[key] = {
        date: key,
        checkouts: 0,
        checkins: 0,
        netChange: 0,
        count: 0,
      };
    }

    acc[key].checkouts += item.checkouts || 0;
    acc[key].checkins += item.checkins || 0;
    acc[key].netChange += item.netChange || 0;
    acc[key].count += 1;

    return acc;
  }, {});

  return Object.values(grouped).map((item: Record<string, unknown>) => ({
    ...item,
    utilizationRate: item.count > 0 ? (item.checkouts / item.count) * 100 : 0,
  }));
};

// Chart animation configurations
export const getAnimationConfig = (type: 'fade' | 'slide' | 'scale' = 'fade') => {
  switch (type) {
    case 'fade':
      return {
        duration: 800,
        easing: 'ease-in-out',
      };
    case 'slide':
      return {
        duration: 600,
        easing: 'ease-out',
      };
    case 'scale':
      return {
        duration: 400,
        easing: 'ease-in',
      };
    default:
      return {
        duration: 600,
        easing: 'ease-in-out',
      };
  }
};
