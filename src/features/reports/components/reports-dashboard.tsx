'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  BarChart3,
  Download,
  RefreshCw,
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
  MapPin,
  Wrench,
} from 'lucide-react';
import { AssetUtilizationChart } from './charts/asset-utilization-chart';
import { ConditionDistributionChart } from './charts/condition-distribution-chart';
import { FinancialTrendsChart } from './charts/financial-trends-chart';
import { ExportFiltersComponent } from './export/export-filters';
import { ExportFilters, ExportOptions } from '../types';
import { transformUtilizationData, transformConditionData, transformCategoryData } from '../lib/chart-utils';
import {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  transformAssetDataForExport,
  applyExportFilters,
  generateExportFilename,
} from '../lib/export-utils';

interface ReportsDashboardProps {
  dashboardData: Record<string, unknown>;
  assets: Array<Record<string, unknown>>;
  propertyName: string;
  onRefresh?: () => void;
  loading?: boolean;
}

export function ReportsDashboard({
  dashboardData,
  assets,
  propertyName,
  onRefresh,
  loading = false,
}: ReportsDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [exportFilters, setExportFilters] = useState<ExportFilters>({});
  const [exportLoading, setExportLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Transform data for charts
  const utilizationData = dashboardData?.utilizationTrend
    ? transformUtilizationData(dashboardData.utilizationTrend)
    : [];

  const conditionData = dashboardData ? transformConditionData(dashboardData) : [];

  const categoryData = dashboardData ? transformCategoryData(dashboardData) : [];

  // Get unique values for filters
  const availableCategories = [...new Set(assets.map(asset => asset.category))];
  const availableStatuses = [...new Set(assets.map(asset => asset.status))];
  const availableConditions = [...new Set(assets.map(asset => asset.condition))];
  const availableLocations = [...new Set(assets.map(asset => asset.location))];

  const handleExport = async (options: ExportOptions) => {
    setExportLoading(true);
    try {
      // Apply filters to assets
      const filteredAssets = applyExportFilters(assets, exportFilters);
      const exportData = transformAssetDataForExport(filteredAssets);

      const filename = generateExportFilename(options.format, 'assets-report');

      switch (options.format) {
        case 'csv':
          exportToCSV(exportData, filename);
          break;
        case 'excel':
          exportToExcel(exportData, filename, options.includeCharts);
          break;
        case 'pdf':
          await exportToPDF(exportData, filename, options.includeCharts);
          break;
      }
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setExportLoading(false);
    }
  };

  const handleRefresh = () => {
    setLastUpdated(new Date());
    onRefresh?.();
  };

  // KPI Cards Data
  const kpis = [
    {
      title: 'Total Assets',
      value: dashboardData?.totalAssets || 0,
      icon: Package,
      color: 'blue',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Available Assets',
      value: dashboardData?.availableAssets || 0,
      icon: Package,
      color: 'green',
      change: '+5%',
      changeType: 'positive' as const,
    },
    {
      title: 'Total Value',
      value: dashboardData?.totalCurrentValue || 0,
      icon: DollarSign,
      color: 'purple',
      change: '+8%',
      changeType: 'positive' as const,
      format: 'currency',
    },
    {
      title: 'Maintenance Due',
      value: dashboardData?.maintenanceDue || 0,
      icon: Wrench,
      color: 'orange',
      change: '-2%',
      changeType: 'negative' as const,
    },
  ];

  if (loading) {
    return (
      <div className='space-y-6'>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className='p-6'>
                <div className='animate-pulse'>
                  <div className='h-4 bg-gray-200 rounded w-3/4 mb-2'></div>
                  <div className='h-8 bg-gray-200 rounded w-1/2'></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className='p-6'>
                <div className='animate-pulse'>
                  <div className='h-64 bg-gray-200 rounded'></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-2xl font-bold tracking-tight'>Reports & Analytics</h2>
          <p className='text-muted-foreground'>Comprehensive insights for {propertyName}</p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant='outline' className='flex items-center gap-1'>
            <Calendar className='h-3 w-3' />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </Badge>
          <Button variant='outline' size='sm' onClick={handleRefresh}>
            <RefreshCw className='h-4 w-4 mr-1' />
            Refresh
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>{kpi.title}</p>
                  <p className='text-2xl font-bold'>
                    {kpi.format === 'currency'
                      ? new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        }).format(kpi.value)
                      : kpi.value.toLocaleString()}
                  </p>
                  <div className='flex items-center mt-1'>
                    <TrendingUp
                      className={`h-3 w-3 mr-1 ${kpi.changeType === 'positive' ? 'text-green-500' : 'text-red-500'}`}
                    />
                    <span className={`text-xs ${kpi.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                      {kpi.change}
                    </span>
                  </div>
                </div>
                <div className={`p-2 rounded-lg bg-${kpi.color}-100`}>
                  <kpi.icon className={`h-5 w-5 text-${kpi.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='grid w-full grid-cols-3'>
          <TabsTrigger value='overview' className='flex items-center gap-2'>
            <BarChart3 className='h-4 w-4' />
            Overview
          </TabsTrigger>
          <TabsTrigger value='analytics' className='flex items-center gap-2'>
            <TrendingUp className='h-4 w-4' />
            Analytics
          </TabsTrigger>
          <TabsTrigger value='export' className='flex items-center gap-2'>
            <Download className='h-4 w-4' />
            Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <AssetUtilizationChart data={utilizationData} />
            <ConditionDistributionChart data={conditionData} />
          </div>
          <div className='grid grid-cols-1 gap-6'>
            <FinancialTrendsChart data={[]} />
          </div>
        </TabsContent>

        <TabsContent value='analytics' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <MapPin className='h-5 w-5' />
                  Location Distribution
                </CardTitle>
                <CardDescription>Asset distribution across different locations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {dashboardData?.locationDistribution?.map((location: Record<string, unknown>, index: number) => (
                    <div key={index} className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>{location.location}</span>
                      <div className='flex items-center gap-2'>
                        <div className='w-20 bg-gray-200 rounded-full h-2'>
                          <div className='bg-blue-500 h-2 rounded-full' style={{ width: `${location.percentage}%` }} />
                        </div>
                        <span className='text-sm text-gray-600 w-12 text-right'>{location.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className='flex items-center gap-2'>
                  <Package className='h-5 w-5' />
                  Category Breakdown
                </CardTitle>
                <CardDescription>Asset distribution by category</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  {categoryData.map((category, index) => (
                    <div key={index} className='flex items-center justify-between'>
                      <span className='text-sm font-medium capitalize'>{category.category}</span>
                      <div className='flex items-center gap-2'>
                        <div className='w-20 bg-gray-200 rounded-full h-2'>
                          <div className='bg-green-500 h-2 rounded-full' style={{ width: `${category.percentage}%` }} />
                        </div>
                        <span className='text-sm text-gray-600 w-12 text-right'>{category.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

         <TabsContent value='export' className='space-y-6'>
           <ExportFiltersComponent
             filters={exportFilters}
             onFiltersChange={setExportFilters}
             onExport={handleExport}
             availableCategories={availableCategories}
             availableStatuses={availableStatuses}
             availableConditions={availableConditions}
             availableLocations={availableLocations}
             assets={assets}
             loading={exportLoading}
           />
         </TabsContent>
      </Tabs>
    </div>
  );
}
