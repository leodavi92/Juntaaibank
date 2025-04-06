const fetchGroups = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:3001/api/groups', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    setGroups(response.data);
  } catch (error) {
    console.error('GroupContext: Erro ao buscar grupos:', error);
  }
};