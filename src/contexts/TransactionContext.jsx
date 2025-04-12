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

  const addTransaction = async (transactionData) => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Usuário não autenticado');
      }

      // Simplificar os dados enviados
      const dados = {
        type: transactionData.type,
        amount: Number(transactionData.amount),
        groupId: transactionData.groupId.toString(), // Garantir que seja string
        pixCode: transactionData.pixCode,
        status: transactionData.status,
        userId: localStorage.getItem('userId')
      };

      console.log('Dados da transação antes do envio:', dados);

      const response = await axios.post(
        'http://localhost:3001/api/transactions',
        dados,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        setTransactions(prev => [...prev, response.data]);
        return response.data;
      }
    } catch (error) {
      console.error('Erro detalhado:', error.response?.data);
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

  // Adicione a função updateTransaction ao objeto de contexto
  return (
    <TransactionContext.Provider value={{ 
      transactions, 
      addTransaction,
      fetchTransactions,
      updateTransaction // Adicionar a função updateTransaction aqui
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