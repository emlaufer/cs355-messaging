import axios from 'axios';
import { Post, User } from '../types';

const API_URL = 'http://localhost:5000';
const CGI_URL = '/cgi-bin';

// Set this flag to true to use the CGI-based API, or false to use the original API
const USE_CGI_API = true;

// Create an axios instance with default settings
const api = axios.create({
  baseURL: USE_CGI_API ? CGI_URL : API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Post-related API calls
export async function fetchPosts(): Promise<Post[]> {
  try {
    const endpoint = USE_CGI_API ? '/messages.php/messages' : '/messages';
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

export async function createPost(post: { userIds: string[]; message: string }): Promise<Post> {
  try {
    const endpoint = USE_CGI_API ? '/messages.php/messages' : '/messages';
    const response = await api.post(endpoint, post);
    return response.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

// User-related API calls
export async function fetchUsers(): Promise<User[]> {
  try {
    const endpoint = USE_CGI_API ? '/users.php/users' : '/users';
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
}

export async function fetchUserById(id: string): Promise<User> {
  try {
    const endpoint = USE_CGI_API ? `/users.php/users/${id}` : `/users/${id}`;
    const response = await api.get(endpoint);
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    throw error;
  }
}
