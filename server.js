const express = require('express');
const path = require('path');
const db = require('./db');
const app = express();

// A página e a API usam o mesmo servidor e os formulários enviam JSON.
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Valida o ID em todas as rotas que recebem /:id.
app.param('id', (req, res, next, id) => {
  if (!Number.isSafeInteger(Number(id)) || Number(id) <= 0) {
    return res.status(400).json({ erro: 'ID inválido.' });
  }
  req.idProduto = Number(id);
  next();
});

// POST e PUT compartilham as regras; a validação do navegador não substitui esta.
function validarProduto(req, res, next) {
  const { nome, descricao, categoria, preco, quantidade } = req.body || {};
  const numeroValido = valor =>
    (typeof valor === 'number' || typeof valor === 'string' && valor.trim() !== '') &&
    Number.isFinite(Number(valor));
  let erro;
  if (typeof nome !== 'string' || !nome.trim()) erro = 'O nome é obrigatório.';
  else if (typeof categoria !== 'string' || !categoria.trim()) erro = 'A categoria é obrigatória.';
  else if (descricao != null && typeof descricao !== 'string') erro = 'A descrição deve ser um texto.';
  else if (!numeroValido(preco) || Number(preco) <= 0) erro = 'O preço deve ser um número maior que zero.';
  else if (!numeroValido(quantidade) || !Number.isSafeInteger(Number(quantidade)) || Number(quantidade) < 0) {
    erro = 'A quantidade deve ser um número inteiro maior ou igual a zero.';
  }
  if (erro) return res.status(400).json({ erro });

  // Mantém a ordem dos valores igual à ordem das colunas nas consultas SQL.
  req.valores = [nome.trim(), descricao?.trim() || null, categoria.trim(), Number(preco), Number(quantidade)];
  next();
}

// CREATE: os ? recebem os dados separadamente do SQL; o banco gera o ID.
app.post('/produtos', validarProduto, (req, res) => {
  const resultado = db.prepare(`
    INSERT INTO produto (nome, descricao, categoria, preco, quantidade)
    VALUES (?, ?, ?, ?, ?)
  `).run(...req.valores);
  res.status(201).json({ idProduto: resultado.lastInsertRowid, mensagem: 'Produto cadastrado com sucesso!' });
});

// READ: lista todos os campos ou consulta um registro pelo identificador.
app.get('/produtos', (req, res) => {
  res.json(db.prepare('SELECT * FROM produto ORDER BY idProduto').all());
});

app.get('/produtos/:id', (req, res) => {
  const produto = db.prepare('SELECT * FROM produto WHERE idProduto = ?').get(req.idProduto);
  if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });
  res.json(produto);
});

// UPDATE: altera os dados, mantendo o identificador original.
app.put('/produtos/:id', validarProduto, (req, res) => {
  const resultado = db.prepare(`
    UPDATE produto SET nome = ?, descricao = ?, categoria = ?, preco = ?, quantidade = ?
    WHERE idProduto = ?
  `).run(...req.valores, req.idProduto);
  if (!resultado.changes) return res.status(404).json({ erro: 'Produto não encontrado.' });
  res.json({ mensagem: 'Produto atualizado com sucesso!' });
});

// DELETE: changes informa se o registro realmente existia e foi removido.
app.delete('/produtos/:id', (req, res) => {
  const resultado = db.prepare('DELETE FROM produto WHERE idProduto = ?').run(req.idProduto);
  if (!resultado.changes) return res.status(404).json({ erro: 'Produto não encontrado.' });
  res.json({ mensagem: 'Produto excluído com sucesso!' });
});

app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));

// Express encaminha falhas das rotas para este único tratamento de erros.
app.use((erro, req, res, next) => {
  console.error(erro.message);
  const status = erro.status || 500;
  const mensagem = erro.type === 'entity.parse.failed' ? 'JSON inválido.'
    : status === 413 ? 'Os dados enviados são muito grandes.'
    : 'Não foi possível concluir a operação no banco de dados.';
  res.status(status).json({ erro: mensagem });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Conecta Informática: http://localhost:${port}`));
