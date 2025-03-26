import { createContext, useState, useContext } from 'react';

const TransactionContext = createContext();

export function TransactionProvider({ children }) {
  const [transactions, setTransactions] = useState([]);

  const updateTransaction = async (transactionId, updates) => {
    setTransactions(prevTransactions => {
      const updatedTransactions = prevTransactions.map(t => 
        t.id === transactionId ? { ...t, ...updates } : t
      );
      // Salvar no localStorage
      localStorage.setItem('transactions', JSON.stringify(updatedTransactions));
      return updatedTransactions;
    });

    // Emitir evento de atualização
    window.dispatchEvent(new CustomEvent('transactionUpdated'));
  };

  const addTransaction = (transaction) => {
    setTransactions(prev => [...prev, {
      id: Date.now(),
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      ...transaction
    }]);
  };

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, updateTransaction }}>
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
}