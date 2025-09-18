'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useProgress } from '@bprogress/next';
import { Loader2, Package } from 'lucide-react';

interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  properties?: Array<{
    _id: Id<'properties'>;
    name: string;
    address: string;
  }>;
  selectedPropertyId?: Id<'properties'>;
}

export function AddAssetDialog({ open, onOpenChange, properties, selectedPropertyId }: AddAssetDialogProps) {
  const { toast } = useToast();
  const { start, stop } = useProgress();
  const addAsset = useMutation(api.assets.webAddAsset);

  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    propertyId: selectedPropertyId || '',
    assetTag: '',
    name: '',
    description: '',
    category: '',
    subcategory: '',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    purchasePrice: '',
    currentValue: '',
    condition: '',
    status: 'available',
    location: '',
    warrantyExpiry: '',
    maintenanceInterval: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.propertyId || !formData.assetTag || !formData.name || !formData.category || !formData.condition) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    start();

    try {
      await addAsset({
        propertyId: formData.propertyId as Id<'properties'>,
        assetTag: formData.assetTag,
        name: formData.name,
        description: formData.description,
        category: formData.category as any,
        subcategory: formData.subcategory || undefined,
        brand: formData.brand || undefined,
        model: formData.model || undefined,
        serialNumber: formData.serialNumber || undefined,
        purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate).getTime() : undefined,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
        currentValue: formData.currentValue ? parseFloat(formData.currentValue) : undefined,
        condition: formData.condition as any,
        status: formData.status as any,
        location: formData.location,
        warrantyExpiry: formData.warrantyExpiry ? new Date(formData.warrantyExpiry).getTime() : undefined,
        maintenanceSchedule: formData.maintenanceInterval
          ? {
              interval: parseInt(formData.maintenanceInterval),
            }
          : undefined,
      });

      toast({
        title: 'Success',
        description: 'Asset added successfully',
      });

      // Reset form
      setFormData({
        propertyId: selectedPropertyId || '',
        assetTag: '',
        name: '',
        description: '',
        category: '',
        subcategory: '',
        brand: '',
        model: '',
        serialNumber: '',
        purchaseDate: '',
        purchasePrice: '',
        currentValue: '',
        condition: '',
        status: 'available',
        location: '',
        warrantyExpiry: '',
        maintenanceInterval: '',
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add asset. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
      stop();
    }
  };

  const categories = [
    { value: 'tool', label: 'Tools' },
    { value: 'equipment', label: 'Equipment' },
    { value: 'material', label: 'Materials' },
    { value: 'furniture', label: 'Furniture' },
    { value: 'appliance', label: 'Appliances' },
  ];

  const conditions = [
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' },
    { value: 'broken', label: 'Broken' },
  ];

  const statuses = [
    { value: 'available', label: 'Available' },
    { value: 'checked_out', label: 'Checked Out' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'retired', label: 'Retired' },
    { value: 'lost', label: 'Lost' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Package className='h-5 w-5' />
            Add New Asset
          </DialogTitle>
          <DialogDescription>
            Add a new asset to your inventory. Fill in the required information below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Essential details about the asset</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='propertyId'>Property *</Label>
                  <Select
                    value={formData.propertyId}
                    onValueChange={value => setFormData({ ...formData, propertyId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select property' />
                    </SelectTrigger>
                    <SelectContent>
                      {properties?.map(property => (
                        <SelectItem key={property._id} value={property._id}>
                          {property.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='assetTag'>Asset Tag *</Label>
                  <Input
                    id='assetTag'
                    value={formData.assetTag}
                    onChange={e => setFormData({ ...formData, assetTag: e.target.value })}
                    placeholder='e.g., TOOL-001'
                    required
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='name'>Asset Name *</Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder='e.g., Cordless Drill'
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>Description</Label>
                <Textarea
                  id='description'
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder='Describe the asset...'
                  rows={3}
                />
              </div>

              <div className='grid grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='category'>Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={value => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select category' />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='subcategory'>Subcategory</Label>
                  <Input
                    id='subcategory'
                    value={formData.subcategory}
                    onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                    placeholder='e.g., Power Tools'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='condition'>Condition *</Label>
                  <Select
                    value={formData.condition}
                    onValueChange={value => setFormData({ ...formData, condition: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder='Select condition' />
                    </SelectTrigger>
                    <SelectContent>
                      {conditions.map(condition => (
                        <SelectItem key={condition.value} value={condition.value}>
                          {condition.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Technical Details */}
          <Card>
            <CardHeader>
              <CardTitle>Technical Details</CardTitle>
              <CardDescription>Brand, model, and serial information</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='brand'>Brand</Label>
                  <Input
                    id='brand'
                    value={formData.brand}
                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                    placeholder='e.g., DeWalt'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='model'>Model</Label>
                  <Input
                    id='model'
                    value={formData.model}
                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                    placeholder='e.g., DCD791D2'
                  />
                </div>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='serialNumber'>Serial Number</Label>
                <Input
                  id='serialNumber'
                  value={formData.serialNumber}
                  onChange={e => setFormData({ ...formData, serialNumber: e.target.value })}
                  placeholder='Serial number if available'
                />
              </div>
            </CardContent>
          </Card>

          {/* Financial Information */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Information</CardTitle>
              <CardDescription>Purchase and current value details</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-3 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='purchaseDate'>Purchase Date</Label>
                  <Input
                    id='purchaseDate'
                    type='date'
                    value={formData.purchaseDate}
                    onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='purchasePrice'>Purchase Price</Label>
                  <Input
                    id='purchasePrice'
                    type='number'
                    step='0.01'
                    value={formData.purchasePrice}
                    onChange={e => setFormData({ ...formData, purchasePrice: e.target.value })}
                    placeholder='0.00'
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='currentValue'>Current Value</Label>
                  <Input
                    id='currentValue'
                    type='number'
                    step='0.01'
                    value={formData.currentValue}
                    onChange={e => setFormData({ ...formData, currentValue: e.target.value })}
                    placeholder='0.00'
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location & Status */}
          <Card>
            <CardHeader>
              <CardTitle>Location & Status</CardTitle>
              <CardDescription>Current location and status of the asset</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='location'>Location *</Label>
                  <Input
                    id='location'
                    value={formData.location}
                    onChange={e => setFormData({ ...formData, location: e.target.value })}
                    placeholder='e.g., Storage Room A'
                    required
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='status'>Status</Label>
                  <Select value={formData.status} onValueChange={value => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder='Select status' />
                    </SelectTrigger>
                    <SelectContent>
                      {statuses.map(status => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Maintenance & Warranty */}
          <Card>
            <CardHeader>
              <CardTitle>Maintenance & Warranty</CardTitle>
              <CardDescription>Schedule maintenance and track warranty</CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='warrantyExpiry'>Warranty Expiry</Label>
                  <Input
                    id='warrantyExpiry'
                    type='date'
                    value={formData.warrantyExpiry}
                    onChange={e => setFormData({ ...formData, warrantyExpiry: e.target.value })}
                  />
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='maintenanceInterval'>Maintenance Interval (days)</Label>
                  <Input
                    id='maintenanceInterval'
                    type='number'
                    value={formData.maintenanceInterval}
                    onChange={e => setFormData({ ...formData, maintenanceInterval: e.target.value })}
                    placeholder='e.g., 90'
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Add Asset
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
