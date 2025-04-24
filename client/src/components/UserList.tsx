import { User } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { ScrollArea } from './ui/scroll-area';
import { cn } from '@/lib/utils';
import { Badge } from './ui/badge';

interface UserListProps {
  users: User[];
  selectedUserIds: string[];
  onSelectUser: (userId: string) => void;
}

const UserList = ({ users, selectedUserIds, onSelectUser }: UserListProps) => {
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between items-center">
          <span>Users</span>
          {selectedUserIds.length > 0 && (
            <Badge variant="secondary">{selectedUserIds.length} selected</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[calc(100vh-300px)] px-4 pb-4">
          <div className="space-y-2">
            {users.map((user) => {
              const isSelected = selectedUserIds.includes(user._id);
              const initials = user.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase();

              return (
                <div
                  key={user._id}
                  className={cn(
                    'flex items-center gap-3 rounded-md p-2 cursor-pointer transition-colors',
                    isSelected ? 'bg-primary/10 text-primary' : 'hover:bg-muted',
                  )}
                  onClick={() => onSelectUser(user._id)}
                >
                  <Avatar className="h-9 w-9 relative">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="10"
                          height="10"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-white"
                        >
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    )}
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate">{user.name}</span>
                    <span className="text-xs text-muted-foreground truncate">{user.role}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default UserList;

