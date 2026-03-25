import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ibr_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  // Admin approval
  getMembers: () => api.get('/auth/admin/members'),
  approveUser: (id) => api.put(`/auth/admin/approve/${id}`),
  rejectUser: (id, reason) => api.put(`/auth/admin/reject/${id}`, { reason }),
  banMember: (id) => api.put(`/auth/admin/ban/${id}`),
  removeMember: (id) => api.delete(`/auth/admin/remove/${id}`),
  // Recovery
  requestRecoveryOTP: (email) => api.post('/auth/forgot/request', { email }),
  resetCredentials: (data) => api.post('/auth/forgot/reset', data),
};

// Stories
export const storiesAPI = {
  getAll: () => api.get('/stories'),
  create: (data) => api.post('/stories', data),
  delete: (id) => api.delete(`/stories/${id}`),
};

// Highlights
export const highlightsAPI = {
  getAll: () => api.get('/highlights'),
  create: (data) => api.post('/highlights', data),
  delete: (id) => api.delete(`/highlights/${id}`),
};

// Posts
export const postsAPI = {
  getAll: () => api.get('/posts'),
  create: (data) => api.post('/posts', data),
  delete: (id) => api.delete(`/posts/${id}`),
  toggleLike: (id) => api.post(`/posts/${id}/like`),
  getLikedStatus: (id) => api.get(`/posts/${id}/like-status`),
};

// Journeys
export const journeysAPI = {
  getAll: () => api.get('/journeys'),
  create: (data) => api.post('/journeys', data),
  update: (id, data) => api.put(`/journeys/${id}`, data),
  delete: (id) => api.delete(`/journeys/${id}`),
  addPhotos: (id, data) => api.post(`/journeys/${id}/photos`, data),
  removePhoto: (id, photoUrl) => api.delete(`/journeys/${id}/photos`, { data: { photoUrl } }),
};

export const bookingsAPI = {
  getAll: () => api.get('/bookings'),
  getMyBookings: () => api.get('/bookings/my'),
  create: (data) => api.post('/bookings', data),
  delete: (id) => api.delete(`/bookings/${id}`),
};

// Riders
export const ridersAPI = {
  getAll: () => api.get('/riders'),
  create: (data) => api.post('/riders', data),
  delete: (id) => api.delete(`/riders/${id}`),
};

// Places
export const placesAPI = {
  getAll: () => api.get('/places'),
  create: (data) => api.post('/places', data),
  delete: (id) => api.delete(`/places/${id}`),
};

// Hero Slides
export const heroSlidesAPI = {
  getAll: () => api.get('/hero-slides'),
  create: (data) => api.post('/hero-slides', data),
  delete: (id) => api.delete(`/hero-slides/${id}`),
};

// Comments
export const commentsAPI = {
  getByPost: (postId) => api.get(`/comments/post/${postId}`),
  create: (data) => api.post('/comments', data),
  toggleVisibility: (id) => api.patch(`/comments/${id}/toggle`),
  delete: (id) => api.delete(`/comments/${id}`),
};

// Chat
export const chatAPI = {
  // DMs
  getMyAdminThread: () => api.get('/chat/my-thread'),
  sendDM: (data) => api.post('/chat/dm', data),
  getDMConversation: (userId) => api.get(`/chat/dm/${userId}`),
  getAllDMThreads: () => api.get('/chat/admin/threads'),
  deleteMessage: (messageId) => api.delete(`/chat/messages/${messageId}`),
  // Groups
  getMyGroups: () => api.get('/chat/groups'),
  createGroup: (data) => api.post('/chat/groups', data),
  updateGroup: (groupId, data) => api.patch(`/chat/groups/${groupId}`, data),
  deleteGroup: (groupId) => api.delete(`/chat/groups/${groupId}`),
  updateGroupAvatar: (groupId, avatar) => api.patch(`/chat/groups/${groupId}/avatar`, { avatar }),
  setGroupMode: (groupId, chatMode) => api.patch(`/chat/groups/${groupId}/mode`, { chatMode }),
  getGroupMessages: (groupId) => api.get(`/chat/groups/${groupId}/messages`),
  sendGroupMessage: (groupId, data) => api.post(`/chat/groups/${groupId}/messages`, data),
  addGroupMember: (groupId, userId) => api.post(`/chat/groups/${groupId}/members`, { userId }),
  removeGroupMember: (groupId, userId) => api.delete(`/chat/groups/${groupId}/members/${userId}`),
  pinMessage: (groupId, messageId) => api.post(`/chat/groups/${groupId}/pin/${messageId}`),
  reactToMessage: (groupId, messageId, emoji) => api.post(`/chat/groups/${groupId}/react/${messageId}`, { emoji }),
  deleteGroupMessage: (groupId, messageId) => api.delete(`/chat/groups/${groupId}/messages/${messageId}`),
  getAvailableUsers: () => api.get('/chat/users'),
  banUser: (userId) => api.patch(`/chat/users/${userId}/ban`),
  unbanUser: (userId) => api.patch(`/chat/users/${userId}/unban`),
};

// AI
export const aiAPI = {
  askRIA: (data) => api.post('/ai/ask-ria', data),
  getMissionVisuals: (placeName) => api.post('/ai/mission-visuals', { placeName }),
  getAnalytics: () => api.get('/ai/analytics'),
};

export default api;
