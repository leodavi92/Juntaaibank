import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const TransactionContext = createContext();

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]);

  // Carregar transações ao iniciar
  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async (isAdmin = false) => {
    try {
      const token = isAdmin ? 
        localStorage.getItem('adminToken') : 
        localStorage.getItem('token');

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      // Adicionar isAdmin apenas se for true
      if (isAdmin) {
        headers['X-Admin-Access'] = 'true'; // Mudando o nome do header
      }

      const response = await axios.get(
        'http://localhost:3001/api/transactions',
        { headers }
      );
      setTransactions(response.data);
    } catch (error) {
      console.error('Erro ao buscar transações:', error);
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

  return (
    <TransactionContext.Provider value={{ 
      transactions, 
      addTransaction,
      fetchTransactions 
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