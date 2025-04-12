const updateGroupBalance = async (groupId, amount, transactionId) => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.put(
      `${API_URL}/api/admin/groups/${groupId}/balance`,
      { amount, transactionId },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'x-admin-access': 'true',
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar saldo:', error);
    throw error;
  }
};