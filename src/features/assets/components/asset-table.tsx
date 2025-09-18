'use client';

import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { useAuthenticatedQuery } from '@/hooks/use-authenticated-query';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { useProgress } from '@bprogress/next';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MoreHorizontal, Eye, Edit, CheckCircle, Clock, Wrench, Trash2, User, MapPin, Package } from 'lucide-react';
import { Asset } from '../types';
import { AssetDetailSheet } from './asset-detail-sheet';
import { AssetEditModal } from './asset-edit-modal';
import { AssetPagination } from './asset-pagination';
import { formatCurrency, formatDate, getConditionBadge, getStatusBadge, getStatusIcon } from '../lib/utils';

interface AssetTableProps {
  assets: Asset[];
  properties?: Array<{
    _id: Id<'properties'>;
    name: string;
    address: string;
  }>;
  onRefresh: () => void;
  // Pagination props
  currentPage?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  onPageChange?: (page: number) => void;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  onFirstPage?: () => void;
  onLastPage?: () => void;
  isLoading?: boolean;
  total?: number;
  limit?: number;
}

export function AssetTable({
  assets,
  properties,
  onRefresh,
  currentPage = 1,
  totalPages = 1,
  hasNextPage = false,
  hasPreviousPage = false,
  onPageChange,
  onNextPage,
  onPreviousPage,
  onFirstPage,
  onLastPage,
  isLoading = false,
  total,
  limit = 10,
}: AssetTableProps) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [detailSheetOpen, setDetailSheetOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [checkoutDialog, setCheckoutDialog] = useState<{
    open: boolean;
    asset: Asset | null;
    selectedUserId: string;
    notes: string;
  }>({
    open: false,
    asset: null,
    selectedUserId: '',
    notes: '',
  });

  const [userPagination, setUserPagination] = useState({
    cursor: null as string | null,
    hasMore: true,
  });

  const [allUsers, setAllUsers] = useState<any[]>([]);

  const { start, stop } = useProgress();
  const { toast } = useToast();

  // Mutations for asset actions
  const checkOutAsset = useMutation(api.assets.checkOutAsset);
  const checkInAsset = useMutation(api.assets.checkInAsset);
  const updateAssetStatus = useMutation(api.assets.updateAssetStatus);

  // Get users for checkout selection
  const users = useAuthenticatedQuery(api.users.getUsers, {
    paginationOpts: { numItems: 10, cursor: userPagination.cursor },
  });

  // Handle user pagination
  useEffect(() => {
    if (users) {
      if (userPagination.cursor === null) {
        // First load - replace all users
        setAllUsers(users.page);
      } else {
        // Subsequent loads - append to existing users
        setAllUsers(prev => [...prev, ...users.page]);
      }

      setUserPagination(prev => ({
        ...prev,
        hasMore: !users.isDone,
        cursor: users.continueCursor || null,
      }));
    }
  }, [users, userPagination.cursor]);

  const loadMoreUsers = () => {
    if (userPagination.hasMore && users?.continueCursor) {
      setUserPagination(prev => ({
        ...prev,
        cursor: users.continueCursor || null,
      }));
    }
  };

  const handleCheckOut = (asset: Asset) => {
    setCheckoutDialog({
      open: true,
      asset,
      selectedUserId: '',
      notes: '',
    });
    // Reset user pagination when opening dialog
    setUserPagination({
      cursor: null,
      hasMore: true,
    });
    setAllUsers([]);
  };

  const handleCheckOutSubmit = async () => {
    if (!checkoutDialog.asset || !checkoutDialog.selectedUserId) {
      toast({
        title: 'Error',
        description: 'Please select a user to check out the asset to',
        variant: 'destructive',
      });
      return;
    }

    start();
    try {
      await checkOutAsset({
        assetId: checkoutDialog.asset._id,
        userId: checkoutDialog.selectedUserId as Id<'users'>,
        notes: checkoutDialog.notes || 'Checked out from asset table',
      });
      toast({
        title: 'Success',
        description: 'Asset checked out successfully',
      });
      setCheckoutDialog({
        open: false,
        asset: null,
        selectedUserId: '',
        notes: '',
      });
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check out asset',
        variant: 'destructive',
      });
    } finally {
      stop();
    }
  };

  const handleCheckIn = async (asset: Asset) => {
    start();
    try {
      await checkInAsset({
        assetId: asset._id,
        notes: 'Checked in from asset table',
      });
      toast({
        title: 'Success',
        description: 'Asset checked in successfully',
      });
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to check in asset',
        variant: 'destructive',
      });
    } finally {
      stop();
    }
  };

  const handleScheduleMaintenance = async (asset: Asset) => {
    start();
    try {
      await updateAssetStatus({
        assetId: asset._id,
        status: 'maintenance',
      });
      toast({
        title: 'Success',
        description: 'Asset scheduled for maintenance',
      });
      onRefresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to schedule maintenance',
        variant: 'destructive',
      });
    } finally {
      stop();
    }
  };

  const handleViewDetails = (asset: Asset) => {
    setSelectedAsset(asset);
    setDetailSheetOpen(true);
  };

  const handleEditAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setEditModalOpen(true);
  };

  const handleCloseDetailSheet = () => {
    setDetailSheetOpen(false);
    setSelectedAsset(null);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedAsset(null);
  };

  const handleEditSuccess = () => {
    onRefresh();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Assets</CardTitle>
        <CardDescription>{assets.length} assets found</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assets.map(asset => (
                <TableRow key={asset._id}>
                  <TableCell>
                    <div>
                      <div className='font-medium'>{asset.name}</div>
                      <div className='text-sm text-muted-foreground'>{asset.assetTag}</div>
                      {asset.brand && asset.model && (
                        <div className='text-xs text-muted-foreground'>
                          {asset.brand} {asset.model}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant='outline'>{asset.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-2'>
                      {getStatusIcon(asset.status)}
                      {getStatusBadge(asset.status)}
                    </div>
                  </TableCell>
                  <TableCell>{getConditionBadge(asset.condition)}</TableCell>
                  <TableCell>
                    <div className='flex items-center gap-1'>
                      <MapPin className='h-3 w-3' />
                      <span className='text-sm'>{asset.location}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {asset.assignedUser ? (
                      <div>
                        <div className='font-medium'>
                          {asset.assignedUser.firstName} {asset.assignedUser.lastName}
                        </div>
                        <div className='text-xs text-muted-foreground'>{formatDate(asset.assignedAt)}</div>
                      </div>
                    ) : (
                      <span className='text-muted-foreground'>Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className='text-sm'>
                      <div className='font-medium'>{formatCurrency(asset.currentValue)}</div>
                      {asset.purchasePrice && (
                        <div className='text-xs text-muted-foreground'>Paid: {formatCurrency(asset.purchasePrice)}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant='ghost' className='h-8 w-8 p-0'>
                          <MoreHorizontal className='h-4 w-4' />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align='end'>
                        <DropdownMenuItem onClick={() => handleViewDetails(asset)}>
                          <Eye className='mr-2 h-4 w-4' />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditAsset(asset)}>
                          <Edit className='mr-2 h-4 w-4' />
                          Edit Asset
                        </DropdownMenuItem>
                        {asset.assignedUser && (
                          <DropdownMenuItem onClick={() => handleCheckIn(asset)}>
                            <User className='mr-2 h-4 w-4' />
                            Check In
                          </DropdownMenuItem>
                        )}
                        {!asset.assignedUser && asset.status === 'available' && (
                          <DropdownMenuItem onClick={() => handleCheckOut(asset)}>
                            <User className='mr-2 h-4 w-4' />
                            Check Out
                          </DropdownMenuItem>
                        )}
                        {asset.maintenanceDue && (
                          <DropdownMenuItem onClick={() => handleScheduleMaintenance(asset)}>
                            <Wrench className='mr-2 h-4 w-4' />
                            Schedule Maintenance
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {assets.length === 0 && (
          <div className='text-center py-8'>
            <Package className='mx-auto h-12 w-12 text-muted-foreground' />
            <h3 className='mt-2 text-sm font-semibold'>No assets found</h3>
            <p className='mt-1 text-sm text-muted-foreground'>Try adjusting your filters or add a new asset.</p>
          </div>
        )}

        {/* Pagination */}
        {assets.length > 0 && (hasNextPage || hasPreviousPage || assets.length >= 10) && (
          <div className='border-t pt-4'>
            <AssetPagination
              currentPage={currentPage}
              totalPages={totalPages}
              hasNextPage={hasNextPage}
              hasPreviousPage={hasPreviousPage}
              onPageChange={onPageChange || (() => {})}
              onNextPage={onNextPage || (() => {})}
              onPreviousPage={onPreviousPage || (() => {})}
              onFirstPage={onFirstPage || (() => {})}
              onLastPage={onLastPage || (() => {})}
              isLoading={isLoading}
              total={total}
              limit={limit}
            />
          </div>
        )}
      </CardContent>

      {/* Checkout Dialog */}
      <Dialog open={checkoutDialog.open} onOpenChange={open => setCheckoutDialog(prev => ({ ...prev, open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Check Out Asset</DialogTitle>
            <DialogDescription>Assign {checkoutDialog.asset?.name} to a user</DialogDescription>
          </DialogHeader>

          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='user-select'>Select User</Label>
              <Select
                value={checkoutDialog.selectedUserId}
                onValueChange={value => setCheckoutDialog(prev => ({ ...prev, selectedUserId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Choose a user' />
                </SelectTrigger>
                <SelectContent
                  onScroll={e => {
                    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
                    if (scrollHeight - scrollTop === clientHeight && userPagination.hasMore) {
                      loadMoreUsers();
                    }
                  }}
                >
                  {allUsers.map((user: any) => (
                    <SelectItem key={user._id} value={user._id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </SelectItem>
                  ))}
                  {userPagination.hasMore && (
                    <div className='px-2 py-1 text-sm text-muted-foreground text-center'>Loading more users...</div>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='notes'>Notes (Optional)</Label>
              <Input
                id='notes'
                value={checkoutDialog.notes}
                onChange={e => setCheckoutDialog(prev => ({ ...prev, notes: e.target.value }))}
                placeholder='Add any notes about this checkout...'
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setCheckoutDialog(prev => ({ ...prev, open: false }))}>
              Cancel
            </Button>
            <Button onClick={handleCheckOutSubmit}>Check Out Asset</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Asset Detail Sheet */}
      <AssetDetailSheet
        asset={selectedAsset}
        isOpen={detailSheetOpen}
        onClose={handleCloseDetailSheet}
        onEdit={handleEditAsset}
        onCheckOut={handleCheckOut}
        onCheckIn={handleCheckIn}
        onScheduleMaintenance={handleScheduleMaintenance}
      />

      {/* Asset Edit Modal */}
      <AssetEditModal
        asset={selectedAsset}
        isOpen={editModalOpen}
        onClose={handleCloseEditModal}
        onSuccess={handleEditSuccess}
      />
    </Card>
  );
}
