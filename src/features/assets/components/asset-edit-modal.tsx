'use client';

import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { useProgress } from '@bprogress/next';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Asset } from '../types';

interface AssetEditModalProps {
  asset: Asset | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AssetEditModal({ asset, isOpen, onClose, onSuccess }: AssetEditModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'tool' as 'tool' | 'equipment' | 'material' | 'furniture' | 'appliance',
    subcategory: '',
    brand: '',
    model: '',
    serialNumber: '',
    purchaseDate: '',
    purchasePrice: '',
    currentValue: '',
    condition: 'excellent' as 'excellent' | 'good' | 'fair' | 'poor' | 'broken',
    location: '',
    warrantyExpiry: '',
  });

  const { start, stop } = useProgress();
  const { toast } = useToast();

  const editAssetDetails = useMutation(api.assets.webEditAssetDetails);

  // Initialize form data when asset changes
  useEffect(() => {
    if (asset) {
      setFormData({
        name: asset.name || '',
        description: asset.description || '',
        category: asset.category as 'tool' | 'equipment' | 'material' | 'furniture' | 'appliance',
        subcategory: asset.subcategory || '',
        brand: asset.brand || '',
        model: asset.model || '',
        serialNumber: asset.serialNumber || '',
        purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '',
        purchasePrice: asset.purchasePrice?.toString() || '',
        currentValue: asset.currentValue?.toString() || '',
        condition: asset.condition as 'excellent' | 'good' | 'fair' | 'poor' | 'broken',
        location: asset.location || '',
        warrantyExpiry: asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toISOString().split('T')[0] : '',
      });
    }
  }, [asset]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!asset) return;

    start();
    try {
      await editAssetDetails({
        assetId: asset._id,
        name: formData.name,
        description: formData.description,
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        brand: formData.brand || undefined,
        model: formData.model || undefined,
        serialNumber: formData.serialNumber || undefined,
        purchaseDate: formData.purchaseDate ? new Date(formData.purchaseDate).getTime() : undefined,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : undefined,
        currentValue: formData.currentValue ? parseFloat(formData.currentValue) : undefined,
        condition: formData.condition,
        location: formData.location,
        warrantyExpiry: formData.warrantyExpiry ? new Date(formData.warrantyExpiry).getTime() : undefined,
      });

      toast({
        title: 'Success',
        description: 'Asset updated successfully',
      });

      onClose();
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update asset',
        variant: 'destructive',
      });
    } finally {
      stop();
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      category: 'tool',
      subcategory: '',
      brand: '',
      model: '',
      serialNumber: '',
      purchaseDate: '',
      purchasePrice: '',
      currentValue: '',
      condition: 'excellent',
      location: '',
      warrantyExpiry: '',
    });
    onClose();
  };

  if (!asset) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Edit Asset</DialogTitle>
          <DialogDescription>
            Update the details for {asset.name} (Tag: {asset.assetTag})
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-6'>
          {/* Basic Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Basic Information</h3>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Asset Name *</Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder='Enter asset name'
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='category'>Category *</Label>
                <Select value={formData.category} onValueChange={value => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='tool'>Tool</SelectItem>
                    <SelectItem value='equipment'>Equipment</SelectItem>
                    <SelectItem value='material'>Material</SelectItem>
                    <SelectItem value='furniture'>Furniture</SelectItem>
                    <SelectItem value='appliance'>Appliance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='description'>Description</Label>
              <Textarea
                id='description'
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder='Enter asset description'
                rows={3}
              />
            </div>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='subcategory'>Subcategory</Label>
                <Input
                  id='subcategory'
                  value={formData.subcategory}
                  onChange={e => handleInputChange('subcategory', e.target.value)}
                  placeholder='Enter subcategory'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='condition'>Condition *</Label>
                <Select value={formData.condition} onValueChange={value => handleInputChange('condition', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='excellent'>Excellent</SelectItem>
                    <SelectItem value='good'>Good</SelectItem>
                    <SelectItem value='fair'>Fair</SelectItem>
                    <SelectItem value='poor'>Poor</SelectItem>
                    <SelectItem value='broken'>Broken</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Brand and Model */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Brand & Model</h3>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='brand'>Brand</Label>
                <Input
                  id='brand'
                  value={formData.brand}
                  onChange={e => handleInputChange('brand', e.target.value)}
                  placeholder='Enter brand name'
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='model'>Model</Label>
                <Input
                  id='model'
                  value={formData.model}
                  onChange={e => handleInputChange('model', e.target.value)}
                  placeholder='Enter model number'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='serialNumber'>Serial Number</Label>
              <Input
                id='serialNumber'
                value={formData.serialNumber}
                onChange={e => handleInputChange('serialNumber', e.target.value)}
                placeholder='Enter serial number'
              />
            </div>
          </div>

          {/* Financial Information */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Financial Information</h3>

            <div className='grid grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='purchasePrice'>Purchase Price</Label>
                <Input
                  id='purchasePrice'
                  type='number'
                  step='0.01'
                  value={formData.purchasePrice}
                  onChange={e => handleInputChange('purchasePrice', e.target.value)}
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
                  onChange={e => handleInputChange('currentValue', e.target.value)}
                  placeholder='0.00'
                />
              </div>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='purchaseDate'>Purchase Date</Label>
              <Input
                id='purchaseDate'
                type='date'
                value={formData.purchaseDate}
                onChange={e => handleInputChange('purchaseDate', e.target.value)}
              />
            </div>
          </div>

          {/* Location and Warranty */}
          <div className='space-y-4'>
            <h3 className='text-lg font-medium'>Location & Warranty</h3>

            <div className='space-y-2'>
              <Label htmlFor='location'>Location *</Label>
              <Input
                id='location'
                value={formData.location}
                onChange={e => handleInputChange('location', e.target.value)}
                placeholder='Enter asset location'
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='warrantyExpiry'>Warranty Expiry</Label>
              <Input
                id='warrantyExpiry'
                type='date'
                value={formData.warrantyExpiry}
                onChange={e => handleInputChange('warrantyExpiry', e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={handleClose}>
              Cancel
            </Button>
            <Button type='submit'>Update Asset</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
