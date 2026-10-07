-- SQLite: executado automaticamente por db.js, sem apagar dados existentes.
CREATE TABLE IF NOT EXISTS produto (
  idProduto  INTEGER PRIMARY KEY AUTOINCREMENT,
  nome       TEXT NOT NULL,
  descricao  TEXT,
  categoria  TEXT NOT NULL,
  preco      REAL NOT NULL,
  quantidade INTEGER NOT NULL,

  -- Reforça no banco as validações feitas pelo servidor.
  CONSTRAINT chk_produto_nome_nao_vazio CHECK (TRIM(nome) <> ''),
  CONSTRAINT chk_produto_categoria_nao_vazia CHECK (TRIM(categoria) <> ''),
  CONSTRAINT chk_produto_preco_positivo CHECK (preco > 0),
  CONSTRAINT chk_produto_quantidade_nao_negativa
    CHECK (quantidade >= 0 AND typeof(quantidade) = 'integer')
-- STRICT impede armazenar tipos incompatíveis com as colunas.
) STRICT;
