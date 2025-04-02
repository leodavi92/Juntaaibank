import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar se o usuário está autenticado ao carregar a página
    const token = localStorage.getItem('userToken');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    
    if (token && userId) {
      setUser({
        id: userId,
        name: userName,
        token
      });
    }
    
    setLoading(false);
  }, []);

  const login = (userData) => {
    // Salvar dados do usuário no localStorage
    localStorage.setItem('userToken', userData.token);
    localStorage.setItem('userId', userData.userId);
    localStorage.setItem('userName', userData.name);
    
    setUser({
      id: userData.userId,
      name: userData.name,
      token: userData.token
    });
    
    navigate('/dashboard');
  };

  const logout = () => {
    // Limpar dados do usuário do localStorage
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    
    setUser(null);
    navigate('/login');
  };

  const isAuthenticated = () => {
    return !!user;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}