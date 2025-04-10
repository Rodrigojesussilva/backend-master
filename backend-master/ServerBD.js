const express = require('express');
const cors = require('cors');
const { Usuario, Agendamento, Servico, VwAgendamentos, sequelize } = require('./bd'); // Ajuste o caminho conforme necessário

const app = express();
const port = 3000; // Ajuste a porta conforme necessário

app.use(cors()); // Habilita CORS
app.use(express.json()); // Faz o parsing do JSON no corpo das requisições

// ---------------------- ROTAS PARA USUÁRIOS ----------------------
// Rota de login
app.post('/usuarios/login', async (req, res) => {
  console.log('Requisição recebida:', req.body); // Log para verificar os dados recebidos

  const { email, senha } = req.body;

  if (!email || !senha) {
    return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
  }

  try {
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    if (usuario.senha !== senha) {
      return res.status(401).json({ error: 'Senha incorreta.' });
    }

    res.json({
      message: 'Login realizado com sucesso!',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario,
      },
    });

  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: 'Erro ao tentar realizar o login.' });
  }
});

// Rota para obter todos os usuários
app.get('/usuarios', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll(); // Busca todos os usuários
    res.json(usuarios);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuários.' });
  }
});

// Rota para obter um usuário por ID
app.get('/usuario/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id); // Busca um usuário pelo ID
    if (usuario) {
      res.json(usuario);
    } else {
      res.status(404).send('Usuário não encontrado');
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar usuário.' });
  }
});
// Rota para criar um novo usuário
app.post('/usuario/inserir', async (req, res) => {
  try {
    const novoUsuario = await Usuario.create(req.body); // Cria um novo usuário
    console.log('Recebendo dados:', req.body); // Adicione este log
    res.status(201).json(novoUsuario);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao inserir usuário.' });
  }
});

// Rota para atualizar usuário
app.put('/usuarios/atualizar/:id', async (req, res) => {
  console.log('Requisição recebida para atualizar dados do usuário:', req.body); // Log para verificar os dados recebidos

  const { nome, email, senha, tipoUsuario } = req.body; // Inclui tipoUsuario
  const { id } = req.params; // Pegando o ID do usuário a ser atualizado da URL

  // Verifica se todos os campos necessários foram fornecidos
  if (!nome || !email || !senha || typeof tipoUsuario === 'undefined') { // tipoUsuario não pode ser undefined
    return res.status(400).json({ error: 'Nome, email, senha e tipo de usuário são obrigatórios.' });
  }

  try {
    // Encontrar o usuário pelo ID
    const usuario = await Usuario.findOne({ where: { id } });

    // Se o usuário não for encontrado
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Atualizar os dados do usuário
    usuario.nome = nome.trim();
    usuario.email = email.trim();
    usuario.senha = senha.trim();  // Aqui você pode implementar a lógica de hash para a senha se necessário
    usuario.tipoUsuario = tipoUsuario;  // Atualiza tipoUsuario também

    // Salvar as alterações no banco de dados
    await usuario.save();

    // Resposta de sucesso
    res.json({
      message: 'Dados do usuário atualizados com sucesso!',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        tipoUsuario: usuario.tipoUsuario, // Inclui tipoUsuario na resposta
      },
    });

  } catch (error) {
    console.error('Erro ao atualizar os dados do usuário:', error);
    res.status(500).json({ error: 'Erro ao tentar atualizar os dados do usuário.' });
  }
});

// Rota para alterar senha do usuário
app.put('/usuarios/alterar-senha', async (req, res) => {
  console.log('Requisição recebida para alterar senha:', req.body); // Log para verificar os dados recebidos

  const { email, senhaAtual, novaSenha } = req.body;

  // Verifica se todos os campos necessários foram fornecidos
  if (!email || !senhaAtual || !novaSenha) {
    return res.status(400).json({ error: 'Email, senha atual e nova senha são obrigatórios.' });
  }

  try {
    // Encontrar o usuário pelo e-mail
    const usuario = await Usuario.findOne({ where: { email } });

    // Se o usuário não for encontrado
    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    // Exibir valores antes da comparação para depuração
    console.log("usuario.senha (armazenada):", usuario.senha, "| Tipo:", typeof usuario.senha);
    console.log("senhaAtual (informada):", senhaAtual, "| Tipo:", typeof senhaAtual);

    // Comparar a senha atual com a senha armazenada
    if (usuario.senha.trim() !== senhaAtual.trim()) {
      return res.status(401).json({ error: 'Senha atual incorreta.' });
    }

    // Atualizar a senha do usuário
    usuario.senha = novaSenha.trim();
    await usuario.save(); // Salvando a nova senha no banco de dados

    // Resposta de sucesso
    res.json({
      message: 'Senha alterada com sucesso!',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });

  } catch (error) {
    console.error('Erro ao alterar a senha:', error);
    res.status(500).json({ error: 'Erro ao tentar alterar a senha.' });
  }
});

