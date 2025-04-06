// Definir a URL base da API
const API_BASE_URL = 'http://localhost:3001';

// Adicionar objeto API_URLS com endpoints específicos
export const API_URLS = {
  login: `${API_BASE_URL}/api/login`,
  register: `${API_BASE_URL}/api/register`,
  profile: `${API_BASE_URL}/api/profile`,
  users: `${API_BASE_URL}/api/users`,
  groups: `${API_BASE_URL}/api/groups`,
  transactions: `${API_BASE_URL}/api/transactions`,
  // Adicione outros endpoints conforme necessário
};

// Manter a exportação padrão existente
export default API_BASE_URL;