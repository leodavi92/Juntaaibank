// Corrigir a importação do fetch para versão 2
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
  try {
    console.log('Testando endpoints da API...');
    
    // Testar o servidor
    const serverResponse = await fetch('http://localhost:3001/api/test-server');
    const serverData = await serverResponse.json();
    console.log('Teste do servidor:', serverData);
    
    // Testar o endpoint de teste do perfil
    const profileTestResponse = await fetch('http://localhost:3001/api/test-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Usuário Teste',
        phone: '123456789',
        cpf: '123.456.789-00',
        birthDate: '2000-01-01',
        address: 'Endereço de Teste'
      })
    });
    const profileTestData = await profileTestResponse.json();
    console.log('Endpoint de teste do perfil:', profileTestData);
    
    console.log('Todos os testes foram concluídos com sucesso!');
  } catch (error) {
    console.error('Erro ao testar a API:', error);
  }
}

testAPI();