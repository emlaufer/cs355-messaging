import { useState, useEffect } from 'react';
import MessageBoard from './components/MessageBoard';
import { Post, User } from './types';
import { fetchPosts, createPost, fetchUsers } from './utils/api';

function App() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch both posts and users when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [fetchedPosts, fetchedUsers] = await Promise.all([fetchPosts(), fetchUsers()]);

        setPosts(fetchedPosts);
        setUsers(fetchedUsers);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const addPost = async (newPost: Omit<Post, 'id' | 'timestamp'>) => {
    try {
      setLoading(true);
      console.log('POST: ', newPost);
      const createdPost = await createPost(newPost);
      setPosts([createdPost, ...posts]);
      setError(null);
    } catch (err) {
      console.error('Failed to add post', err);
      setError('Failed to add message. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">Message Board</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <MessageBoard posts={posts} users={users} onAddPost={addPost} isLoading={loading} />
      </div>
    </div>
  );
}

export default App;