// Rota para redefinir senha do usuário
app.put('/usuarios/redefinir-senha', async (req, res) => {
  console.log('Requisição recebida para redefinir senha:', req.body); // Verifique o log
  const { email, novaSenha, confirmarSenha } = req.body;

  if (!email || !novaSenha || !confirmarSenha) {
    return res.status(400).json({ error: 'Email, nova senha e confirmação são obrigatórios.' });
  }

  if (novaSenha.trim() !== confirmarSenha.trim()) {
    return res.status(400).json({ error: 'As senhas não coincidem.' });
  }

  try {
    const usuario = await Usuario.findOne({ where: { email } });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    usuario.senha = novaSenha.trim();
    await usuario.save();

    res.json({
      message: 'Senha redefinida com sucesso!',
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
      },
    });
  } catch (error) {
    console.error('Erro ao redefinir a senha:', error);
    res.status(500).json({ error: 'Erro ao tentar redefinir a senha.' });
  }
});

// Rota para deletar um usuário
app.delete('/usuario/deletar/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id); // Busca um usuário pelo ID
    if (usuario) {
      await usuario.destroy(); // Deleta o usuário
      res.json({ message: 'Usuário deletado com sucesso.' });
    } else {
      res.status(404).send('Usuário não encontrado');
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar usuário.' });
  }
});

// ---------------------- ROTAS PARA AGENDAMENTOS ----------------------

