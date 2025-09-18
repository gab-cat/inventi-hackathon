import { Id } from '@convex/_generated/dataModel';

// Chart Data Types
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: unknown;
}

export interface TimeSeriesDataPoint {
  date: string;
  value: number;
  [key: string]: unknown;
}

export interface UtilizationDataPoint {
  date: string;
  checkouts: number;
  checkins: number;
  netChange: number;
  utilizationRate: number;
}

export interface ConditionDistribution {
  condition: 'excellent' | 'good' | 'fair' | 'poor' | 'broken';
  count: number;
  percentage: number;
  color: string;
}

export interface CategoryDistribution {
  category: 'tool' | 'equipment' | 'material' | 'furniture' | 'appliance';
  count: number;
  percentage: number;
  totalValue: number;
  averageValue: number;
}

export interface FinancialTrend {
  date: string;
  purchaseValue: number;
  currentValue: number;
  depreciation: number;
  maintenanceCost: number;
}

export interface LocationDistribution {
  location: string;
  count: number;
  percentage: number;
  totalValue: number;
}

// Export Types
export interface ExportFilters {
  categories?: string[];
  statuses?: string[];
  conditions?: string[];
  locations?: string[];
  dateFrom?: string;
  dateTo?: string;
  valueRange?: {
    min?: number;
    max?: number;
  };
  assignedUsers?: string[];
  maintenanceDue?: boolean;
  warrantyExpiring?: boolean;
}

export interface ExportOptions {
  format: 'csv' | 'excel' | 'pdf';
  includeCharts?: boolean;
  includeImages?: boolean;
  template?: 'inventory' | 'maintenance' | 'financial' | 'utilization' | 'custom';
  customFields?: string[];
}

export interface ExportData {
  assets: AssetExportData[];
  metadata: {
    generatedAt: string;
    totalCount: number;
    filters: ExportFilters;
    generatedBy: string;
  };
}

export interface AssetExportData {
  _id: string;
  assetTag: string;
  name: string;
  description: string;
  category: string;
  subcategory?: string;
  brand?: string;
  model?: string;
  serialNumber?: string;
  condition: string;
  status: string;
  location: string;
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  depreciation?: number;
  assignedTo?: string;
  assignedUser?: string;
  assignedAt?: string;
  maintenanceDue: boolean;
  warrantyExpiring: boolean;
  daysSinceLastMaintenance?: number;
  daysUntilNextMaintenance?: number;
  daysUntilWarrantyExpiry?: number;
  createdAt: string;
  updatedAt: string;
}

// Reports Data Types
export interface ReportsData {
  utilization: {
    trend: UtilizationDataPoint[];
    rate: number;
    totalCheckouts: number;
    totalCheckins: number;
  };
  condition: {
    distribution: ConditionDistribution[];
    totalAssets: number;
    averageCondition: number;
  };
  category: {
    distribution: CategoryDistribution[];
    totalValue: number;
    totalCount: number;
  };
  financial: {
    totalPurchaseValue: number;
    totalCurrentValue: number;
    totalDepreciation: number;
    depreciationRate: number;
    maintenanceCost: number;
    trend: FinancialTrend[];
  };
  location: {
    distribution: LocationDistribution[];
    totalLocations: number;
  };
  maintenance: {
    due: number;
    overdue: number;
    completed: number;
    totalCost: number;
    averageTime: number;
  };
  kpis: {
    totalAssets: number;
    availableAssets: number;
    checkedOutAssets: number;
    maintenanceAssets: number;
    retiredAssets: number;
    lostAssets: number;
    utilizationRate: number;
    maintenanceEfficiency: number;
    costPerAsset: number;
  };
}

// Chart Component Props
export interface ChartProps {
  data: Array<Record<string, unknown>>;
  width?: number;
  height?: number;
  className?: string;
  showTooltip?: boolean;
  showLegend?: boolean;
  colors?: string[];
}

export interface UtilizationChartProps extends ChartProps {
  data: UtilizationDataPoint[];
  showNetChange?: boolean;
}

export interface ConditionChartProps extends ChartProps {
  data: ConditionDistribution[];
}

export interface CategoryChartProps extends ChartProps {
  data: CategoryDistribution[];
  showValue?: boolean;
}

export interface FinancialChartProps extends ChartProps {
  data: FinancialTrend[];
  showMaintenance?: boolean;
}

// Filter Types
export interface DateRange {
  from: Date;
  to: Date;
}

export interface ReportsFilters {
  propertyId?: Id<'properties'>;
  dateRange?: DateRange;
  categories?: string[];
  statuses?: string[];
  conditions?: string[];
  locations?: string[];
  showInactive?: boolean;
}

// Hook Types
export interface UseReportsDataReturn {
  data: ReportsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export interface UseExportFiltersReturn {
  filters: ExportFilters;
  setFilters: (filters: ExportFilters) => void;
  resetFilters: () => void;
  exportData: () => Promise<void>;
  loading: boolean;
}
