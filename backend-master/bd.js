const { Sequelize, DataTypes } = require('sequelize');

// Configura a conexão com o banco de dados PostgreSQL
const sequelize = new Sequelize('teste', 'postgres', 'admin', {
  host: 'localhost',
  dialect: 'postgres',
  logging: false, // Desativa logs de SQL no console
});

// Define o modelo da tabela 'Tb_Usuario'
const Usuario = sequelize.define('Usuario', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  nome: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  senha: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  tipoUsuario: {
    type: DataTypes.INTEGER, // Ajustado para INTEGER
    allowNull: false,
  }
}, {
  tableName: 'Tb_Usuario',
  timestamps: false,
});

// Define o modelo da tabela 'Tb_Servico'
const Servico = sequelize.define('Servico', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  tiposervico: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2), // Definindo o tipo decimal com 2 casas decimais
    allowNull: false,
  }
}, {
  tableName: 'Tb_Servico',
  timestamps: false,
});

// Define o modelo da tabela 'Tb_Agendamento'
const Agendamento = sequelize.define('Agendamento', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  dthoraagendamento: {
    type: DataTypes.DATE, // Alterado para DataTypes.DATE
    allowNull: false,
  },
  dataatendimento: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  horario: {
    type: DataTypes.TIME,
    allowNull: false,
  },
  fk_usuario_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Tb_Usuario', // Nome da tabela referenciada
      key: 'id', // Coluna da tabela referenciada
    },
    allowNull: false,
  },
  fk_servico_id: {
    type: DataTypes.INTEGER,
    references: {
      model: 'Tb_Servico', // Nome da tabela referenciada
      key: 'id', // Coluna da tabela referenciada
    },
    allowNull: false,
  },
}, {
  tableName: 'Tb_Agendamento',
  timestamps: false,
});
// Define o modelo da view 'vw_agendamentos'
const VwAgendamentos = sequelize.define('VwAgendamentos', {
  agendamento_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
  },
  dthoraagendamento: {
    type: DataTypes.DATE,
  },
  dataatendimento: {
    type: DataTypes.DATE,
  },
  horario: {
    type: DataTypes.TIME,
  },
  usuario_id: {
    type: DataTypes.INTEGER,
  },
  usuario_nome: {
    type: DataTypes.STRING(100),
  },
  usuario_email: {
    type: DataTypes.STRING(100),
  }, 
  servico_id: {
    type: DataTypes.INTEGER,
  },
  tiposervico: {
    type: DataTypes.STRING(100),
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2),
  }
}, {
  tableName: 'vw_agendamentos',
  timestamps: false,
  freezeTableName: true,
});


// Testa a conexão com o banco de dados
sequelize.authenticate()
  .then(() => {
    console.log('Conexão com o banco de dados estabelecida.');
  })
  .catch(error => {
    console.error('Erro ao conectar ao banco de dados:', error);
  });

  module.exports = { Usuario, Agendamento, Servico, VwAgendamentos, sequelize };