// Rota para obter todos os agendamentos
app.get('/agendamentos', async (req, res) => {
  try {
    const agendamentos = await Agendamento.findAll();
    res.json(agendamentos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agendamentos.' });
  }
});

app.get('/agendamentos', async (req, res) => {
  try {
    const { tipo_usuario, email } = req.query;  // Pegando os parâmetros da query

    // Verifica se os parâmetros foram passados
    if (!tipo_usuario || !email) {
      return res.status(400).json({ error: 'Tipo de usuário e e-mail são obrigatórios.' });
    }

    // Busca agendamentos filtrados pelo tipo de usuário e email
    const agendamentos = await Agendamento.findAll({
      where: {
        tipo_usuario: tipo_usuario,  // Filtra pelo tipo de usuário
        email: email                  // Filtra pelo e-mail
      }
    });

    // Retorna os agendamentos encontrados
    res.json(agendamentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar agendamentos.' });
  }
});

// Rota para obter todos os agendamentos da view
app.get('/agendamentos_vw', async (req, res) => {
  try {
    const agendamentos = await VwAgendamentos.findAll(); // Busca todos os campos
    res.json(agendamentos); // Retorna os dados no formato JSON
  } catch (error) {
    console.error('Erro ao buscar agendamentos:', error);
    res.status(500).json({ error: 'Erro ao buscar agendamentos' });
  }
});

app.get('/agendamentosUser', async (req, res) => {
 try {
    const { email } = req.query;  // Pegando o parâmetro de email da query

    // Verifica se o e-mail foi passado
    if (!email) {
      return res.status(400).json({ error: 'O e-mail é obrigatório.' });
    }

    // Busca agendamentos filtrados apenas pelo e-mail
    const agendamentos = await VwAgendamentos.findAll({
      where: {
        usuario_email: email  // Filtra pelo e-mail
      }
    });

    // Retorna os agendamentos encontrados
    res.json(agendamentos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar agendamentos.' });
  }
});

// Rota para criar um novo agendamento
app.post('/agendamento/inserir', async (req, res) => {
  try {
    // Recebendo os dados do corpo da requisição
    const { dataAtendimento, dthoraAgendamento, horario, fk_usuario_id, fk_servico_id } = req.body;
    console.log('Dados recebidos para inserção:', req.body); // Log dos dados recebidos

    // 1. Convertendo o campo 'dataAtendimento' para o tipo 'DATE' adequado
    const dataAtendimentoFormatada = new Date(dataAtendimento);
    if (isNaN(dataAtendimentoFormatada.getTime())) {
      return res.status(400).json({ error: 'Data de atendimento inválida.' });
    }

    // 2. Convertendo o campo 'dthoraAgendamento' para o tipo 'DATE' adequado
    const dthoraAgendamentoFormatada = new Date(dthoraAgendamento);
    if (isNaN(dthoraAgendamentoFormatada.getTime())) {
      return res.status(400).json({ error: 'Data e hora de agendamento inválida.' });
    }

    // 3. O 'horario' já está no formato HH:mm:ss, então pode ser usado diretamente
    const horarioFormatado = horario; // Supondo que o formato já seja adequado

    // 4. Convertendo 'fk_usuario_id' e 'fk_servico_id' para números inteiros
    const fkUsuarioId = parseInt(fk_usuario_id, 10);
    const fkServicoId = parseInt(fk_servico_id, 10);
    
    if (isNaN(fkUsuarioId) || isNaN(fkServicoId)) {
      return res.status(400).json({ error: 'IDs de usuário ou serviço inválidos.' });
    }

    // Criando o novo agendamento no banco de dados com o mapeamento correto
    const agendamento = await Agendamento.create({
      dthoraagendamento: dthoraAgendamentoFormatada,  // Campo mapeado no banco
      dataatendimento: dataAtendimentoFormatada,      // Campo mapeado no banco
      horario: horarioFormatado,
      fk_usuario_id: fkUsuarioId,
      fk_servico_id: fkServicoId,
    });

    // Retorna o agendamento criado com status 201
    res.status(201).json(agendamento);
  } catch (error) {
    console.error('Erro ao inserir agendamento:', error);
    res.status(500).json({ error: 'Erro ao adicionar agendamento.' });
  }
});

// Rota para atualizar um agendamento
app.put('/agendamento/atualizar/:id', async (req, res) => {
  try {
    const agendamento = await Agendamento.findByPk(req.params.id);
    if (agendamento) {
      await agendamento.update(req.body);
      res.json(agendamento);
    } else {
      res.status(404).send('Agendamento não encontrado');
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar agendamento.' });
  }
});

// Rota para deletar um agendamento
app.delete('/agendamento/deletar/:id', async (req, res) => {
  try {
    const agendamento = await Agendamento.findByPk(req.params.id);
    if (agendamento) {
      await agendamento.destroy();
      res.json({ message: 'Agendamento deletado com sucesso.' });
    } else {
      res.status(404).send('Agendamento não encontrado');
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar agendamento.' });
  }
});

// ---------------------- ROTAS PARA SERVIÇOS ----------------------

// Rota para obter todos os serviços
app.get('/servicos', async (req, res) => {
  try {
    const servicos = await Servico.findAll();
    res.json(servicos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar serviços.' });
  }
});

// Rota para obter um serviço por ID
app.get('/servico/:id', async (req, res) => {
  try {
    const servico = await Servico.findByPk(req.params.id);
    if (servico) {
      res.json(servico);
    } else {
      res.status(404).send('Serviço não encontrado');
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar serviço.' });
  }
});

// Rota para criar um novo serviço
app.post('/servico/inserir', async (req, res) => {
  try {
    const novoServico = await Servico.create(req.body);
    res.status(201).json(novoServico);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao inserir serviço.' });
  }
});

// Rota para atualizar um serviço
app.put('/servico/atualizar/:id', async (req, res) => {
  try {
    const servico = await Servico.findByPk(req.params.id);
    if (servico) {
      await servico.update(req.body);
      res.json(servico);
    } else {
      res.status(404).send('Serviço não encontrado');
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar serviço.' });
  }
});

// Rota para deletar um serviço
app.delete('/servico/deletar/:id', async (req, res) => {
  try {
    const servico = await Servico.findByPk(req.params.id);
    if (servico) {
      await servico.destroy();
      res.json({ message: 'Serviço deletado com sucesso.' });
    } else {
      res.status(404).send('Serviço não encontrado');
    }
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar serviço.' });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
