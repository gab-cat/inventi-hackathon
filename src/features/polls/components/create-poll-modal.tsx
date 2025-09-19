'use client';

import { useState } from 'react';
import { Plus, X, Calendar, Users, Eye, EyeOff } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { usePollMutations } from '../hooks/usePollMutations';
import { CreatePollForm } from '../types';
import { Id } from '../../../../convex/_generated/dataModel';

interface CreatePollModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyId: Id<'properties'>;
  onPollCreated: () => void;
}

export function CreatePollModal({ open, onOpenChange, propertyId, onPollCreated }: CreatePollModalProps) {
  const [formData, setFormData] = useState<CreatePollForm>({
    propertyId,
    title: '',
    description: '',
    question: '',
    options: ['', ''],
    pollType: 'single_choice',
    allowAnonymous: false,
  });

  const [newOption, setNewOption] = useState('');
  const { createPoll, isLoading } = usePollMutations();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a poll title.',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.question.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Please enter a poll question.',
        variant: 'destructive',
      });
      return;
    }

    const validOptions = formData.options.filter(option => option.trim());
    if (validOptions.length < 2 && formData.pollType !== 'text') {
      toast({
        title: 'Validation Error',
        description: 'Please provide at least 2 options.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createPoll({
        ...formData,
        options: validOptions,
      });

      toast({
        title: 'Success',
        description: 'Poll created successfully!',
      });

      handleClose();
      onPollCreated();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create poll. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setFormData({
      propertyId,
      title: '',
      description: '',
      question: '',
      options: ['', ''],
      pollType: 'single_choice',
      allowAnonymous: false,
    });
    setNewOption('');
    onOpenChange(false);
  };

  const addOption = () => {
    if (newOption.trim()) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, newOption.trim()],
      }));
      setNewOption('');
    }
  };

  const removeOption = (index: number) => {
    if (formData.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

  const updateOption = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => (i === index ? value : option)),
    }));
  };

  const pollTypes = [
    { value: 'single_choice', label: 'Single Choice', description: 'Users can select one option' },
    { value: 'multiple_choice', label: 'Multiple Choice', description: 'Users can select multiple options' },
    { value: 'rating', label: 'Rating Scale', description: 'Users rate on a scale (1-5, 1-10, etc.)' },
    { value: 'text', label: 'Text Response', description: 'Users provide text feedback' },
  ];

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Plus className='h-5 w-5' />
            Create New Poll
          </DialogTitle>
          <DialogDescription>
            Create a poll to gather feedback from your tenants. All fields are required.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className='space-y-4 sm:space-y-6'>
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 sm:space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='title'>Poll Title *</Label>
                <Input
                  id='title'
                  value={formData.title}
                  onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder='e.g., Building Amenities Survey'
                  disabled={isLoading}
                  required
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='description'>Description</Label>
                <Textarea
                  id='description'
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder='Brief description of the poll purpose...'
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='question'>Poll Question *</Label>
                <Textarea
                  id='question'
                  value={formData.question}
                  onChange={e => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  placeholder='What would you like to ask your tenants?'
                  disabled={isLoading}
                  required
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Poll Type */}
          <Card>
            <CardHeader>
              <CardTitle>Poll Type</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 sm:space-y-4'>
              <div className='space-y-2'>
                <Label>Response Type *</Label>
                <Select
                  value={formData.pollType}
                  onValueChange={(value: 'single_choice' | 'multiple_choice' | 'rating' | 'text') =>
                    setFormData(prev => ({ ...prev, pollType: value }))
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {pollTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div>
                          <div className='font-medium'>{type.label}</div>
                          <div className='text-sm text-muted-foreground'>{type.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Options (for choice-based polls) */}
          {formData.pollType !== 'text' && (
            <Card>
              <CardHeader>
                <CardTitle>Response Options</CardTitle>
              </CardHeader>
              <CardContent className='space-y-3 sm:space-y-4'>
                <div className='space-y-3'>
                  {formData.options.map((option, index) => (
                    <div key={index} className='flex items-center gap-2'>
                      <Input
                        value={option}
                        onChange={e => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        disabled={isLoading}
                      />
                      {formData.options.length > 2 && (
                        <Button
                          type='button'
                          variant='ghost'
                          size='sm'
                          onClick={() => removeOption(index)}
                          disabled={isLoading}
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <div className='flex items-center gap-2'>
                  <Input
                    value={newOption}
                    onChange={e => setNewOption(e.target.value)}
                    placeholder='Add new option...'
                    disabled={isLoading}
                    onKeyPress={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addOption();
                      }
                    }}
                  />
                  <Button
                    type='button'
                    variant='outline'
                    size='sm'
                    onClick={addOption}
                    disabled={isLoading || !newOption.trim()}
                  >
                    <Plus className='h-4 w-4' />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Poll Settings</CardTitle>
            </CardHeader>
            <CardContent className='space-y-3 sm:space-y-4'>
              <div className='flex items-center space-x-2'>
                <Checkbox
                  id='allowAnonymous'
                  checked={formData.allowAnonymous}
                  onCheckedChange={checked => setFormData(prev => ({ ...prev, allowAnonymous: !!checked }))}
                  disabled={isLoading}
                />
                <Label htmlFor='allowAnonymous' className='flex items-center gap-2'>
                  {formData.allowAnonymous ? <Eye className='h-4 w-4' /> : <EyeOff className='h-4 w-4' />}
                  Allow anonymous responses
                </Label>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='expiresAt'>Expiration Date (Optional)</Label>
                <Input
                  id='expiresAt'
                  type='datetime-local'
                  value={formData.expiresAt ? new Date(formData.expiresAt).toISOString().slice(0, 16) : ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      expiresAt: e.target.value ? new Date(e.target.value).getTime() : undefined,
                    }))
                  }
                  disabled={isLoading}
                />
              </div>
            </CardContent>
          </Card>

          <DialogFooter className='flex-col sm:flex-row gap-2'>
            <Button
              type='button'
              variant='outline'
              onClick={handleClose}
              disabled={isLoading}
              className='w-full sm:w-auto'
            >
              Cancel
            </Button>
            <Button type='submit' disabled={isLoading} className='w-full sm:w-auto'>
              {isLoading ? 'Creating...' : 'Create Poll'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
