// ... existing code ...

const handleUpdatePersonalInfo = async () => {
  try {
    const result = await updateUserProfile({
      phone,
      cpf,
      birthDate,
      address,
      avatar
    });

    if (result.success) {
      toast.success('Perfil atualizado com sucesso!');
    } else {
      toast.error(result.message || 'Erro ao atualizar perfil');
      console.error('=== ERRO DETALHADO ===');
      console.error('Mensagem:', result.message);
    }
  } catch (error) {
    toast.error('Erro ao atualizar perfil');
    console.error('=== ERRO DETALHADO ===');
    console.error('Mensagem:', error.message);
    console.error('Stack:', error.stack);
  }
};

// ... rest of the code ...