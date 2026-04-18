import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('eduture_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem('eduture_refresh_token');
      const learnerId = localStorage.getItem('eduture_learner_id');
      if (refreshToken && learnerId) {
        try {
          const refreshed = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
            refresh_token: refreshToken,
            learner_id: Number(learnerId),
          });
          const payload = refreshed.data.data;
          localStorage.setItem('eduture_access_token', payload.access_token);
          localStorage.setItem('eduture_refresh_token', payload.refresh_token);
          originalRequest.headers.Authorization = `Bearer ${payload.access_token}`;
          return api(originalRequest);
        } catch (refreshError) {
          localStorage.removeItem('eduture_access_token');
          localStorage.removeItem('eduture_refresh_token');
          localStorage.removeItem('eduture_user');
          localStorage.removeItem('eduture_learner_id');
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
