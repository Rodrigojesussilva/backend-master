const express = require('express');
const { Usuario, sequelize } = require('./bd'); // Importa o modelo e a conexão do Sequelize

const app = express();
const port = 3000;

app.use(express.json());

// Rota para obter todos os servidores
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll(); // Busca todos os registros da tabela
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar servidores.' });
  }
});

app.get('/usuario/:id', async (req, res) => {
  try {
    const usuarios = await Usuario.findByPk(req.params.id); // Busca um registro pelo ID
    if (usuarios) {
      res.json(usuarios);
    } else {
      res.status(404).send('Usuario não encontrado');
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuario.' });
  }
});

app.post('/usuario/inserir', async (req, res) => {
  try {
    const novoUsuario = await Usuario.create(req.body); // Insere um novo registro na tabela
    res.status(201).json(novoUsuario);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao inserir Usuario.' });
  }
});

app.put('/usuario/atualizar/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id); // Busca um registro pelo ID
    if (usuario) {
      await usuario.update(req.body); // Atualiza o registro com os novos dados
      res.json(usuario);
    } else {
      res.status(404).send('Servidor não encontrado');
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar servidor.' });
  }
});
app.delete('/usuario/deletar/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id); // Busca um registro pelo ID
    if (usuario) {
      await usuario.destroy(); // Deleta o registro encontrado
      res.json({ message: 'Usuario deletado com sucesso.' });
    } else {
      res.status(404).send('Usuario não encontrado');
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar Usuario.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
