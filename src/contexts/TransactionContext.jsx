import { createContext, useState, useContext } from 'react';
import axios from 'axios';

const TransactionContext = createContext();

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]);

  const addTransaction = async (transactionData) => {
    try {
      const userId = localStorage.getItem('userId');
      const response = await axios.post('http://192.168.1.102:3001/api/transactions', transactionData, {
        headers: { 'user-id': userId }
      });
      setTransactions([...transactions, response.data]);
      return response.data;
    } catch (error) {
      console.error('Erro ao adicionar transação:', error);
      throw error;
    }
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
}

export const useTransactions = () => useContext(TransactionContext);