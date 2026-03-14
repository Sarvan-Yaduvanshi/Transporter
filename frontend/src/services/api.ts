const BASE = '/api';

function authHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('token');
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

async function request<T>(url: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: authHeaders(),
    ...opts,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || `API ${res.status}`);
  }
  const json = await res.json();
  return json.data as T;
}

/* ─── Types ─────────────────────────────────────── */

export interface Route { from: string; to: string }

export interface Truck {
  _id: string;
  truckNumber: string;
  availabilityWindow: string;
  owner: string;
  driver: string;
  status: string;
}

export interface MineRoute {
  _id: string;
  from: string;
  to: string;
  activeTrucks: number;
  permitNumber: string;
}

export interface Mine {
  _id: string;
  name: string;
  routes: MineRoute[];
}

export interface PaymentSummary {
  totalLoads: number;
  completedLoads: number;
  pendingLoads: number;
  totalAmount: number;
}

export interface Permit {
  _id: string;
  permitNumber: string;
  route: Route;
  material: string;
  remainingTonnage: number;
  status: string;
  paymentSummary: PaymentSummary;
  paymentStatus: string;
}

export interface ActiveLoad {
  _id: string;
  loadId: string;
  permitNumber: string;
  truckNumber: string;
  currentStage: string;
  hasFlag: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PermitFull extends Permit {
  activeLoads: ActiveLoad[];
  flags: Flag[];
}

export interface Flag {
  _id: string;
  permitNumber: string;
  loadId: string;
  reason: string;
  status: string;
}

export interface Tag {
  _id: string;
  permitNumber: string;
  truckNumber: string;
  status: string;
  createdAt: string;
}

export interface DashboardData {
  /* transporter operational data */
  loadingTrucks: Record<string, { id: string; truckNumber: string }[]>;
  tags: Record<string, { id: string; truckNumber: string; status: string }[]>;
  mines: Mine[];

  /* full entity lists (desktop) */
  loads: ActiveLoad[];
  permits: PermitFull[];
  trucks: Truck[];
  flags: Flag[];

