import api from '../services/api';
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const TransactionContext = createContext();

export const TransactionProvider = ({ children }) => {
  const [transactions, setTransactions] = useState([]);

  const fetchTransactions = async (isAdmin = false) => {
    try {
      // Usar o token correto
      const token = localStorage.getItem('token');
      
      console.log('Token encontrado:', token ? 'Sim' : 'Não'); // Debug
      console.log('É requisição admin?', isAdmin); // Debug

      if (!token) {
        console.error('Token não encontrado no localStorage');
        throw new Error('Token não encontrado');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'x-admin-access': isAdmin ? 'true' : 'false',
        'Content-Type': 'application/json'
      };

      console.log('Headers da requisição:', headers); // Debug
      
      const response = await api.get('/transactions', { headers });
      setTransactions(response.data);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
      throw error;
    }
  };

  const checkPendingTransactions = async (groupId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const response = await api.get(`/transactions?groupId=${groupId}`, { headers });
      // Filtrar transações pendentes
      const pendingTransactions = response.data.filter(transaction => transaction.status === 'pending');
      return pendingTransactions.length > 0; // Retorna true se houver transações pendentes
    } catch (error) {
      console.error('Erro ao verificar transações pendentes:', error);
      throw error;
    }
  };

  // Na função addTransaction do contexto
  const addTransaction = async (transactionData) => {
    try {
      console.log('Enviando dados de transação:', transactionData);
      
      const response = await api.post('/transactions', transactionData);
      
      if (response.data) {
        console.log('Transação criada com sucesso:', response.data);
        return response.data;
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      throw error;
    }
  };

  const updateTransaction = async (transactionId, updateData) => {
    try {
      const token = localStorage.getItem('token');
      
      // Usar a instância api em vez de axios diretamente
      const response = await api.put(`/transactions/${transactionId}`, updateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-admin-access': 'true'
        }
      });
      
      console.log('Resposta da atualização:', response.data);
      
      // Atualizar o estado local
      setTransactions(prevTransactions => 
        prevTransactions.map(t => 
          t._id === transactionId ? { ...t, ...updateData } : t
        )
      );
      
      return response.data;
    } catch (error) {
      console.error('Erro ao atualizar transação:', error);
      throw error;
    }
  };

  const updateTransactionStatus = async (transactionId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
  
      const response = await api.put(`/transactions/${transactionId}`, { status: newStatus }, { headers });
      if (response.data) {
        setTransactions(prevTransactions => 
          prevTransactions.map(t => 
            t._id === transactionId ? { ...t, status: newStatus } : t
          )
        );
      }
    } catch (error) {
      console.error('Erro ao atualizar status da transação:', error);
      throw error;
    }
  };

  // Adicione a função updateTransaction ao objeto de contexto
  return (
    <TransactionContext.Provider value={{ 
      transactions, 
      addTransaction,
      fetchTransactions,
      updateTransaction,
      checkPendingTransactions
    }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions deve ser usado dentro de um TransactionProvider');
  }
  return context;
}

export { TransactionContext };

const handleDeposito = async (grupo) => {
  console.log('Grupo recebido:', grupo);
  try {
    const temTransacaoPendente = await checkPendingTransactions(grupo._id);
    if (temTransacaoPendente) {
      alert('Você já possui um depósito pendente neste grupo. Aguarde a aprovação do administrador.');
      return;
    }
    setGrupoSelecionado(grupo);
    setDepositoOpen(true);
  } catch (error) {
    console.error('Erro ao verificar transações pendentes:', error);
    alert('Erro ao verificar transações pendentes. Tente novamente.');
  }
};