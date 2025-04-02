import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const GroupContext = createContext();

export function GroupProvider({ children }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const userId = localStorage.getItem('userId');
      
      console.log('GroupContext: Verificando token e userId');
      console.log('GroupContext: Token disponível:', !!token);
      console.log('GroupContext: UserId disponível:', !!userId);
      
      if (!token || !userId) {
        console.log('GroupContext: Token ou userId não encontrados');
        setLoading(false);
        return;
      }

      console.log('GroupContext: Buscando grupos do usuário');
      const response = await axios.get('http://localhost:3001/api/groups', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('GroupContext: Grupos recebidos:', response.data);
      setGroups(response.data);
      setError(null);
    } catch (error) {
      console.error('GroupContext: Erro ao buscar grupos:', error);
      setError('Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  };

  // Função para criar um novo grupo
  const criarGrupo = async (grupoData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token não encontrado');
      }
      
      const response = await axios.post('http://localhost:3001/api/groups', grupoData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('GroupContext: Grupo criado:', response.data);
      
      // Atualizar a lista de grupos após criar um novo
      await fetchGroups();
      
      return response.data;
    } catch (error) {
      console.error('GroupContext: Erro ao criar grupo:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <GroupContext.Provider value={{ 
      groups, 
      loading, 
      error, 
      fetchGroups,
      criarGrupo 
    }}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroups() {
  return useContext(GroupContext);
}