import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Obter token e userId do localStorage
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        
        console.log('UserContext: Verificando token e userId');
        console.log('UserContext: Token disponível:', !!token);
        console.log('UserContext: UserId disponível:', !!userId);
        
        if (!token || !userId) {
          console.log('UserContext: Token ou userId não encontrados');
          setLoading(false);
          return;
        }

        console.log('UserContext: Buscando dados do usuário com ID:', userId);
        const response = await axios.get(`http://localhost:3001/api/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('UserContext: Dados do usuário recebidos:', response.data);
        setUser(response.data);
      } catch (error) {
        console.error('UserContext: Erro ao buscar dados do usuário:', error);
        // Se o erro for de autenticação, limpar o localStorage
        if (error.response && error.response.status === 401) {
          console.log('UserContext: Token inválido, limpando localStorage');
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Função para atualizar o usuário após o login
  const updateUserAfterLogin = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      if (!token || !userId) return;
      
      console.log('UserContext: Atualizando usuário após login');
      const response = await axios.get(`http://localhost:3001/api/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setUser(response.data);
    } catch (error) {
      console.error('UserContext: Erro ao atualizar usuário após login:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, loading, updateUserAfterLogin }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}