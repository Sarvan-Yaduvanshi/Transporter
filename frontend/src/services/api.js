import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthToken = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) return null;
  return currentUser.getIdToken();
};

const request = async (path, options = {}) => {
  const token = await getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json') ? await response.json() : null;

  if (!response.ok) {
    const message = payload?.message || payload?.error || 'Request failed';
    throw new Error(message);
  }

  return payload;
};

export const authGoogle = async (firebaseToken) =>
  request('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ token: firebaseToken })
  });
















































































































/* ─── Dashboard ─────────────────────────────────── */

export const getDashboard = () =>
request('/dashboard');

/* ─── Permits ───────────────────────────────────── */

export const getPermits = () =>
request('/permits');

export const getActivePermits = () =>
request('/permits/active');

export const getPermitByNumber = (pn) =>
request(`/permits/${pn}`);

/* ─── Trucks ────────────────────────────────────── */

export const getTrucks = () =>
request('/trucks');

export const getApprovedTrucks = () =>
request('/trucks/approved');

export const createTruck = (data) =>
request('/trucks', { method: 'POST', body: JSON.stringify(data) });

export const updateTruck = (truckNumber, data) =>
request(`/trucks/${truckNumber}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteTruck = (truckNumber) =>
request(`/trucks/${truckNumber}`, { method: 'DELETE' });

/* ─── Loads ─────────────────────────────────────── */

export const getLoads = (permitNumber) =>
request(permitNumber ? `/loads?permitNumber=${permitNumber}` : '/loads');

export const createLoad = (data) =>
request('/loads', { method: 'POST', body: JSON.stringify(data) });

export const updateLoad = (loadId, data) =>
request(`/loads/${loadId}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteLoad = (loadId) =>
request(`/loads/${loadId}`, { method: 'DELETE' });

/* ─── Tags ──────────────────────────────────────── */

export const getTags = (permitNumber) =>
request(permitNumber ? `/tags?permitNumber=${permitNumber}` : '/tags');

export const createTag = (data) =>
request('/tags', { method: 'POST', body: JSON.stringify(data) });

export const updateTag = (id, data) =>
request(`/tags/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteTag = (id) =>
request(`/tags/${id}`, { method: 'DELETE' });

/* ─── Flags ─────────────────────────────────────── */

export const getFlags = (permitNumber) =>
request(permitNumber ? `/flags?permitNumber=${permitNumber}` : '/flags');

export const createFlag = (data) =>
request('/flags', { method: 'POST', body: JSON.stringify(data) });

export const updateFlag = (id, data) =>
request(`/flags/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteFlag = (id) =>
request(`/flags/${id}`, { method: 'DELETE' });

/* ─── Payments ──────────────────────────────────── */

export const getPaymentPermits = () =>
request('/payments');

export const getPaymentDetail = (pn) =>
request(`/payments/${pn}`);

export const updatePaymentStatus = (pn, paymentStatus) =>
request(`/payments/${pn}`, {
  method: 'PUT',
  body: JSON.stringify({ paymentStatus })
});

/* ─── Mines ─────────────────────────────────────── */

export const getMines = () =>
request('/mines');

/* ─── Drivers ───────────────────────────────────── */













export const getDrivers = () =>
request('/drivers');

export const createDriver = (data) =>
request('/drivers', { method: 'POST', body: JSON.stringify(data) });

export const updateDriver = (licenseNumber, data) =>
request(`/drivers/${licenseNumber}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteDriver = (licenseNumber) =>
request(`/drivers/${licenseNumber}`, { method: 'DELETE' });

/* ─── Documents (Personal & Truck) ──────────────── */













export const getDocuments = (ownerType, ownerId) => {
  const params = new URLSearchParams();
  if (ownerType) params.set('ownerType', ownerType);
  if (ownerId) params.set('ownerId', ownerId);
  const qs = params.toString();
  return request(`/documents${qs ? `?${qs}` : ''}`);
};

export const createDocument = (data) =>
request('/documents', { method: 'POST', body: JSON.stringify(data) });

export const updateDocument = (id, data) =>
request(`/documents/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteDocument = (id) =>
request(`/documents/${id}`, { method: 'DELETE' });

/* ─── Auth ──────────────────────────────────────── */



















export const authSignup = (data) =>
request('/auth/signup', { method: 'POST', body: JSON.stringify(data) });

export const authLogin = (data) =>
request('/auth/login', { method: 'POST', body: JSON.stringify(data) });

export const authGoogleOAuth = (data) =>
request('/auth/google', { method: 'POST', body: JSON.stringify(data) });

export const authFacebook = (data) =>
request('/auth/facebook', { method: 'POST', body: JSON.stringify(data) });

export const authMe = () =>
request('/auth/me');

/* ─── Phone OTP Auth ────────────────────────────── */






export const authSendOtp = (phone) =>
request('/auth/send-otp', {
  method: 'POST',
  body: JSON.stringify({ phone })
});

export const authVerifyOtp = (data) =>
request('/auth/verify-otp', {
  method: 'POST',
  body: JSON.stringify(data)
});

export const authUpdateProfile = (data) =>
request('/auth/profile', {
  method: 'PUT',
  body: JSON.stringify(data)
});

/* ─── Notifications ─────────────────────────────── */













export const getNotifications = (hours) =>
request(hours ? `/notifications?hours=${hours}` : '/notifications');

export const getUnreadCount = () =>
request('/notifications/unread-count');

export const markNotificationRead = (id) =>
request(`/notifications/${id}/read`, { method: 'PUT' });

export const markAllNotificationsRead = () =>
request('/notifications/read-all', { method: 'PUT' });

export const clearAllNotifications = () =>
request('/notifications/clear-all', { method: 'DELETE' });
