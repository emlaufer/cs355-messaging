import { useState } from 'react';
import { User } from '../types';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from './ui/multi-select';

interface PostFormProps {
  users: User[];
  selectedUserIds: string[];
  onSelectUser: (userId: string) => void;
  onClearSelection: () => void;
  onAddPost: (post: { userIds: string[]; message: string }) => void;
}

const PostForm = ({
  users,
  selectedUserIds,
  onSelectUser,
  onClearSelection,
  onAddPost,
}: PostFormProps) => {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const selectedUsers = users.filter((user) => selectedUserIds.includes(user.id));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedUserIds.length === 0) {
      setError('Please select at least one author');
      return;
    }

    if (!message.trim()) {
      setError('Please enter a message');
      return;
    }

    onAddPost({
      userIds: selectedUserIds,
      message,
    });

    // Reset form
    setMessage('');
    setError('');
    onClearSelection();
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">Post a Message</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">
              Post as
            </label>
            <MultiSelect
              onValueChange={(values: string[]) => {
                // For each user ID in values that's not in selectedUserIds, call onSelectUser
                values.forEach((userId: string) => {
                  if (!selectedUserIds.includes(userId)) {
                    onSelectUser(userId);
                  }
                });

                // For each user ID in selectedUserIds that's not in values, call onSelectUser to toggle it off
                selectedUserIds.forEach((userId) => {
                  if (!values.includes(userId)) {
                    onSelectUser(userId);
                  }
                });
              }}
            >
              <MultiSelectTrigger id="user" className="w-full">
                <MultiSelectValue placeholder="Select users" />
              </MultiSelectTrigger>
              <MultiSelectContent
                searchPlaceholder="Search users..."
                onSearch={(query: string, items: any[]) => {
                  if (!query.trim()) return items;

                  return items.filter((item: any) => {
                    // Extract the user name from the item component
                    const userName = users.find((user) => user.id === item.props.value)?.name || '';
                    return userName.toLowerCase().includes(query.toLowerCase());
                  });
                }}
              >
                {users.map((user) => (
                  <MultiSelectItem key={user.id} value={user.id}>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={user.avatar} alt={user.name} />
                        <AvatarFallback>
                          {user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-primary">{user.name}</span>
                    </div>
                  </MultiSelectItem>
                ))}
              </MultiSelectContent>
            </MultiSelect>
          </div>
          <div>
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What's on your mind?"
              className="w-full min-h-[100px]"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedUsers.length > 0 ? (
                <span className="text-sm text-muted-foreground">
                  Posting as {selectedUsers.length}{' '}
                  {selectedUsers.length === 1 ? 'author' : 'authors'}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">No authors selected</span>
              )}
            </div>
            <Button type="submit">Post Message</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default PostForm;
