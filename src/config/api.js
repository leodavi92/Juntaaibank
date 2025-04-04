const API_BASE_URL = 'http://localhost:3001';
const FRONTEND_URL = 'http://localhost:5173';

export const API_URLS = {
  login: `${API_BASE_URL}/api/login`,
  users: `${API_BASE_URL}/api/users`,
  groups: `${API_BASE_URL}/api/groups`,
  resetPassword: `${API_BASE_URL}/api/reset-password`,
  frontendResetPassword: `${FRONTEND_URL}/reset-password`
};

export default API_BASE_URL;
export { FRONTEND_URL };