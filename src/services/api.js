import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Adicionar um interceptor para configurar headers em requisições admin
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  const isAdmin = localStorage.getItem('isAdmin');
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  if (isAdmin === 'true') {
    config.headers['x-admin-access'] = 'true';
  }
  
  return config;
});

export default api;