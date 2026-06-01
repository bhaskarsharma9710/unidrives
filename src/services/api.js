import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  withCredentials: false,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem("ecovan_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("ecovan_token");
      localStorage.removeItem("ecovan_user");
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authAPI = {
  register:        (data)       => API.post("/auth/register", data),
  login:           (data)       => API.post("/auth/login", data),
  getMe:           ()           => API.get("/auth/me"),
  seedAdmin:       ()           => API.post("/auth/seed-admin"),
  // Admin user management
  getAllUsers:      ()           => API.get("/auth/users"),
  updateUserRole:  (id, role)   => API.put(`/auth/users/${id}/role`, { role }),
  deleteUser:      (id)         => API.delete(`/auth/users/${id}`),
};

// ── Vans ──────────────────────────────────────────────────────────────────────
export const vanAPI = {
  getAll:          (params)     => API.get("/vans", { params }),
  getOne:          (id)         => API.get(`/vans/${id}`),
  create:          (data)       => API.post("/vans", data),
  update:          (id, data)   => API.put(`/vans/${id}`, data),
  remove:          (id)         => API.delete(`/vans/${id}`),
  updateLocation:  (id, loc)    => API.put(`/vans/${id}/location`, loc),
};

// ── Bookings ──────────────────────────────────────────────────────────────────
export const bookingAPI = {
  createOrder:      (data)      => API.post("/bookings/create-order", data),
  verifyPayment:    (data)      => API.post("/bookings/verify-payment", data),
  getMyBookings:    ()          => API.get("/bookings/my-bookings"),
  getAll:           (params)    => API.get("/bookings", { params }),
  cancel:           (id)        => API.delete(`/bookings/${id}`),
  updateStatus:     (id, data)  => API.put(`/bookings/${id}/status`, data),
  getVanAssignment: (vanNumber) => API.get(`/bookings/van-assignment`, { params: { vanNumber } }),
};

// ── Drivers ───────────────────────────────────────────────────────────────────
export const driverAPI = {
  // Driver self
  getTripDetails:       ()          => API.get("/drivers/trip-details"),
  getMyStats:           ()          => API.get("/drivers/my-stats"),
  getMyProfile:         ()          => API.get("/drivers/my-profile"),
  toggleOnline:         ()          => API.put("/drivers/toggle-online"),
  acceptRide:           (bookingId) => API.post(`/drivers/accept-ride/${bookingId}`),
  declineRide:          (bookingId) => API.post(`/drivers/decline-ride/${bookingId}`),
  startTrip:            (vanId)     => API.put(`/drivers/start-trip/${vanId}`),
  completeTrip:         (vanId)     => API.put(`/drivers/complete-trip/${vanId}`),
  getMyAssignments:     ()          => API.get("/drivers/my-assignments"),
  acknowledgeAssignment:(id)        => API.put(`/drivers/assignments/${id}/acknowledge`),
  // Admin
  getAll:               ()          => API.get("/drivers"),
  create:               (data)      => API.post("/drivers", data),
  update:               (id, data)  => API.put(`/drivers/${id}`, data),
  remove:               (id)        => API.delete(`/drivers/${id}`),
  verify:               (id, val)   => API.put(`/drivers/${id}/verify`, { isVerified: val }),
  assignRide:           (id, data)  => API.post(`/drivers/${id}/assign-ride`, data),
  getDriverAssignments: (id)        => API.get(`/drivers/${id}/assignments`),
  cancelAssignment:     (id)        => API.delete(`/drivers/assignments/${id}`),
};

export default API;
