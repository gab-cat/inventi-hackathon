import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AssetExportData, ExportFilters } from '../types';

// CSV Export
export const exportToCSV = (data: AssetExportData[], filename: string = 'assets-export.csv'): void => {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers
        .map(header => {
          const value = row[header as keyof AssetExportData];
          // Escape commas and quotes in CSV
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Excel Export
export const exportToExcel = (
  data: AssetExportData[],
  filename: string = 'assets-export.xlsx',
  includeCharts: boolean = false
): void => {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  const workbook = XLSX.utils.book_new();

  // Main data sheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-size columns
  const colWidths = Object.keys(data[0]).map(key => ({
    wch: Math.max(key.length, 15),
  }));
  worksheet['!cols'] = colWidths;

  XLSX.utils.book_append_sheet(workbook, worksheet, 'Assets');

  // Summary sheet
  const summaryData = generateSummaryData(data);
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Add charts if requested
  if (includeCharts) {
    // This would require additional chart generation logic
    // For now, we'll add a placeholder
    const chartData = generateChartData(data);
    const chartSheet = XLSX.utils.json_to_sheet(chartData);
    XLSX.utils.book_append_sheet(workbook, chartSheet, 'Charts');
  }

  XLSX.writeFile(workbook, filename);
};

// PDF Export
export const exportToPDF = async (
  data: AssetExportData[],
  filename: string = 'assets-report.pdf',
  includeCharts: boolean = false,
  chartElements?: HTMLElement[]
): Promise<void> => {
  if (data.length === 0) {
    alert('No data to export');
    return;
  }

  const pdf = new jsPDF('l', 'mm', 'a4'); // Landscape orientation
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;

  let yPosition = margin;

  // Add title
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Asset Management Report', margin, yPosition);
  yPosition += 15;

  // Add generation date
  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, margin, yPosition);
  yPosition += 20;

  // Add summary statistics
  const summary = generateSummaryData(data);
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Summary Statistics', margin, yPosition);
  yPosition += 10;

  pdf.setFontSize(10);
  pdf.setFont('helvetica', 'normal');
  summary.forEach(stat => {
    pdf.text(`${stat.label}: ${stat.value}`, margin, yPosition);
    yPosition += 6;
  });
  yPosition += 10;

  // Add charts if requested and available
  if (includeCharts && chartElements && chartElements.length > 0) {
    for (const chartElement of chartElements) {
      if (yPosition > pageHeight - 100) {
        pdf.addPage();
        yPosition = margin;
      }

      try {
        const canvas = await html2canvas(chartElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
        });

        const imgData = canvas.toDataURL('image/png');
        const imgWidth = Math.min(contentWidth, 200);
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', margin, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 10;
      } catch (error) {
        console.error('Error capturing chart:', error);
      }
    }
  }

  // Add data table
  if (yPosition > pageHeight - 100) {
    pdf.addPage();
    yPosition = margin;
  }

  pdf.setFontSize(12);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Asset Details', margin, yPosition);
  yPosition += 10;

  // Create table headers
  const headers = ['Asset Tag', 'Name', 'Category', 'Status', 'Condition', 'Location', 'Value'];
  const colWidths = [25, 40, 20, 20, 20, 30, 20];
  let xPosition = margin;

  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  headers.forEach((header, index) => {
    pdf.text(header, xPosition, yPosition);
    xPosition += colWidths[index];
  });
  yPosition += 6;

  // Add table rows
  pdf.setFont('helvetica', 'normal');
  data.slice(0, 50).forEach(asset => {
    // Limit to 50 rows per page
    if (yPosition > pageHeight - 20) {
      pdf.addPage();
      yPosition = margin;
    }

    xPosition = margin;
    const rowData = [
      asset.assetTag,
      asset.name.substring(0, 25),
      asset.category,
      asset.status,
      asset.condition,
      asset.location.substring(0, 20),
      asset.currentValue ? `$${asset.currentValue}` : 'N/A',
    ];

    rowData.forEach((cell, colIndex) => {
      pdf.text(cell, xPosition, yPosition);
      xPosition += colWidths[colIndex];
    });
    yPosition += 6;
  });

  // Save the PDF
  pdf.save(filename);
};

// Data transformation utilities
export const transformAssetDataForExport = (assets: Array<Record<string, unknown>>): AssetExportData[] => {
  return assets.map(asset => ({
    _id: asset._id,
    assetTag: asset.assetTag,
    name: asset.name,
    description: asset.description || '',
    category: asset.category,
    subcategory: asset.subcategory || '',
    brand: asset.brand || '',
    model: asset.model || '',
    serialNumber: asset.serialNumber || '',
    condition: asset.condition,
    status: asset.status,
    location: asset.location,
    purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : '',
    purchasePrice: asset.purchasePrice || 0,
    currentValue: asset.currentValue || 0,
    depreciation: (asset.purchasePrice || 0) - (asset.currentValue || 0),
    assignedTo: asset.assignedTo || '',
    assignedUser: asset.assignedUser ? `${asset.assignedUser.firstName} ${asset.assignedUser.lastName}` : '',
    assignedAt: asset.assignedAt ? new Date(asset.assignedAt).toLocaleDateString() : '',
    maintenanceDue: asset.maintenanceDue || false,
    warrantyExpiring: asset.warrantyExpiring || false,
    daysSinceLastMaintenance: asset.daysSinceLastMaintenance || 0,
    daysUntilNextMaintenance: asset.daysUntilNextMaintenance || 0,
    daysUntilWarrantyExpiry: asset.daysUntilWarrantyExpiry || 0,
    createdAt: new Date(asset.createdAt).toLocaleDateString(),
    updatedAt: new Date(asset.updatedAt).toLocaleDateString(),
  }));
};

export const generateSummaryData = (data: AssetExportData[]): Array<{ label: string; value: string }> => {
  const totalAssets = data.length;
  const totalValue = data.reduce((sum, asset) => sum + (asset.currentValue || 0), 0);
  const totalDepreciation = data.reduce((sum, asset) => sum + asset.depreciation, 0);

  const statusCounts = data.reduce(
    (acc, asset) => {
      acc[asset.status] = (acc[asset.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const conditionCounts = data.reduce(
    (acc, asset) => {
      acc[asset.condition] = (acc[asset.condition] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return [
    { label: 'Total Assets', value: totalAssets.toString() },
    { label: 'Total Value', value: `$${totalValue.toLocaleString()}` },
    { label: 'Total Depreciation', value: `$${totalDepreciation.toLocaleString()}` },
    { label: 'Available Assets', value: (statusCounts.available || 0).toString() },
    { label: 'Checked Out Assets', value: (statusCounts.checked_out || 0).toString() },
    { label: 'Maintenance Assets', value: (statusCounts.maintenance || 0).toString() },
    { label: 'Excellent Condition', value: (conditionCounts.excellent || 0).toString() },
    { label: 'Good Condition', value: (conditionCounts.good || 0).toString() },
    { label: 'Fair Condition', value: (conditionCounts.fair || 0).toString() },
    { label: 'Poor Condition', value: (conditionCounts.poor || 0).toString() },
    { label: 'Broken Assets', value: (conditionCounts.broken || 0).toString() },
  ];
};

export const generateChartData = (data: AssetExportData[]): Array<Record<string, unknown>> => {
  // This would generate chart data for Excel export
  // For now, return basic aggregated data
  const categoryCounts = data.reduce(
    (acc, asset) => {
      acc[asset.category] = (acc[asset.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(categoryCounts).map(([category, count]) => ({
    Category: category,
    Count: count,
    Percentage: Math.round((count / data.length) * 100),
  }));
};

// Filter utilities
export const applyExportFilters = (
  assets: Array<Record<string, unknown>>,
  filters: ExportFilters
): Array<Record<string, unknown>> => {
  return assets.filter(asset => {
    // Category filter
    if (filters.categories && filters.categories.length > 0) {
      if (!filters.categories.includes(asset.category)) return false;
    }

    // Status filter
    if (filters.statuses && filters.statuses.length > 0) {
      if (!filters.statuses.includes(asset.status)) return false;
    }

    // Condition filter
    if (filters.conditions && filters.conditions.length > 0) {
      if (!filters.conditions.includes(asset.condition)) return false;
    }

    // Location filter
    if (filters.locations && filters.locations.length > 0) {
      if (!filters.locations.includes(asset.location)) return false;
    }

    // Date range filter
    if (filters.dateFrom || filters.dateTo) {
      const assetDate = new Date(asset.createdAt);
      if (filters.dateFrom && assetDate < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && assetDate > new Date(filters.dateTo)) return false;
    }

    // Value range filter
    if (filters.valueRange) {
      const value = asset.currentValue || 0;
      if (filters.valueRange.min && value < filters.valueRange.min) return false;
      if (filters.valueRange.max && value > filters.valueRange.max) return false;
    }

    // Maintenance due filter
    if (filters.maintenanceDue !== undefined) {
      if (asset.maintenanceDue !== filters.maintenanceDue) return false;
    }

    // Warranty expiring filter
    if (filters.warrantyExpiring !== undefined) {
      if (asset.warrantyExpiring !== filters.warrantyExpiring) return false;
    }

    return true;
  });
};

// Export filename generators
export const generateExportFilename = (
  format: 'csv' | 'excel' | 'pdf',
  template: string = 'assets',
  timestamp: boolean = true
): string => {
  const baseName = `${template}-export`;
  const dateStr = timestamp ? `-${new Date().toISOString().split('T')[0]}` : '';

  switch (format) {
    case 'csv':
      return `${baseName}${dateStr}.csv`;
    case 'excel':
      return `${baseName}${dateStr}.xlsx`;
    case 'pdf':
      return `${baseName}${dateStr}.pdf`;
    default:
      return `${baseName}${dateStr}.txt`;
  }
};
