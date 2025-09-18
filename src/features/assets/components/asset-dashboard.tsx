'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  Wrench, 
  Trash2, 
  AlertTriangle,
  DollarSign,
  TrendingDown,
  TrendingUp,
  MapPin,
  Calendar,
  Users
} from 'lucide-react';

interface AssetDashboardProps {
  data: {
    totalAssets: number;
    availableAssets: number;
    checkedOutAssets: number;
    maintenanceAssets: number;
    retiredAssets: number;
    lostAssets: number;
    excellentCondition: number;
    goodCondition: number;
    fairCondition: number;
    poorCondition: number;
    brokenCondition: number;
    tools: number;
    equipment: number;
    materials: number;
    furniture: number;
    appliances: number;
    totalPurchaseValue: number;
    totalCurrentValue: number;
    depreciationAmount: number;
    maintenanceDue: number;
    maintenanceOverdue: number;
    warrantyExpiring: number;
    warrantyExpired: number;
    recentCheckouts: Array<{
      _id: string;
      name: string;
      assetTag: string;
      assignedTo?: string;
      assignedAt?: number;
      assignedUser?: {
        _id: string;
        firstName: string;
        lastName: string;
      };
    }>;
    alerts: Array<{
      type: string;
      message: string;
      severity: string;
      assetId?: string;
      assetName?: string;
    }>;
    locationDistribution: Array<{
      location: string;
      count: number;
      percentage: number;
    }>;
    utilizationTrend: Array<{
      date: string;
      checkouts: number;
      checkins: number;
      netChange: number;
    }>;
  };
  propertyName: string;
}

export function AssetDashboard({ data, propertyName }: AssetDashboardProps) {
  const utilizationRate = data.totalAssets > 0 ? (data.checkedOutAssets / data.totalAssets) * 100 : 0;
  const depreciationRate = data.totalPurchaseValue > 0 ? (data.depreciationAmount / data.totalPurchaseValue) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalAssets}</div>
            <p className="text-xs text-muted-foreground">
              {propertyName}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.availableAssets}</div>
            <p className="text-xs text-muted-foreground">
              {utilizationRate.toFixed(1)}% utilization rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checked Out</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.checkedOutAssets}</div>
            <p className="text-xs text-muted-foreground">
              Currently in use
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Maintenance</CardTitle>
            <Wrench className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.maintenanceAssets}</div>
            <p className="text-xs text-muted-foreground">
              {data.maintenanceDue} due, {data.maintenanceOverdue} overdue
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.totalCurrentValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Current value of all assets
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Purchase Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.totalPurchaseValue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Original purchase cost
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Depreciation</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.depreciationAmount.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {depreciationRate.toFixed(1)}% depreciation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Condition & Category Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Asset Condition</CardTitle>
            <CardDescription>Distribution by condition</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Excellent</span>
                <Badge variant="secondary">{data.excellentCondition}</Badge>
              </div>
              <Progress value={(data.excellentCondition / data.totalAssets) * 100} className="h-2 [&>div]:bg-emerald-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Good</span>
                <Badge variant="secondary">{data.goodCondition}</Badge>
              </div>
              <Progress value={(data.goodCondition / data.totalAssets) * 100} className="h-2 [&>div]:bg-green-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Fair</span>
                <Badge variant="secondary">{data.fairCondition}</Badge>
              </div>
              <Progress value={(data.fairCondition / data.totalAssets) * 100} className="h-2 [&>div]:bg-yellow-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Poor</span>
                <Badge variant="secondary">{data.poorCondition}</Badge>
              </div>
              <Progress value={(data.poorCondition / data.totalAssets) * 100} className="h-2 [&>div]:bg-orange-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Broken</span>
                <Badge variant="destructive">{data.brokenCondition}</Badge>
              </div>
              <Progress value={(data.brokenCondition / data.totalAssets) * 100} className="h-2 [&>div]:bg-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Asset Categories</CardTitle>
            <CardDescription>Distribution by category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Tools</span>
                <Badge variant="outline">{data.tools}</Badge>
              </div>
              <Progress value={(data.tools / data.totalAssets) * 100} className="h-2 [&>div]:bg-blue-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Equipment</span>
                <Badge variant="outline">{data.equipment}</Badge>
              </div>
              <Progress value={(data.equipment / data.totalAssets) * 100} className="h-2 [&>div]:bg-indigo-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Materials</span>
                <Badge variant="outline">{data.materials}</Badge>
              </div>
              <Progress value={(data.materials / data.totalAssets) * 100} className="h-2 [&>div]:bg-purple-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Furniture</span>
                <Badge variant="outline">{data.furniture}</Badge>
              </div>
              <Progress value={(data.furniture / data.totalAssets) * 100} className="h-2 [&>div]:bg-teal-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Appliances</span>
                <Badge variant="outline">{data.appliances}</Badge>
              </div>
              <Progress value={(data.appliances / data.totalAssets) * 100} className="h-2 [&>div]:bg-cyan-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Location Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Recent Checkouts
            </CardTitle>
            <CardDescription>Latest asset assignments</CardDescription>
          </CardHeader>
          <CardContent>
            {data.recentCheckouts.length > 0 ? (
              <div className="space-y-3">
                {data.recentCheckouts.slice(0, 5).map((checkout) => (
                  <div key={checkout._id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{checkout.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {checkout.assignedUser 
                          ? `${checkout.assignedUser.firstName} ${checkout.assignedUser.lastName}`
                          : 'Unknown User'
                        }
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{checkout.assetTag}</p>
                      <p className="text-xs text-muted-foreground">
                        {checkout.assignedAt 
                          ? new Date(checkout.assignedAt).toLocaleDateString()
                          : 'Unknown Date'
                        }
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No recent checkouts</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location Distribution
            </CardTitle>
            <CardDescription>Assets by location</CardDescription>
          </CardHeader>
          <CardContent>
            {data.locationDistribution.length > 0 ? (
              <div className="space-y-3">
                {data.locationDistribution.slice(0, 5).map((location) => (
                  <div key={location.location} className="flex items-center justify-between">
                    <span className="text-sm">{location.location}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={location.percentage} className="w-20 h-2 [&>div]:bg-blue-500" />
                      <span className="text-sm font-medium w-12 text-right">
                        {location.count} ({location.percentage}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No location data</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Alerts Summary */}
      {data.alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts
            </CardTitle>
            <CardDescription>Issues requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
              {data.alerts.slice(0, 6).map((alert, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className={`h-4 w-4 mt-0.5 ${
                      alert.severity === 'high' ? 'text-red-600' :
                      alert.severity === 'medium' ? 'text-orange-600' : 'text-yellow-600'
                    }`} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <Badge 
                        variant={alert.severity === 'high' ? 'destructive' : 
                                alert.severity === 'medium' ? 'default' : 'secondary'}
                        className="mt-1"
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
