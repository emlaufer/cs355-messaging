import axios from 'axios';
import { Post, User } from '../types';

const API_URL = 'http://localhost:5000';

// Create an axios instance with default settings
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Post-related API calls
export async function fetchPosts(): Promise<Post[]> {
  try {
    const response = await api.get('/messages');
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

export async function createPost(post: { userIds: string[]; message: string }): Promise<Post> {
  try {
    const response = await api.post('/messages', post);
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

// User-related API calls
export async function fetchUsers(): Promise<User[]> {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function fetchUserById(id: string): Promise<User> {
  try {
    const response = await api.get(`/users/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    throw error;
  }
}
