import { useUsers } from '@/features/user/hooks/useGetUserById';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Id } from '@convex/_generated/dataModel';

export const UserAvatar = ({ id }: { id: Id<'users'> }) => {
  const user = useUsers(id);
  console.log(user);
  return (
    <div className='flex items-center gap-2  text-left text-sm'>
      <Avatar className='h-7 w-7 rounded-full'>
        <AvatarImage src={user.user?.profileImage} alt={`${user.user?.firstName ?? ''} ${user.user?.lastName ?? ''}`} />
        <AvatarFallback className='rounded-full'>
          {(user.user?.firstName?.[0] ?? '') + (user.user?.lastName?.[0] ?? '') || 'U'}
        </AvatarFallback>
      </Avatar>

      <div className='grid flex-1 text-left text-sm leading-tight'>
        <span className='truncate font-medium'>{user.user?.firstName}</span>
        <span className='text-muted-foreground truncate text-xs'>{user.user?.email}</span>
      </div>
    </div>
  );
};
