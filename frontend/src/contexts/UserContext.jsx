const API_URL = 'http://192.168.1.102:3001'; // Backend na porta 3001

// Use API_URL em todas as chamadas, exemplo:
const updateAvatar = async (avatarData) => {
  const userId = localStorage.getItem('userId');
  const token = localStorage.getItem('token');
  
  try {
    console.log('Dados sendo enviados:', {
      userId,
      avatarData,
      url: `${API_URL}/api/users/${userId}/avatar`
    });

    const response = await axios.post(`${API_URL}/api/users/${userId}/avatar`, {
      avatarData: {
        iconName: avatarData.icon.type.muiName,
        color: avatarData.color
      }
    }, {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'user-id': userId,
        'Content-Type': 'application/json'
      }
    });

    console.log('Resposta do servidor:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar avatar:', error);
    throw error;
  }
};