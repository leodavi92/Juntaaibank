// Arquivo de teste para a rota de atualização de perfil
const axios = require('axios');
const API_BASE_URL = 'http://localhost:3001';

// Função para testar a atualização de perfil
async function testProfileUpdate() {
  try {
    console.log('=== TESTE DE ATUALIZAÇÃO DE PERFIL ===');
    
    // Primeiro, faça login para obter um token
    console.log('1. Fazendo login para obter token...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/login`, {
      email: 'lleandrodcampos@gmail.com',
      password: '123456'
    });
    
    console.log('Resposta do login:', JSON.stringify(loginResponse.data, null, 2));
    
    // Verificar se o login foi bem-sucedido de acordo com a estrutura real da resposta
    if (!loginResponse.data.token) {
      throw new Error('Falha no login: Token não encontrado na resposta');
    }
    
    const token = loginResponse.data.token;
    // Verificar se o objeto user existe antes de acessar o id
    const userId = loginResponse.data.user?.id || loginResponse.data.userId;
    
    if (!userId) {
      throw new Error('ID do usuário não encontrado na resposta');
    }
    
    console.log('Login bem-sucedido!');
    console.log('Token:', token);
    console.log('UserId:', userId);
    
    // Agora, teste a rota de atualização de perfil
    console.log('\n2. Testando atualização de perfil...');
    const profileData = {
      phone: '(11) 98765-4321',
      cpf: '123.456.789-00',
      birthDate: '1990-01-01',
      address: 'Rua Exemplo, 123 - São Paulo, SP'
    };
    
    console.log('Dados a serem enviados:', profileData);
    
    // Modificar a chamada PUT para usar a rota correta com o ID do token
    // Modificar a chamada PUT para usar a rota que funciona
    // Mude esta linha:
    const updateResponse = await axios.put(
      `${API_BASE_URL}/api/profile`,
      {
        ...profileData,
        avatar: {
          iconName: "Pets",
          color: "#45B7D1"
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    console.log('\n3. Resposta da atualização:');
    console.log('Status:', updateResponse.status);
    console.log('Dados:', JSON.stringify(updateResponse.data, null, 2));
    
    if (updateResponse.data.success) {
      console.log('\n✅ TESTE BEM-SUCEDIDO: Perfil atualizado com sucesso!');
    } else {
      console.log('\n❌ TESTE FALHOU: Não foi possível atualizar o perfil');
    }
    
    return updateResponse.data;
  } catch (error) {
    console.error('\n❌ ERRO NO TESTE:');
    console.error('Mensagem:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('Sem resposta do servidor');
    }
    throw error;
  }
}

// Executar o teste
testProfileUpdate()
  .then(result => {
    console.log('\nTeste concluído!');
  })
  .catch(error => {
    console.error('\nTeste falhou com erro!');
  });