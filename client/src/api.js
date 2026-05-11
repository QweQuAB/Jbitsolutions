const BASE = '/api';

function getToken() {
  return localStorage.getItem('admin_token');
}

async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Auth
  login: (username, password) => request('POST', '/auth/login', { username, password }),

  // Services (public)
  getServices: () => request('GET', '/services'),
  getAllServices: () => request('GET', '/services/all'),
  createService: (data) => request('POST', '/services', data),
  updateService: (id, data) => request('PUT', `/services/${id}`, data),
  deleteService: (id) => request('DELETE', `/services/${id}`),

  // Bookings
  createBooking: (data) => request('POST', '/bookings', data),
  getBookings: () => request('GET', '/bookings'),
  updateBookingStatus: (id, status) => request('PUT', `/bookings/${id}/status`, { status }),
  deleteBooking: (id) => request('DELETE', `/bookings/${id}`),

  // Feedback
  createFeedback: (data) => request('POST', '/feedback', data),
  getFeedback: () => request('GET', '/feedback'),
  deleteFeedback: (id) => request('DELETE', `/feedback/${id}`),

  // Stats & Logs
  getStats: () => request('GET', '/stats'),
  getAnalytics: () => request('GET', '/stats/analytics'),
  getLogs: (limit = 100, offset = 0) => request('GET', `/stats/logs?limit=${limit}&offset=${offset}`),

  // Guides
  getGuides: () => request('GET', '/guides'),
  createGuide: (data) => request('POST', '/guides', data),
  updateGuide: (id, data) => request('PUT', `/guides/${id}`, data),
  deleteGuide: (id) => request('DELETE', `/guides/${id}`),

  // Interactions (fire-and-forget, no auth)
  trackInteraction: (type, page, detail = null) => {
    fetch(`${BASE}/stats/interaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, page, detail }),
    }).catch(() => {});
  },
};
