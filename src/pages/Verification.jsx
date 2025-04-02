import { API_URL } from '../config/api';
// ... outras importações ...

// Dentro da função de verificação:
try {
  const response = await fetch(`${API_URL}/api/verify-email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json' // Certifique-se de que o tipo de conteúdo está correto
    },
    body: JSON.stringify({ /* dados necessários para a verificação */ })
  });

  if (!response.ok) {
    throw new Error('Erro na verificação do email');
  }

  const data = await response.json();
  console.log('Verificação bem-sucedida:', data);
} catch (error) {
  console.error('Erro ao verificar email:', error);
}