# Conecta Informática

Aplicação web para cadastro e controle de produtos, desenvolvida com Node.js, Express e SQLite.

## Funcionalidades

- Cadastro, listagem e consulta de produtos por ID.
- Edição dos dados e exclusão com confirmação.
- Validação de nome, categoria, preço e quantidade no servidor.
- Armazenamento local com persistência entre reinicializações.
- Interface responsiva em HTML, CSS e JavaScript.

## Requisitos

Node.js 22.13 ou superior, com npm.

## Instalação e execução

Na pasta do projeto:

```sh
npm ci
npm start
```

Acesse http://localhost:3000. Para desenvolvimento com reinício automático do servidor:

```sh
npm run dev
```

## Configuração

A configuração é opcional. Para personalizar os valores, crie um `.env` a partir de `.env.example`.

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `PORT` | `3000` | Porta do servidor HTTP. |
| `DB_FILE` | `banco.db` | Caminho do arquivo SQLite. |

Os caminhos relativos de `DB_FILE` são resolvidos a partir da pasta do projeto. O arquivo do banco e a tabela `produto` são criados automaticamente, sem executar SQL manualmente. O identificador `idProduto` é gerado pelo banco.

## API

As requisições de cadastro e atualização recebem JSON com `nome`, `descricao`, `categoria`, `preco` e `quantidade`. A descrição é opcional. Nome e categoria não podem ficar em branco, o preço deve ser positivo e a quantidade deve ser um inteiro não negativo.

| Método | Rota | Operação |
| --- | --- | --- |
| POST | `/produtos` | Cadastrar produto. |
| GET | `/produtos` | Listar produtos. |
| GET | `/produtos/:id` | Consultar produto. |
| PUT | `/produtos/:id` | Atualizar produto. |
| DELETE | `/produtos/:id` | Excluir produto. |

As respostas usam JSON. Dados inválidos retornam HTTP 400; produtos inexistentes retornam HTTP 404.

## Estrutura

- `server.js`: servidor HTTP, rotas e validações.
- `db.js`: conexão SQLite e inicialização do banco.
- `database.sql`: definição da tabela e restrições.
- `public/`: interface e comunicação com a API.

## Verificação

```sh
node --check server.js
node --check db.js
node --check public/script.js
```

Os arquivos locais de configuração, banco de dados, backups e dependências são excluídos do versionamento pelo `.gitignore`.
