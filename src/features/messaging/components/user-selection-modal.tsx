'use client';

import { useState, useEffect, useRef } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@convex/_generated/api';
import { Id } from '@convex/_generated/dataModel';
import { Search, User } from 'lucide-react';
import { Input } from '../../../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Skeleton } from '../../../components/ui/skeleton';

interface UserSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserSelect: (userId: string) => void;
  propertyId: Id<'properties'>;
  currentUserId: string;
}

interface User {
  _id: Id<'users'>;
  firstName: string;
  lastName: string;
  email: string;
  role: 'manager' | 'field_technician' | 'tenant' | 'vendor';
  profileImage?: string;
  fullName: string;
  unitNumber?: string;
}

function UserSkeleton() {
  return (
    <div className='flex items-center space-x-3 p-3'>
      <Skeleton className='h-10 w-10 rounded-full' />
      <div className='space-y-2'>
        <Skeleton className='h-4 w-32' />
        <Skeleton className='h-3 w-24' />
      </div>
    </div>
  );
}

export function UserSelectionModal({
  isOpen,
  onClose,
  onUserSelect,
  propertyId,
  currentUserId,
}: UserSelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Get users by property and unit
  const usersData = useQuery(api.user.webGetUsersByPropertyAndUnit, isOpen ? { propertyId } : 'skip');

  // Filter and paginate users on client side
  useEffect(() => {
    if (usersData) {
      let filteredUsers = usersData;

      // Apply search filter
      if (searchTerm.trim()) {
        const searchLower = searchTerm.toLowerCase();
        filteredUsers = usersData.filter(user => {
          const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
          const email = user.email.toLowerCase();
          return fullName.includes(searchLower) || email.includes(searchLower);
        });
      }

      // Apply pagination
      const startIndex = (page - 1) * 10;
      const endIndex = startIndex + 10;
      const paginatedUsers = filteredUsers.slice(0, endIndex);

      if (page === 1) {
        setUsers(paginatedUsers);
      } else {
        setUsers(paginatedUsers);
      }
      setHasMore(endIndex < filteredUsers.length);
    }
  }, [usersData, page, searchTerm]);

  // Reset when modal opens or search changes
  useEffect(() => {
    if (isOpen) {
      setPage(1);
      setUsers([]);
      setHasMore(true);
    }
  }, [isOpen, searchTerm]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setPage(1);
    setUsers([]);
    setHasMore(true);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop === clientHeight && hasMore && !isLoading) {
      setPage(prev => prev + 1);
    }
  };

  const handleUserSelect = (userId: string) => {
    onUserSelect(userId);
    onClose();
  };

  const filteredUsers = users.filter(user => user._id !== currentUserId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-md'>
        <DialogHeader>
          <DialogTitle className='flex items-center'>
            <User className='h-5 w-5 mr-2' />
            Start New Conversation
          </DialogTitle>
        </DialogHeader>

        <div className='space-y-4'>
          {/* Search Input */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
            <Input
              placeholder='Search users...'
              value={searchTerm}
              onChange={e => handleSearch(e.target.value)}
              className='pl-10'
            />
          </div>

          {/* Users List */}
          <div ref={scrollAreaRef} className='h-96 overflow-y-auto' onScroll={handleScroll}>
            <div className='space-y-1'>
              {filteredUsers.length === 0 && !isLoading && (
                <div className='text-center py-8 text-gray-500'>
                  {searchTerm ? 'No users found matching your search.' : 'No users available.'}
                </div>
              )}

              {filteredUsers.map(user => (
                <div
                  key={user._id}
                  className='flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors'
                  onClick={() => handleUserSelect(user._id)}
                >
                  <Avatar className='h-10 w-10'>
                    <AvatarImage src={user.profileImage} />
                    <AvatarFallback>
                      {user.firstName[0]}
                      {user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className='flex-1 min-w-0'>
                    <p className='text-sm font-medium truncate'>{user.fullName}</p>
                    <p className='text-xs text-gray-500 truncate'>
                      {user.email}
                      {user.unitNumber && ` • Unit ${user.unitNumber}`}
                    </p>
                  </div>
                  <Badge variant='outline' className='text-xs'>
                    {user.role}
                  </Badge>
                </div>
              ))}

              {/* Loading skeletons */}
              {isLoading && (
                <>
                  {Array.from({ length: 3 }).map((_, i) => (
                    <UserSkeleton key={i} />
                  ))}
                </>
              )}

              {/* Load more indicator */}
              {hasMore && !isLoading && filteredUsers.length > 0 && (
                <div className='text-center py-2 text-sm text-gray-500'>Scroll down to load more users...</div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