  /* unified stats for both dashboards */
  stats: {
    totalLoading: number;
    totalTagged: number;
    permitsReadyForPayment: number;
    activeDisputes: number;
    /* fleet (desktop) */
    totalTrucks: number;
    onLoad: number;
    idle: number;
    maintenance: number;
    totalActive: number;
    totalCompleted: number;
    totalFlagged: number;
  };
}

export interface PaymentPermit {
  permitNumber: string;
  route: Route;
  completedLoads: number;
  paymentStatus: string;
}

/* ─── Dashboard ─────────────────────────────────── */

export const getDashboard = () =>
  request<DashboardData>('/dashboard');

/* ─── Permits ───────────────────────────────────── */

export const getPermits = () =>
  request<PermitFull[]>('/permits');

export const getActivePermits = () =>
  request<Permit[]>('/permits/active');

export const getPermitByNumber = (pn: string) =>
  request<PermitFull>(`/permits/${pn}`);

/* ─── Trucks ────────────────────────────────────── */

export const getTrucks = () =>
  request<Truck[]>('/trucks');

export const getApprovedTrucks = () =>
  request<Truck[]>('/trucks/approved');

export const createTruck = (data: { truckNumber: string; owner?: string; driver?: string; status?: string; availabilityWindow?: string }) =>
  request<Truck>('/trucks', { method: 'POST', body: JSON.stringify(data) });

export const updateTruck = (truckNumber: string, data: Partial<Truck>) =>
  request<Truck>(`/trucks/${truckNumber}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteTruck = (truckNumber: string) =>
  request<void>(`/trucks/${truckNumber}`, { method: 'DELETE' });

/* ─── Loads ─────────────────────────────────────── */

export const getLoads = (permitNumber?: string) =>
  request<ActiveLoad[]>(permitNumber ? `/loads?permitNumber=${permitNumber}` : '/loads');

export const createLoad = (data: { loadId: string; permitNumber: string; truckNumber: string; currentStage?: string }) =>
  request<ActiveLoad>('/loads', { method: 'POST', body: JSON.stringify(data) });

export const updateLoad = (loadId: string, data: Partial<ActiveLoad>) =>
  request<ActiveLoad>(`/loads/${loadId}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteLoad = (loadId: string) =>
  request<void>(`/loads/${loadId}`, { method: 'DELETE' });

/* ─── Tags ──────────────────────────────────────── */

export const getTags = (permitNumber?: string) =>
  request<Tag[]>(permitNumber ? `/tags?permitNumber=${permitNumber}` : '/tags');

export const createTag = (data: { permitNumber: string; truckNumber: string }) =>
  request<Tag>('/tags', { method: 'POST', body: JSON.stringify(data) });

export const updateTag = (id: string, data: Partial<Tag>) =>
  request<Tag>(`/tags/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteTag = (id: string) =>
  request<void>(`/tags/${id}`, { method: 'DELETE' });

/* ─── Flags ─────────────────────────────────────── */

export const getFlags = (permitNumber?: string) =>
  request<Flag[]>(permitNumber ? `/flags?permitNumber=${permitNumber}` : '/flags');

export const createFlag = (data: { permitNumber: string; loadId: string; reason: string }) =>
  request<Flag>('/flags', { method: 'POST', body: JSON.stringify(data) });

export const updateFlag = (id: string, data: Partial<Flag>) =>
  request<Flag>(`/flags/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteFlag = (id: string) =>
  request<void>(`/flags/${id}`, { method: 'DELETE' });

/* ─── Payments ──────────────────────────────────── */

export const getPaymentPermits = () =>
  request<PaymentPermit[]>('/payments');

export const getPaymentDetail = (pn: string) =>
  request<Permit>(`/payments/${pn}`);

export const updatePaymentStatus = (pn: string, paymentStatus: string) =>
  request<Permit>(`/payments/${pn}`, {
    method: 'PUT',
    body: JSON.stringify({ paymentStatus }),
  });

/* ─── Mines ─────────────────────────────────────── */

export const getMines = () =>
  request<Mine[]>('/mines');

/* ─── Drivers ───────────────────────────────────── */

export interface Driver {
  _id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  licenseExpiry: string;
  assignedTruck: string;
  status: string;
  address: string;
  emergencyContact: string;
}

export const getDrivers = () =>
  request<Driver[]>('/drivers');

export const createDriver = (data: Partial<Driver>) =>
  request<Driver>('/drivers', { method: 'POST', body: JSON.stringify(data) });

export const updateDriver = (licenseNumber: string, data: Partial<Driver>) =>
  request<Driver>(`/drivers/${licenseNumber}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteDriver = (licenseNumber: string) =>
  request<void>(`/drivers/${licenseNumber}`, { method: 'DELETE' });

/* ─── Documents (Personal & Truck) ──────────────── */

export interface DriverDocument {
  _id: string;
  ownerType: 'Driver' | 'Truck';
  ownerId: string;
  docType: string;
  docNumber: string;
  issueDate: string;
  expiryDate: string;
  status: string;
  notes: string;
}

export const getDocuments = (ownerType?: string, ownerId?: string) => {
  const params = new URLSearchParams();
  if (ownerType) params.set('ownerType', ownerType);
  if (ownerId) params.set('ownerId', ownerId);
  const qs = params.toString();
  return request<DriverDocument[]>(`/documents${qs ? `?${qs}` : ''}`);
};

export const createDocument = (data: Partial<DriverDocument>) =>
  request<DriverDocument>('/documents', { method: 'POST', body: JSON.stringify(data) });

export const updateDocument = (id: string, data: Partial<DriverDocument>) =>
  request<DriverDocument>(`/documents/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteDocument = (id: string) =>
  request<void>(`/documents/${id}`, { method: 'DELETE' });

/* ─── Auth ──────────────────────────────────────── */

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  phone?: string | null;
  nickname?: string;
  role: 'Driver' | 'Transporter' | 'Admin';
  avatar: string;
  banner?: string;
  provider: 'local' | 'google' | 'facebook' | 'phone';
  createdAt?: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
}

export const authSignup = (data: { name: string; email: string; password: string; phone?: string }) =>
  request<AuthResponse>('/auth/signup', { method: 'POST', body: JSON.stringify(data) });

export const authLogin = (data: { email: string; password: string }) =>
  request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) });

export const authGoogle = (data: { googleId: string; name: string; email: string; avatar?: string }) =>
  request<AuthResponse>('/auth/google', { method: 'POST', body: JSON.stringify(data) });

export const authFacebook = (data: { facebookId: string; name: string; email: string; avatar?: string }) =>
  request<AuthResponse>('/auth/facebook', { method: 'POST', body: JSON.stringify(data) });

export const authMe = () =>
  request<AuthUser>('/auth/me');

/* ─── Phone OTP Auth ────────────────────────────── */

export interface SendOtpResponse {
  message: string;
  otp?: string; // available in dev mode only
}

export const authSendOtp = (phone: string) =>
  request<SendOtpResponse>('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });

export const authVerifyOtp = (data: { phone: string; otp: string; name?: string }) =>
  request<AuthResponse>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify(data),
  });

export const authUpdateProfile = (data: { nickname?: string; avatar?: string; banner?: string }) =>
  request<AuthUser>('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });

/* ─── Notifications ─────────────────────────────── */

export interface AppNotification {
  _id: string;
  userId: string;
  type: 'payment' | 'flag' | 'system';
  title: string;
  message: string;
  read: boolean;
  refId?: string;
  createdAt: string;
  updatedAt: string;
}

export const getNotifications = (hours?: number) =>
  request<AppNotification[]>(hours ? `/notifications?hours=${hours}` : '/notifications');

export const getUnreadCount = () =>
  request<{ count: number }>('/notifications/unread-count');

export const markNotificationRead = (id: string) =>
  request<AppNotification>(`/notifications/${id}/read`, { method: 'PUT' });

export const markAllNotificationsRead = () =>
  request<void>('/notifications/read-all', { method: 'PUT' });

export const clearAllNotifications = () =>
  request<void>('/notifications/clear-all', { method: 'DELETE' });
