// ... existing code ...

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const response = await fetch('http://localhost:3001/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include' // Adiciona suporte a cookies
    });
    // ... rest of the function
  } catch (error) {
    console.error('Erro:', error);
  }
};

// ... existing code ...