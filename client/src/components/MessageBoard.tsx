import { useState } from 'react';
import { Post, User } from '../types';
import PostItem from './PostItem';
import UserList from './UserList';
import PostForm from './PostForm';

interface MessageBoardProps {
  posts: Post[];
  users: User[];
  onAddPost: (post: Omit<Post, 'id' | 'timestamp'>) => void;
  isLoading?: boolean;
}

const MessageBoard = ({ posts, users, onAddPost, isLoading = false }: MessageBoardProps) => {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;
  const totalPages = Math.ceil(posts.length / postsPerPage);

  const handleUserSelect = (userId: string) => {
    setSelectedUserIds((prev) => {
      // If user is already selected, remove them
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      }
      // Otherwise add them to selection
      return [...prev, userId];
    });
  };

  const handleAddPost = (post: Omit<Post, 'id' | 'timestamp'>) => {
    onAddPost(post);

    // Reset to first page when new post is added
    setCurrentPage(1);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* Sidebar with users */}
      <div className="lg:w-1/4">
        <UserList users={users} selectedUserIds={selectedUserIds} onSelectUser={handleUserSelect} />
      </div>

      {/* Main content */}
      <div className="lg:w-3/4 space-y-8">
        <PostForm
          users={users}
          selectedUserIds={selectedUserIds}
          onSelectUser={handleUserSelect}
          onClearSelection={() => setSelectedUserIds([])}
          onAddPost={handleAddPost}
        />

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Messages</h2>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-blue-500"></div>
              <p className="mt-2 text-gray-500">Loading messages...</p>
            </div>
          ) : posts.length > 0 ? (
            <>
              {posts
                .slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage)
                .map((post) => (
                  <PostItem key={post.id} post={post} users={users} />
                ))}

              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center mt-6 gap-2">
                  <button
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &laquo;
                  </button>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &lsaquo;
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((pageNum) => {
                      // Show pages around the current page and at the edges
                      return (
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        Math.abs(pageNum - currentPage) <= 1
                      );
                    })
                    .map((pageNum, idx, arr) => {
                      // Add ellipsis where there are gaps
                      if (idx > 0 && pageNum - arr[idx - 1] > 1) {
                        return (
                          <span key={`ellipsis-${pageNum}`} className="px-3 py-1">
                            &hellip;
                          </span>
                        );
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          disabled={currentPage === pageNum}
                          className={`px-3 py-1 rounded ${
                            currentPage === pageNum
                              ? 'bg-primary text-white'
                              : 'bg-gray-200 hover:bg-gray-300'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &rsaquo;
                  </button>
                  <button
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    &raquo;
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-center py-8">No messages yet. Be the first to post!</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBoard;
