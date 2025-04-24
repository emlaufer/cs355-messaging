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
  onAddPost: (post: {
    userIds: string[];
    message: string;
    proof?: string;
    verifierData?: string;
    common?: string;
  }) => void;
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
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofFileName, setProofFileName] = useState<string>('');
  const [proofData, setProofData] = useState<{
    proof?: string;
    verifierData?: string;
    common?: string;
  } | null>(null);

  const selectedUsers = users.filter((user) => selectedUserIds.includes(user._id));

  const handleDownloadJson = () => {
    // Get selected users' public keys
    const publicKeys = users
      .filter((user) => selectedUserIds.includes(user._id))
      .map((user) => user.publicKey || '')
      .filter((key) => key !== '') // Filter out empty keys
      .sort(); // Sort keys for consistent ordering

    console.log(
      'users: ',
      users.filter((user) => selectedUserIds.includes(user._id)),
    );

    // Create download data
    const downloadData = {
      publicKeys,
      message: message.trim(),
    };

    // Create and trigger download
    const dataStr = JSON.stringify(downloadData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.download = 'message-data.json';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProofFile(file);
    setProofFileName(file.name);

    // Read and parse the JSON file
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonData = JSON.parse(event.target?.result as string);

        // Validate the JSON structure
        if (
          !jsonData.proof ||
          typeof jsonData.proof !== 'string' ||
          !jsonData.common ||
          typeof jsonData.common !== 'string' ||
          !jsonData.verifier_only ||
          typeof jsonData.verifier_only !== 'string'
        ) {
          setError(
            'Invalid proof format: must contain "proof", "common", and "verifier_only" as strings',
          );
          return;
        }

        // Map verifier_only to verifierData for consistency
        setError('');
        setProofData({
          proof: jsonData.proof,
          common: jsonData.common,
          verifierData: jsonData.verifier_only,
        });
      } catch (error) {
        setError('Invalid JSON file format');
      }
    };
    reader.readAsText(file);
  };

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
      proof: proofData?.proof,
      verifierData: proofData?.verifierData,
      common: proofData?.common,
    });

    // Reset form
    setMessage('');
    setError('');
    setProofFile(null);
    setProofFileName('');
    setProofData(null);
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
                    const userName =
                      users.find((user) => user._id === item.props.value)?.name || '';
                    return userName.toLowerCase().includes(query.toLowerCase());
                  });
                }}
              >
                {users.map((user) => (
                  <MultiSelectItem key={user._id} value={user._id}>
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

            <div className="mt-1">
              <button
                type="button"
                onClick={handleDownloadJson}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
              >
                Download proof input
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="proof" className="block text-sm font-medium text-gray-700 mb-1">
              Ring Signature Proof (optional)
            </label>
            <div className="flex items-center gap-2">
              <input
                id="proof"
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleProofFileChange}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('proof')?.click()}
              >
                Choose JSON File
              </Button>
              {proofFileName ? (
                <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {proofFileName}
                </span>
              ) : (
                <span className="text-sm text-muted-foreground">No file selected</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Upload a JSON file containing Plonky2 proof of signature
            </p>
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
