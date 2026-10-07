const form = document.getElementById('form-produto');
const tabela = document.getElementById('tabela-produtos');
const mensagem = document.getElementById('mensagem');
const titulo = document.getElementById('form-titulo');
const cancelar = document.getElementById('btn-cancelar');
const resultadoBusca = document.getElementById('resultado-busca');
const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

function mostrarMensagem(texto, erro = false, destino = mensagem) {
  destino.textContent = texto;
  destino.className = erro ? 'erro' : 'sucesso';
}

// Centraliza JSON, erros HTTP e falhas de conexão para todas as operações.
async function requisicao(caminho = '', metodo = 'GET', dados) {
  let resposta;
  try {
    resposta = await fetch(`/produtos${caminho}`, {
      method: metodo,
      ...(dados ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dados) } : {})
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique se ele está rodando.');
  }
  const json = await resposta.json();
  if (!resposta.ok) throw new Error(json.erro || 'Não foi possível concluir a operação.');
  return json;
}

function limparFormulario() {
  form.reset();
  form.elements.idProduto.value = '';
  titulo.textContent = 'Novo produto';
  cancelar.hidden = true;
}

// textContent exibe os dados como texto, sem interpretar conteúdo como HTML.
async function carregarProdutos() {
  try {
    const produtos = await requisicao();
    tabela.replaceChildren();
    document.getElementById('sem-produtos').hidden = produtos.length !== 0;
    for (const produto of produtos) {
      const linha = tabela.insertRow();
      const valores = [produto.idProduto, produto.nome, produto.descricao || '-', produto.categoria, moeda.format(produto.preco), produto.quantidade];
      for (const valor of valores) linha.insertCell().textContent = valor;
      const acoes = linha.insertCell();
      for (const [texto, acao] of [['Editar', editar], ['Excluir', excluir]]) {
        const botao = document.createElement('button');
        botao.textContent = texto;
        botao.type = 'button';
        botao.addEventListener('click', () => acao(produto.idProduto));
        acoes.appendChild(botao);
      }
    }
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

// O mesmo formulário cadastra (POST) ou atualiza (PUT), conforme o ID oculto.
form.addEventListener('submit', async evento => {
  evento.preventDefault();
  const campos = form.elements;
  const id = campos.idProduto.value;
  const dados = {
    nome: campos.nome.value,
    descricao: campos.descricao.value,
    categoria: campos.categoria.value,
    preco: Number(campos.preco.value),
    quantidade: Number(campos.quantidade.value)
  };
  const salvar = form.querySelector('[type="submit"]');
  salvar.disabled = true;
  try {
    const resposta = await requisicao(id ? `/${id}` : '', id ? 'PUT' : 'POST', dados);
    limparFormulario();
    mostrarMensagem(resposta.mensagem);
    await carregarProdutos();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  } finally {
    salvar.disabled = false;
  }
});

// Preenche os campos e conserva o ID para atualizar o registro existente.
async function editar(id) {
  try {
    const produto = await requisicao(`/${id}`);
    for (const campo of ['idProduto', 'nome', 'descricao', 'categoria', 'preco', 'quantidade']) {
      form.elements[campo].value = produto[campo] ?? '';
    }
    titulo.textContent = `Editando produto ID ${id}`;
    cancelar.hidden = false;
    mensagem.textContent = '';
    form.elements.nome.focus();
    window.scrollTo(0, 0);
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

cancelar.addEventListener('click', limparFormulario);

// Cancelar a confirmação encerra a função antes de enviar DELETE ao servidor.
async function excluir(id) {
  if (!confirm(`Deseja realmente excluir o produto ID ${id}?`)) return;
  try {
    const resposta = await requisicao(`/${id}`, 'DELETE');
    if (Number(form.elements.idProduto.value) === id) limparFormulario();
    resultadoBusca.textContent = '';
    mostrarMensagem(resposta.mensagem);
    await carregarProdutos();
  } catch (erro) {
    mostrarMensagem(erro.message, true);
  }
}

document.getElementById('btn-buscar').addEventListener('click', async () => {
  const id = Number(document.getElementById('busca-id').value);
  if (!Number.isSafeInteger(id) || id <= 0) {
    return mostrarMensagem('Informe um ID inteiro maior que zero.', true, resultadoBusca);
  }
  try {
    const produto = await requisicao(`/${id}`);
    mostrarMensagem(`ID ${produto.idProduto} | ${produto.nome} | ${produto.categoria} | ${moeda.format(produto.preco)} | Qtd: ${produto.quantidade}`, false, resultadoBusca);
  } catch (erro) {
    mostrarMensagem(erro.message, true, resultadoBusca);
  }
});

// Carrega os registros assim que a página é aberta.
carregarProdutos();
