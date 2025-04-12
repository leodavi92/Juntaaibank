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
      
      const response = await axios.get('http://localhost:3001/api/groups', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Verificar se os dados dos membros estão sendo retornados corretamente
      if (response.data && response.data.length > 0) {
        response.data.forEach(group => {
          if (group.members) {
            console.log('Detalhes dos membros do grupo:', group.name, group.members.map(member => ({
              nome: member.userId?.name,
              email: member.userId?.email,
              avatar: member.userId?.avatar
            })));
          }
        });
      }
  
      console.log('GroupContext - Dados completos dos grupos:', response.data);
      console.log('GroupContext - Membros do primeiro grupo:', response.data[0]?.members);
      
      setGroups(response.data);
      setError(null);
    } catch (error) {
      console.error('GroupContext: Erro ao buscar grupos:', error);
      setError('Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  };

  // Atualizar a função updateGroupBalance para aceitar o token de admin
  // Atualizar a função updateGroupBalance para usar axios em vez de api
  // Atualizar a função updateGroupBalance para usar a URL correta
  // Atualizar a função updateGroupBalance para incluir o cabeçalho x-admin-access
  // Atualizar a função updateGroupBalance para incluir o transactionId
  // Adicionar mais logs para depuração
  const updateGroupBalance = async (groupId, amount, userId, adminToken = null, transactionId = null) => {
    try {
      // Se um token de admin for fornecido, usá-lo
      const token = adminToken || localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token de administrador não encontrado');
      }
      
      // Log detalhado dos dados enviados
      console.log('Dados enviados para atualização do saldo:', { 
        groupId, 
        amount, 
        userId, 
        transactionId,
        token: token ? 'Token presente' : 'Token ausente' 
      });
      
      // Corrigir a URL - o problema é que groupId pode ser um objeto em vez de um ID
      const id = typeof groupId === 'object' ? groupId._id : groupId;
      
      console.log('ID do grupo após processamento:', id);
      
      // Incluir o transactionId no corpo da requisição
      const response = await axios.put(`http://localhost:3001/api/admin/groups/${id}/balance`, {
        amount,
        userId,
        transactionId
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-admin-access': 'true'
        }
      });
      
      console.log('Resposta do servidor:', response.data);
      
      if (response.status === 200) {
        // Atualizar o estado local dos grupos
        setGroups(prevGroups => 
          prevGroups.map(group => 
            group._id === id 
              ? { ...group, balance: group.balance + Number(amount) } 
              : group
          )
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erro ao atualizar saldo do grupo:', error);
      console.error('Erro detalhado:', error.response?.data?.message || error.message);
      console.error('Dados da requisição que falhou:', error.config?.data);
      console.error('URL da requisição que falhou:', error.config?.url);
      throw error;
    }
  };

  // Função para criar um novo grupo
  const criarGrupo = async (grupoData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token não encontrado');
      }
      
      // Na função fetchGroups
      const response = await fetch('/api/groups', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      console.log('Dados dos grupos recebidos:', data); // Log para debug
      
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
      criarGrupo,
      updateGroupBalance // Adicionando a função ao contexto
    }}>
      {children}
    </GroupContext.Provider>
  );
}

// No final do arquivo, certifique-se que o export está correto
export function useGroups() {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroups deve ser usado dentro de um GroupProvider');
  }
  return context;
}