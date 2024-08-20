const express = require('express'); // Importa o módulo express
const app = express(); // Cria uma instância do express
const port = 3000; // Define a porta em que o servidor irá rodar

// Array de exemplo com alguns servidores
let servidores = [
  { id: 1, nome: "Ana Maria Silva", cargo: "Professor", departamento: "Educação" , },
  { id: 2, nome: "Carlos Eduardo Santos", cargo: "Policial", departamento: "Segurança Pública" },
  { id: 3, nome: "Mariana Oliveira", cargo: "Médico", departamento: "Saúde" },
];

// Middleware para permitir acesso a partir de qualquer origem (CORS)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*"); // Permite acesso de qualquer origem
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization"); // Permite esses cabeçalhos na requisição, incluindo Authorization
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS"); // Permite esses métodos HTTP
  if (req.method === 'OPTIONS') { // Verifica se o método é OPTIONS
    return res.sendStatus(200); // Responde com status 200 OK para requisições OPTIONS
  }
  next(); // Chama o próximo middleware
});

// Middleware para processar JSON no corpo da requisição
app.use(express.json()); // Habilita o processamento de JSON nas requisições

// Rota para obter todos os servidores
app.get('/servidores/listar', (req, res) => {
  res.json(servidores); // Responde com o array de servidores em formato JSON
});

// Rota para obter um servidor por ID
app.get('/servidores/listarServidor/:id', (req, res) => {
  const id = parseInt(req.params.id); // Converte o parâmetro ID para um número inteiro
  console.log(`Recebida requisição GET para ID: ${id}`); // Loga o ID recebido
  const servidor = servidores.find(s => s.id === id); // Encontra o servidor com o ID especificado
  if (servidor) {
    res.json(servidor); // Responde com os dados do servidor encontrado
  } else {
    res.status(404).send('Servidor não encontrado'); // Responde com status 404 se o servidor não for encontrado
  }
});

// Rota para adicionar um novo servidor
app.post('/servidores/inserir', (req, res) => {
  const novoServidor = req.body; // Obtém o novo servidor do corpo da requisição
  novoServidor.id = servidores.length ? servidores[servidores.length - 1].id + 1 : 1; // Define o ID do novo servidor
  servidores.push(novoServidor); // Adiciona o novo servidor ao array
  res.status(201).json(novoServidor); // Responde com status 201 e o novo servidor em formato JSON
});

// Rota para atualizar um servidor existente
app.put('/servidores/atualizar/:id', (req, res) => {
  const id = parseInt(req.params.id); // Converte o parâmetro ID para um número inteiro
  console.log(`Recebida requisição PUT para ID: ${id} com dados: `, req.body); // Loga o ID e os dados recebidos
  const index = servidores.findIndex(s => s.id === id); // Encontra o índice do servidor com o ID especificado
  if (index !== -1) {
    servidores[index] = { ...servidores[index], ...req.body }; // Atualiza o servidor com os novos dados
    res.json(servidores[index]); // Responde com o servidor atualizado
  } else {
    res.status(404).send('Servidor não encontrado'); // Responde com status 404 se o servidor não for encontrado
  }
});

// Rota para excluir um servidor
app.delete('/servidores/deletar/:id', (req, res) => {
  const id = parseInt(req.params.id); // Converte o parâmetro ID para um número inteiro
  console.log(`Recebida requisição DELETE para ID: ${id}`); // Loga o ID recebido
  const index = servidores.findIndex(s => s.id === id); // Encontra o índice do servidor com o ID especificado
  if (index !== -1) {
    servidores.splice(index, 1); // Remove o servidor do array
    res.status(204).send(); // Responde com status 204 No Content
  } else {
    res.status(404).send('Servidor não encontrado'); // Responde com status 404 se o servidor não for encontrado
  }
});

// Inicia o servidor na porta especificada
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`); // Loga a URL do servidor
});
