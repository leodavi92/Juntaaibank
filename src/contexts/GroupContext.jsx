import { createContext, useState, useContext } from 'react';

const GroupContext = createContext();

export function GroupProvider({ children }) {
  const [grupos, setGrupos] = useState(() => {
    const savedGrupos = localStorage.getItem('grupos');
    return savedGrupos ? JSON.parse(savedGrupos) : [{
      id: 1,
      nome: "Viagem Família",
      meta: 5000,
      saldoAtual: 2500,
      membros: [
        { id: 1, nome: "Você", contribuicao: 1000 },
        { id: 2, nome: "João", contribuicao: 1000 },
        { id: 3, nome: "Maria", contribuicao: 1500 }
      ],
      admin: true,
      saquesPendentes: []
    }];
  });

  const updateGroupBalance = async (groupName, amount, userName) => {
    try {
      const valorNumerico = Number(amount);
      
      const gruposAtualizados = grupos.map(grupo => {
        if (grupo.nome === groupName) {
          const novoSaldo = Number(grupo.saldoAtual) + valorNumerico;
          
          return {
            ...grupo,
            saldoAtual: novoSaldo,
            membros: grupo.membros.map(membro => 
              membro.nome === "Você" 
                ? { ...membro, contribuicao: Number(membro.contribuicao) + valorNumerico }
                : membro
            )
          };
        }
        return grupo;
      });

      localStorage.setItem('grupos', JSON.stringify(gruposAtualizados));
      setGrupos(gruposAtualizados);
      
      return true;
    } catch (error) {
      console.error('Erro na atualização:', error);
      return false;
    }
  };

  return (
    <GroupContext.Provider value={{ grupos, setGrupos, updateGroupBalance }}>
      {children}
    </GroupContext.Provider>
  );
}

export function useGroups() {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroups must be used within a GroupProvider');
  }
  return context;
}