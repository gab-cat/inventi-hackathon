'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, X, Clock, Wrench, Shield } from 'lucide-react';

interface Alert {
  type: string;
  message: string;
  severity: string;
  assetId?: string;
  assetName?: string;
}

interface AssetAlertsProps {
  alerts: Alert[];
}

export function AssetAlerts({ alerts }: AssetAlertsProps) {
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'maintenance_overdue':
      case 'maintenance_due':
        return <Wrench className="h-4 w-4" />;
      case 'warranty_expired':
      case 'warranty_expiring':
        return <Shield className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'medium':
        return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'low':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      high: 'destructive',
      medium: 'default',
      low: 'secondary',
    } as const;

    return (
      <Badge variant={variants[severity as keyof typeof variants] || 'outline'}>
        {severity}
      </Badge>
    );
  };

  const groupedAlerts = alerts.reduce((acc, alert) => {
    if (!acc[alert.type]) {
      acc[alert.type] = [];
    }
    acc[alert.type].push(alert);
    return acc;
  }, {} as Record<string, Alert[]>);

  const alertTypes = [
    { key: 'maintenance_overdue', title: 'Maintenance Overdue', icon: <Wrench className="h-5 w-5" /> },
    { key: 'maintenance_due', title: 'Maintenance Due Soon', icon: <Clock className="h-5 w-5" /> },
    { key: 'warranty_expired', title: 'Warranty Expired', icon: <Shield className="h-5 w-5" /> },
    { key: 'warranty_expiring', title: 'Warranty Expiring Soon', icon: <Shield className="h-5 w-5" /> },
  ];

  if (alerts.length === 0) {
    return null;
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          Asset Alerts
        </CardTitle>
        <CardDescription className="text-orange-700">
          {alerts.length} alert{alerts.length !== 1 ? 's' : ''} requiring attention
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alertTypes.map((alertType) => {
          const typeAlerts = groupedAlerts[alertType.key];
          if (!typeAlerts || typeAlerts.length === 0) return null;

          return (
            <div key={alertType.key} className="space-y-2">
              <div className="flex items-center gap-2">
                {alertType.icon}
                <h4 className="font-medium text-orange-800">
                  {alertType.title} ({typeAlerts.length})
                </h4>
              </div>
              
              <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                {typeAlerts.slice(0, 6).map((alert, index) => (
                  <div 
                    key={index} 
                    className={`p-3 rounded-lg border ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{alert.message}</p>
                        {alert.assetName && (
                          <p className="text-xs opacity-75 mt-1">
                            Asset: {alert.assetName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {getSeverityBadge(alert.severity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {typeAlerts.length > 6 && (
                <p className="text-sm text-orange-700">
                  +{typeAlerts.length - 6} more {alertType.title.toLowerCase()}
                </p>
              )}
            </div>
          );
        })}

        <div className="pt-2 border-t border-orange-200">
          <Button variant="outline" size="sm" className="w-full">
            View All Alerts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
