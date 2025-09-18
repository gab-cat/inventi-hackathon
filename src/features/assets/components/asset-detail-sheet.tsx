'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { DialogTitle } from '@/components/ui/dialog';
import { Asset } from '../types';
import {
  MapPin,
  User,
  DollarSign,
  Clock,
  FileText,
  Calendar,
  Download,
  Plus,
  Paperclip,
  Tag,
  CheckCircle,
  Wrench,
  Package,
  Building,
  Hash,
  Award,
  AlertTriangle,
  Shield,
} from 'lucide-react';

interface AssetDetailSheetProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (asset: Asset) => void;
  onCheckOut?: (asset: Asset) => void;
  onCheckIn?: (asset: Asset) => void;
  onScheduleMaintenance?: (asset: Asset) => void;
}

export function AssetDetailSheet({
  asset,
  isOpen,
  onClose,
  onEdit,
  onCheckOut,
  onCheckIn,
  onScheduleMaintenance,
}: AssetDetailSheetProps) {
  if (!asset) return null;

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = (name?: string) => {
    if (!name) return 'bg-gray-500';

    const colors = [
      'bg-red-500',
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
      'bg-orange-500',
      'bg-cyan-500',
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return 'Not set';
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available':
        return <CheckCircle className='h-4 w-4 text-green-600' />;
      case 'checked_out':
        return <Clock className='h-4 w-4 text-blue-600' />;
      case 'maintenance':
        return <Wrench className='h-4 w-4 text-orange-600' />;
      case 'retired':
        return <Package className='h-4 w-4 text-gray-600' />;
      case 'lost':
        return <AlertTriangle className='h-4 w-4 text-red-600' />;
      default:
        return <Clock className='h-4 w-4 text-gray-600' />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      available: 'default',
      checked_out: 'secondary',
      maintenance: 'destructive',
      retired: 'outline',
      lost: 'destructive',
    } as const;

    return <Badge variant={variants[status as keyof typeof variants] || 'outline'}>{status.replace('_', ' ')}</Badge>;
  };

  const getConditionBadge = (condition: string) => {
    const variants = {
      excellent: 'default',
      good: 'secondary',
      fair: 'outline',
      poor: 'destructive',
      broken: 'destructive',
    } as const;

    return <Badge variant={variants[condition as keyof typeof variants] || 'outline'}>{condition}</Badge>;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='px-0 overflow-y-auto'>
        {/* Hidden DialogTitle for accessibility */}
        <DialogTitle className='sr-only'>{asset.name}</DialogTitle>

        {/* Header with actions */}
        <div className='flex items-center justify-between px-6 py-4 border-b'>
          <div className='flex items-center gap-2'>
            <span className='text-sm text-muted-foreground'>Asset / {asset.status}</span>
          </div>
          {onEdit && (
            <Button variant='outline' size='sm' onClick={() => onEdit(asset)}>
              <FileText className='h-4 w-4 mr-1' />
              Edit
            </Button>
          )}
        </div>

        <div className='px-6 pb-6 space-y-6'>
          {/* Title */}
          <div>
            <h1 className='text-2xl font-bold text-foreground mb-2'>{asset.name}</h1>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
              <Hash className='h-3 w-3' />
              {asset.assetTag}
            </div>
          </div>

          {/* Status */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <CheckCircle className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium text-muted-foreground'>Status</span>
            </div>
            <div className='flex items-center gap-3'>
              <div className='flex items-center gap-2'>
                {getStatusIcon(asset.status)}
                {getStatusBadge(asset.status)}
              </div>
            </div>
          </div>

          {/* Condition */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <Award className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium text-muted-foreground'>Condition</span>
            </div>
            <div className='flex items-center gap-3'>{getConditionBadge(asset.condition)}</div>
          </div>

          {/* Assigned User */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <User className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium text-muted-foreground'>Assigned To</span>
            </div>
            <div className='flex items-center gap-3'>
              {asset.assignedUser ? (
                <div className='flex items-center gap-3'>
                  <Avatar className='w-8 h-8'>
                    <AvatarFallback className={`text-xs text-white ${getRandomColor(asset.assignedUser.firstName)}`}>
                      {getInitials(`${asset.assignedUser.firstName} ${asset.assignedUser.lastName}`)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className='text-sm font-medium text-foreground'>
                      {asset.assignedUser.firstName} {asset.assignedUser.lastName}
                    </span>
                    <div className='text-xs text-muted-foreground'>{asset.assignedUser.email}</div>
                  </div>
                </div>
              ) : (
                <div className='flex items-center gap-3'>
                  <div className='w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center'>
                    <span className='text-xs text-gray-500'>?</span>
                  </div>
                  <span className='text-sm text-muted-foreground'>Unassigned</span>
                </div>
              )}
            </div>
          </div>

          {/* Category and Tags */}
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <Tag className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium text-muted-foreground'>Category</span>
            </div>
            <div className='flex flex-wrap gap-2'>
              <Badge variant='secondary' className='flex items-center gap-1'>
                <div className='w-2 h-2 rounded-full bg-blue-500'></div>
                {asset.category}
              </Badge>
              {asset.subcategory && <Badge variant='outline'>{asset.subcategory}</Badge>}
            </div>
          </div>

          {/* Description */}
          <div className='space-y-3'>
            <div className='flex items-center gap-2'>
              <FileText className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm font-medium text-muted-foreground'>Description</span>
            </div>
            <div className='bg-sidebar rounded-lg p-4 max-h-32 overflow-y-auto'>
              <p className='text-sm text-foreground leading-relaxed'>{asset.description}</p>
            </div>
          </div>

          {/* Asset Details */}
          <div className='space-y-4 pt-4 border-t'>
            {/* Brand and Model */}
            {(asset.brand || asset.model) && (
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <Package className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm font-medium text-muted-foreground'>Brand & Model</span>
                </div>
                <p className='text-sm text-foreground'>
                  {asset.brand && asset.model ? `${asset.brand} ${asset.model}` : asset.brand || asset.model}
                </p>
                {asset.serialNumber && <p className='text-xs text-muted-foreground'>Serial: {asset.serialNumber}</p>}
              </div>
            )}

            {/* Location */}
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <MapPin className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium text-muted-foreground'>Location</span>
              </div>
              <div>
                <p className='text-sm text-foreground'>{asset.location}</p>
                <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                  <Building className='h-3 w-3' />
                  {asset.property.name}
                </div>
              </div>
            </div>

            {/* Financial Information */}
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <DollarSign className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium text-muted-foreground'>Financial Details</span>
              </div>
              <div className='space-y-1'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Current Value:</span>
                  <span className='font-medium'>{formatCurrency(asset.currentValue)}</span>
                </div>
                {asset.purchasePrice && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Purchase Price:</span>
                    <span className='font-medium'>{formatCurrency(asset.purchasePrice)}</span>
                  </div>
                )}
                {asset.purchaseDate && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Purchase Date:</span>
                    <span>{formatDate(asset.purchaseDate)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Warranty Information */}
            {asset.warrantyExpiry && (
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <Shield className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm font-medium text-muted-foreground'>Warranty</span>
                </div>
                <div className='space-y-1'>
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Expires:</span>
                    <span className={asset.warrantyExpiring ? 'font-medium text-orange-600' : ''}>
                      {formatDate(asset.warrantyExpiry)}
                    </span>
                  </div>
                  {asset.daysUntilWarrantyExpiry !== undefined && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Days Remaining:</span>
                      <span className={asset.daysUntilWarrantyExpiry <= 30 ? 'font-medium text-orange-600' : ''}>
                        {asset.daysUntilWarrantyExpiry} days
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Maintenance Information */}
            {asset.maintenanceSchedule && (
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <Wrench className='h-4 w-4 text-muted-foreground' />
                  <span className='text-sm font-medium text-muted-foreground'>Maintenance</span>
                </div>
                <div className='space-y-1'>
                  {asset.maintenanceSchedule.lastMaintenance && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Last Maintenance:</span>
                      <span>{formatDate(asset.maintenanceSchedule.lastMaintenance)}</span>
                    </div>
                  )}
                  {asset.maintenanceSchedule.nextMaintenance && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Next Maintenance:</span>
                      <span className={asset.maintenanceDue ? 'font-medium text-orange-600' : ''}>
                        {formatDate(asset.maintenanceSchedule.nextMaintenance)}
                      </span>
                    </div>
                  )}
                  {asset.daysUntilNextMaintenance !== undefined && (
                    <div className='flex justify-between text-sm'>
                      <span className='text-muted-foreground'>Days Until Next:</span>
                      <span className={asset.maintenanceDue ? 'font-medium text-orange-600' : ''}>
                        {asset.daysUntilNextMaintenance} days
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className='space-y-2'>
              <div className='flex items-center gap-2'>
                <Clock className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium text-muted-foreground'>Timeline</span>
              </div>
              <div className='space-y-1'>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Created:</span>
                  <span>{formatDate(asset.createdAt)}</span>
                </div>
                <div className='flex justify-between text-sm'>
                  <span className='text-muted-foreground'>Last Updated:</span>
                  <span>{formatDate(asset.updatedAt)}</span>
                </div>
                {asset.assignedAt && (
                  <div className='flex justify-between text-sm'>
                    <span className='text-muted-foreground'>Assigned:</span>
                    <span>{formatDate(asset.assignedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Attachments */}
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <Paperclip className='h-4 w-4 text-muted-foreground' />
                <span className='text-sm font-medium text-muted-foreground'>
                  Attachments {asset.photos?.length || 0}
                </span>
              </div>
              {(asset.photos?.length || 0) > 0 && (
                <Button variant='link' size='sm' className='p-0 h-auto'>
                  <Download className='h-4 w-4 mr-1' />
                  Download All
                </Button>
              )}
            </div>

            <div className='grid grid-cols-2 gap-3'>
              {asset.photos && asset.photos.length > 0 ? (
                asset.photos.map((photo, index) => (
                  <div key={index} className='border rounded-lg p-3'>
                    <div className='flex items-center gap-3'>
                      <div className='w-8 h-8 bg-red-100 rounded flex items-center justify-center'>
                        <span className='text-xs font-medium text-red-600'>IMG</span>
                      </div>
                      <div className='flex-1 min-w-0'>
                        <p className='text-sm font-medium text-foreground truncate'>Photo {index + 1}.jpg</p>
                        <p className='text-xs text-muted-foreground'>2.5 MB</p>
                      </div>
                      <Button variant='link' size='sm' className='p-0 h-auto'>
                        <Download className='h-3 w-3' />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className='col-span-2 text-center py-8 text-muted-foreground'>
                  <Paperclip className='h-8 w-8 mx-auto mb-2 opacity-50' />
                  <p className='text-sm'>No attachments</p>
                </div>
              )}

              {/* Add attachment button */}
              <div className='border-2 border-dashed border-gray-200 rounded-lg p-3 flex items-center justify-center hover:border-gray-300 transition-colors cursor-pointer'>
                <Plus className='h-6 w-6 text-gray-400' />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className='space-y-4 pt-6 border-t'>
            <div className='flex gap-2'>
              {onEdit && (
                <Button variant='outline' onClick={() => onEdit(asset)} className='flex-1'>
                  <FileText className='h-4 w-4 mr-1' />
                  Edit Asset
                </Button>
              )}
              {asset.assignedUser && onCheckIn && (
                <Button variant='outline' onClick={() => onCheckIn(asset)} className='flex-1'>
                  <User className='h-4 w-4 mr-1' />
                  Check In
                </Button>
              )}
              {!asset.assignedUser && asset.status === 'available' && onCheckOut && (
                <Button variant='outline' onClick={() => onCheckOut(asset)} className='flex-1'>
                  <User className='h-4 w-4 mr-1' />
                  Check Out
                </Button>
              )}
              {asset.maintenanceDue && onScheduleMaintenance && (
                <Button variant='outline' onClick={() => onScheduleMaintenance(asset)} className='flex-1'>
                  <Wrench className='h-4 w-4 mr-1' />
                  Schedule Maintenance
                </Button>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
