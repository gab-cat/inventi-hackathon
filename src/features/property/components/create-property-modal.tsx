'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Building2, MapPin, Hash } from 'lucide-react';
import { CreatePropertyData } from '../types';

interface CreatePropertyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPropertyCreated: (propertyId: Id<'properties'>) => void;
}

export function CreatePropertyModal({ open, onOpenChange, onPropertyCreated }: CreatePropertyModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreatePropertyData>({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    propertyType: 'apartment',
    totalUnits: 0,
  });

  const createProperty = useMutation(api.property.webCreateProperty);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.address || !formData.city || !formData.state || !formData.zipCode) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all required fields.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.totalUnits <= 0) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a valid number of units.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const result = await createProperty({
        name: formData.name,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country,
        propertyType: formData.propertyType,
        totalUnits: formData.totalUnits,
      });

      if (result.success && result.propertyId) {
        toast({
          title: 'Success',
          description: 'Property created successfully!',
        });
        onPropertyCreated(result.propertyId);
        resetForm();
      } else {
        toast({
          title: 'Error',
          description: result.message || 'Failed to create property',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error creating property:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'USA',
      propertyType: 'apartment',
      totalUnits: 0,
    });
  };

  const handleClose = () => {
    if (!isLoading) {
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Building2 className='h-5 w-5' />
            Create New Property
          </DialogTitle>
          <DialogDescription>
            Add a new property to your management portfolio. All fields are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Property Name *</Label>
              <Input
                id='name'
                value={formData.name}
                onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder='e.g., Sunset Apartments'
                disabled={isLoading}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='propertyType'>Property Type *</Label>
              <Select
                value={formData.propertyType}
                onValueChange={(value: 'apartment' | 'condo' | 'house' | 'commercial') =>
                  setFormData(prev => ({ ...prev, propertyType: value }))
                }
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='apartment'>Apartment</SelectItem>
                  <SelectItem value='condo'>Condo</SelectItem>
                  <SelectItem value='house'>House</SelectItem>
                  <SelectItem value='commercial'>Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='address'>Address *</Label>
            <div className='relative'>
              <MapPin className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                id='address'
                value={formData.address}
                onChange={e => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder='123 Main Street'
                className='pl-10'
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className='grid grid-cols-3 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='city'>City *</Label>
              <Input
                id='city'
                value={formData.city}
                onChange={e => setFormData(prev => ({ ...prev, city: e.target.value }))}
                placeholder='San Francisco'
                disabled={isLoading}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='state'>State *</Label>
              <Input
                id='state'
                value={formData.state}
                onChange={e => setFormData(prev => ({ ...prev, state: e.target.value }))}
                placeholder='CA'
                disabled={isLoading}
                required
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='zipCode'>ZIP Code *</Label>
              <Input
                id='zipCode'
                value={formData.zipCode}
                onChange={e => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                placeholder='94102'
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='totalUnits'>Total Units *</Label>
            <div className='relative'>
              <Hash className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
              <Input
                id='totalUnits'
                type='number'
                value={formData.totalUnits || ''}
                onChange={e => setFormData(prev => ({ ...prev, totalUnits: parseInt(e.target.value) || 0 }))}
                placeholder='50'
                className='pl-10'
                disabled={isLoading}
                min='1'
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type='button' variant='outline' onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Property'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
