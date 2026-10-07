const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// O banco fica na pasta do projeto, mesmo quando iniciado de outro diretório.
const arquivo = path.resolve(__dirname, process.env.DB_FILE || 'banco.db');
const db = new DatabaseSync(arquivo);

// Compatibilidade com os cadastros antigos: renomeia a coluna sem apagar dados.
const colunas = db.prepare('PRAGMA table_info(produto)').all();
if (colunas.some(coluna => coluna.name === 'id')) {
  db.exec('ALTER TABLE produto RENAME COLUMN id TO idProduto');
}

// Cria a estrutura apenas se necessário; os dados persistem entre execuções.
db.exec(fs.readFileSync(path.join(__dirname, 'database.sql'), 'utf8'));

module.exports = db;
