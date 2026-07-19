import Fastify from "fastify";
import cors from "@fastify/cors";

// Initialize Fastify
const app = Fastify({
  logger: true,
});

// Configure CORS
app.register(cors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
});

// Database Models & In-Memory Data Store
interface User {
  id: number;
  nome: string;
  email: string;
  senha?: string;
}

interface Category {
  id: number;
  nome: string;
}

interface Client {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  endereco?: string;
  ativo: string;
  doc?: string; // cpf
  pessoa?: string;
  obs?: string;
  conta?: string;
  agencia?: string;
  banco?: string;
}

interface Product {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string;
  estoque: number;
  valor_compra: number;
  valor_venda: number;
  fornecedor?: string;
  cat_id: number;
  foto?: string;
  ativo: string;
  lucro?: number;
}

interface ContaPagar {
  id: number;
  descricao: string;
  cliente: string; // Supplier/fornecedor
  saida: string;
  vencimento: string;
  frequencia: string;
  valor: number;
  status: string;
  arquivo: string;
  data_emissao?: string;
  documento?: string;
  plano_conta?: string;
  usuario_lanc?: string;
}

interface ContaReceber {
  id: number;
  vencimento: string;
  status: string;
}

// In-Memory Seed Data
const users: User[] = [
  { id: 1, nome: "Admin", email: "admin@finance.com", senha: "admin" },
  { id: 2, nome: "Leandro Benassi", email: "benassileandro@gmail.com", senha: "admin" },
];

const categories: Category[] = [
  { id: 1, nome: "Informática" },
  { id: 2, nome: "Escritório" },
  { id: 3, nome: "Serviços" },
];

const clients: Client[] = [
  { id: 1, nome: "Cliente Alpha", telefone: "11999999999", email: "alpha@cliente.com", ativo: "Sim" },
  { id: 2, nome: "Cliente Beta", telefone: "11888888888", email: "beta@cliente.com", ativo: "Sim" },
  { id: 3, nome: "Inativo Corp", telefone: "11777777777", email: "inativo@corp.com", ativo: "Não" },
];

const products: Product[] = [
  { id: 1, codigo: "001", nome: "Teclado Mecânico", descricao: "Teclado Mecânico RGB", estoque: 10, valor_compra: 150, valor_venda: 250, fornecedor: "Fornecedor Alpha", cat_id: 1, foto: "sem-foto.jpg", ativo: "Sim", lucro: 100 },
  { id: 2, codigo: "002", nome: "Cadeira Ergonômica", descricao: "Cadeira Office Premium", estoque: 5, valor_compra: 600, valor_venda: 990, fornecedor: "Fornecedor Beta", cat_id: 2, foto: "sem-foto.jpg", ativo: "Sim", lucro: 390 },
];

const contasPagar: ContaPagar[] = [
  { id: 1, descricao: "Aluguel Escritório", cliente: "1", saida: "Sim", vencimento: new Date().toISOString().split('T')[0], frequencia: "Mensal", valor: 1500, status: "Pendente", arquivo: "sem-foto.jpg" },
  { id: 2, descricao: "Conta de Luz", cliente: "2", saida: "Sim", vencimento: new Date().toISOString().split('T')[0], frequencia: "Mensal", valor: 250, status: "Pendente", arquivo: "sem-foto.jpg" },
];

const contasReceber: ContaReceber[] = [
  { id: 1, vencimento: new Date().toISOString().split('T')[0], status: "Paga" },
  { id: 2, vencimento: new Date().toISOString().split('T')[0], status: "Pendente" },
];

const bancos = [
  { id: 1, nome: "Banco do Brasil" },
  { id: 2, nome: "Itaú" },
  { id: 3, nome: "Bradesco" },
  { id: 4, nome: "Santander" },
  { id: 5, nome: "Nubank" },
];

const fornecedores = [
  { id: 1, nome: "Fornecedor Alpha" },
  { id: 2, nome: "Fornecedor Beta" },
  { id: 3, nome: "Distribuidora Sul" },
];

const cat_despesas = [
  { id: 1, nome: "Operacional" },
  { id: 2, nome: "Pessoal" },
];

const despesas = [
  { id: 1, nome: "Internet", cat_despesa: 1 },
  { id: 2, nome: "Salários", cat_despesa: 2 },
  { id: 3, nome: "Marketing", cat_despesa: 1 },
];

const frequencias = [
  { id: 1, nome: "Mensal" },
  { id: 2, nome: "Semanal" },
  { id: 3, nome: "Anual" },
  { id: 4, nome: "Única" },
];

// Helper to register routes under both "/apiantiga/..." and "/..." for flexible client compatibility
function registerPost(path: string, handler: (request: any, reply: any) => any) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  app.post(cleanPath, handler);
  app.post(`/apiantiga${cleanPath}`, handler);
}

function registerGet(path: string, handler: (request: any, reply: any) => any) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  app.get(cleanPath, handler);
  app.get(`/apiantiga${cleanPath}`, handler);
}

function registerAll(path: string, handler: (request: any, reply: any) => any) {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  app.all(cleanPath, handler);
  app.all(`/apiantiga${cleanPath}`, handler);
}

// === AUTHENTICATION ROUTES ===
registerPost("/login/login.php", async (request, reply) => {
  const body = request.body as any;
  const email = body?.email;
  const senha = body?.senha;

  const user = users.find(u => u.email === email && u.senha === senha);
  if (user) {
    return {
      result: [{
        id: user.id,
        nome: user.nome,
        email: user.email,
      }]
    };
  } else {
    return { success: "Dados Incorretos!" };
  }
});

// === CATEGORY ROUTES ===
registerAll("/categorias/listar.php", async (request, reply) => {
  const query = request.query as any;
  const body = (request.body as any) || {};
  const limite = parseInt(query?.limite || body?.limite || "5");
  const pagina = parseInt(query?.pagina || body?.pagina || "1");
  const inicio = (limite * pagina) - limite;

  const slice = categories.slice(inicio, inicio + limite);
  if (slice.length > 0) {
    const dados = slice.map(cat => {
      const total_produtos = products.filter(p => p.cat_id === cat.id).length;
      return {
        id: cat.id.toString(),
        nome: cat.nome,
        produtos: total_produtos,
      };
    });
    return {
      success: true,
      resultado: dados,
      totalItems: categories.length,
    };
  } else {
    return { success: false, resultado: "0" };
  }
});

registerPost("/categorias/salvar.php", async (request, reply) => {
  const body = request.body as any;
  const id = body?.id;
  const nome = body?.nome;

  const existing = categories.find(c => c.nome.toLowerCase() === nome?.toLowerCase() && c.id.toString() !== id?.toString());
  if (existing) {
    return { mensagem: "Categoria já Cadastrada!", sucesso: false };
  }

  if (!id || id === "0" || id === 0) {
    const newId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
    categories.push({ id: newId, nome });
  } else {
    const cat = categories.find(c => c.id.toString() === id.toString());
    if (cat) {
      cat.nome = nome;
    }
  }
  return { mensagem: "Salvo com sucesso!", sucesso: true };
});

registerAll("/categorias/excluir.php", async (request, reply) => {
  const query = request.query as any;
  const id = query?.id;

  if (!id) {
    return { mensagem: "ID não fornecido", sucesso: false };
  }

  const associatedProducts = products.filter(p => p.cat_id.toString() === id.toString());
  if (associatedProducts.length > 0) {
    return {
      mensagem: "Esta categoria possui produtos associadas a ela, primeiro exclua estes produtos e depois exclua a categoria!",
      sucesso: false,
    };
  }

  const index = categories.findIndex(c => c.id.toString() === id.toString());
  if (index !== -1) {
    categories.splice(index, 1);
    return "Excluído com Sucesso";
  }

  return { mensagem: "Categoria não encontrada", sucesso: false };
});

registerAll("/categorias/buscar.php", async (request, reply) => {
  const query = request.query as any;
  const buscar = (query?.buscar || "").toLowerCase();

  const filtered = categories.filter(cat => cat.nome.toLowerCase().includes(buscar));
  if (filtered.length > 0) {
    const dados = filtered.map(cat => {
      const total_produtos = products.filter(p => p.cat_id === cat.id).length;
      return {
        id: cat.id.toString(),
        nome: cat.nome,
        produtos: total_produtos,
      };
    });
    return { success: true, itens: dados };
  } else {
    return { success: false, resultado: "0" };
  }
});

registerAll("/categorias/listar_id.php", async (request, reply) => {
  const query = request.query as any;
  const id = query?.id;

  const cat = categories.find(c => c.id.toString() === id?.toString());
  if (cat) {
    return {
      success: true,
      dados: {
        id: cat.id.toString(),
        nome: cat.nome,
      }
    };
  } else {
    return { success: false, resultado: "0" };
  }
});


// === CLIENT ROUTES ===
registerAll("/clientes/listar.php", async (request, reply) => {
  const query = request.query as any;
  const body = (request.body as any) || {};
  const limite = parseInt(query?.limite || body?.limite || "5");
  const pagina = parseInt(query?.pagina || body?.pagina || "1");
  const inicio = (limite * pagina) - limite;

  const slice = clients.slice(inicio, inicio + limite);
  if (slice.length > 0) {
    const dados = slice.map(c => ({
      id: c.id.toString(),
      nome: c.nome,
      telefone: c.telefone,
      email: c.email,
      ativo: c.ativo,
    }));
    return {
      success: true,
      resultado: dados,
      totalItems: clients.length,
    };
  } else {
    return { success: false, resultado: "0" };
  }
});

registerPost("/clientes/salvar.php", async (request, reply) => {
  const body = request.body as any;
  const id = body?.id;
  const nome = body?.nome;
  const telefone = body?.celular || body?.telefone;
  const email = body?.email;
  const endereco = body?.endereco;
  const ativo = body?.ativo || "Sim";
  const cpf = body?.cpf;
  const pessoa = body?.pessoa;
  const obs = body?.obs;
  const conta = body?.conta;
  const agencia = body?.agencia;
  const banco = body?.banco;

  const existing = clients.find(c => c.doc === cpf && c.id.toString() !== id?.toString());
  if (existing && cpf) {
    return { mensagem: "CPF já Cadastrado!", sucesso: false };
  }

  if (!id || id === "0" || id === 0) {
    const newId = clients.length > 0 ? Math.max(...clients.map(c => c.id)) + 1 : 1;
    clients.push({
      id: newId,
      nome,
      telefone,
      email,
      endereco,
      ativo,
      doc: cpf,
      pessoa,
      obs,
      conta,
      agencia,
      banco,
    });
  } else {
    const client = clients.find(c => c.id.toString() === id.toString());
    if (client) {
      client.nome = nome;
      client.telefone = telefone;
      client.email = email;
      client.endereco = endereco;
      client.ativo = ativo;
      client.doc = cpf;
      client.pessoa = pessoa;
      client.obs = obs;
      client.conta = conta;
      client.agencia = agencia;
      client.banco = banco;
    }
  }
  return { mensagem: "Salvo com sucesso!", sucesso: true };
});

registerAll("/clientes/excluir.php", async (request, reply) => {
  const query = request.query as any;
  const id = query?.id;

  const index = clients.findIndex(c => c.id.toString() === id?.toString());
  if (index !== -1) {
    clients.splice(index, 1);
    return "Excluído com Sucesso";
  }
  return { mensagem: "Cliente não encontrado", sucesso: false };
});

registerAll("/clientes/buscar.php", async (request, reply) => {
  const query = request.query as any;
  const buscar = (query?.buscar || "").toLowerCase();

  const filtered = clients.filter(c => c.nome.toLowerCase().includes(buscar) || c.email.toLowerCase().includes(buscar));
  if (filtered.length > 0) {
    const dados = filtered.map(c => ({
      id: c.id.toString(),
      nome: c.nome,
      telefone: c.telefone,
      email: c.email,
      ativo: c.ativo,
    }));
    return { success: true, itens: dados };
  } else {
    return { success: false, resultado: "0" };
  }
});

registerAll("/clientes/listar_id.php", async (request, reply) => {
  const query = request.query as any;
  const id = query?.id;

  const c = clients.find(cl => cl.id.toString() === id?.toString());
  if (c) {
    return {
      success: true,
      dados: {
        id: c.id.toString(),
        nome: c.nome,
        telefone: c.telefone,
        email: c.email,
        endereco: c.endereco || "",
        ativo: c.ativo,
        banco: c.banco || "",
        conta: c.conta || "",
        agencia: c.agencia || "",
        pessoa: c.pessoa || "",
        cpf: c.doc || "",
        obs: c.obs || "",
      }
    };
  } else {
    return { success: false, resultado: "0" };
  }
});

registerAll("/clientes/listar_bancos.php", async (request, reply) => {
  return { success: true, resultado: bancos };
});


// === PRODUCTS ROUTES ===
registerAll("/produtos/listar.php", async (request, reply) => {
  const query = request.query as any;
  const body = (request.body as any) || {};
  const limite = parseInt(query?.limite || body?.limite || "5");
  const pagina = parseInt(query?.pagina || body?.pagina || "1");
  const inicio = (limite * pagina) - limite;

  const slice = products.slice(inicio, inicio + limite);
  if (slice.length > 0) {
    const dados = slice.map(p => {
      const cat = categories.find(c => c.id === p.cat_id);
      return {
        id: p.id.toString(),
        codigo: p.codigo,
        nome: p.nome,
        descricao: p.descricao || "",
        estoque: p.estoque.toString(),
        valor_compra: p.valor_compra.toString(),
        valor_venda: p.valor_venda.toString(),
        fornecedor: p.fornecedor || "Sem Fornecedor",
        categoria: cat ? cat.nome : "Sem Categoria",
        foto: p.foto || "sem-foto.jpg",
        ativo: p.ativo,
        lucro: p.lucro ? p.lucro.toString() : "0",
      };
    });
    return {
      success: true,
      resultado: dados,
      totalItems: products.length,
    };
  } else {
    return { success: false, resultado: "0" };
  }
});

registerPost("/produtos/salvar.php", async (request, reply) => {
  const body = request.body as any;
  const id = body?.id;
  const nome = body?.nome;
  const descricao = body?.descricao;
  const codigo = body?.codigo;
  const valor_venda = parseFloat(body?.valor_venda || "0");
  const valor_custo = parseFloat(body?.valor_custo || "0");
  const ativo = body?.ativo || "Sim";
  const cat = body?.cat;
  const foto = body?.foto || "sem-foto.jpg";

  const nameDup = products.find(p => p.nome.toLowerCase() === nome?.toLowerCase() && p.id.toString() !== id?.toString());
  if (nameDup) {
    return { mensagem: "Nome já Cadastrado!", sucesso: false };
  }

  const codeDup = products.find(p => p.codigo === codigo && p.id.toString() !== id?.toString());
  if (codeDup) {
    return { mensagem: "Código já Cadastrado!", sucesso: false };
  }

  const catId = parseInt(cat || "1");

  if (!id || id === "0" || id === 0) {
    const newId = products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1;
    products.push({
      id: newId,
      codigo,
      nome,
      descricao,
      estoque: 0,
      valor_compra: valor_custo,
      valor_venda,
      fornecedor: "Sem Fornecedor",
      cat_id: catId,
      foto,
      ativo,
      lucro: valor_venda - valor_custo,
    });
  } else {
    const prod = products.find(p => p.id.toString() === id.toString());
    if (prod) {
      prod.nome = nome;
      prod.codigo = codigo;
      prod.descricao = descricao;
      prod.valor_compra = valor_custo;
      prod.valor_venda = valor_venda;
      prod.cat_id = catId;
      prod.foto = foto;
      prod.ativo = ativo;
      prod.lucro = valor_venda - valor_custo;
    }
  }
  return { mensagem: "Salvo com sucesso!", sucesso: true };
});

registerAll("/produtos/excluir.php", async (request, reply) => {
  const query = request.query as any;
  const id = query?.id;

  const index = products.findIndex(p => p.id.toString() === id?.toString());
  if (index !== -1) {
    products.splice(index, 1);
    return "Excluído com Sucesso";
  }
  return { mensagem: "Produto não encontrado", sucesso: false };
});

registerAll("/produtos/buscar.php", async (request, reply) => {
  const query = request.query as any;
  const buscar = (query?.buscar || "").toLowerCase();

  const filtered = products.filter(p => p.nome.toLowerCase().includes(buscar) || p.codigo.includes(buscar));
  if (filtered.length > 0) {
    const dados = filtered.map(p => {
      const cat = categories.find(c => c.id === p.cat_id);
      return {
        id: p.id.toString(),
        codigo: p.codigo,
        nome: p.nome,
        descricao: p.descricao || "",
        estoque: p.estoque.toString(),
        valor_compra: p.valor_compra.toString(),
        valor_venda: p.valor_venda.toString(),
        fornecedor: p.fornecedor || "Sem Fornecedor",
        categoria: cat ? cat.nome : "Sem Categoria",
        foto: p.foto || "sem-foto.jpg",
        ativo: p.ativo,
        lucro: p.lucro ? p.lucro.toString() : "0",
      };
    });
    return { success: true, itens: dados };
  } else {
    return { success: false, resultado: "0" };
  }
});

registerAll("/produtos/listar_id.php", async (request, reply) => {
  const query = request.query as any;
  const id = query?.id;

  const p = products.find(prod => prod.id.toString() === id?.toString());
  if (p) {
    return {
      success: true,
      dados: {
        id: p.id.toString(),
        codigo: p.codigo,
        nome: p.nome,
        descricao: p.descricao || "",
        estoque: p.estoque.toString(),
        valor_compra: p.valor_compra.toString(),
        valor_venda: p.valor_venda.toString(),
        fornecedor: p.fornecedor || "",
        cat: p.cat_id.toString(),
        foto: p.foto || "sem-foto.jpg",
        ativo: p.ativo,
        lucro: p.lucro ? p.lucro.toString() : "0",
      }
    };
  } else {
    return { success: false, resultado: "0" };
  }
});

registerAll("/produtos/buscar_estoque.php", async (request, reply) => {
  const query = request.query as any;
  const buscar = (query?.buscar || "").toLowerCase();

  const filtered = products.filter(p => p.nome.toLowerCase().includes(buscar) || p.codigo.includes(buscar));
  if (filtered.length > 0) {
    const dados = filtered.map(p => ({
      id: p.id.toString(),
      nome: p.nome,
      estoque: p.estoque.toString(),
    }));
    return { success: true, resultado: dados };
  } else {
    return { success: false, resultado: "0" };
  }
});

registerAll("/produtos/listar_cat.php", async (request, reply) => {
  return { success: true, resultado: categories };
});

registerPost("/produtos/salvar_compra.php", async (request, reply) => {
  const body = request.body as any;
  const id = body?.id;
  const estoque = parseInt(body?.quantidade || "0");
  const valor_compra = parseFloat(body?.valor_compra || "0");

  const prod = products.find(p => p.id.toString() === id?.toString());
  if (prod) {
    prod.estoque += estoque;
    prod.valor_compra = valor_compra;
    prod.lucro = prod.valor_venda - valor_compra;
    return { mensagem: "Compra registrada com sucesso!", sucesso: true };
  }
  return { mensagem: "Produto não encontrado", sucesso: false };
});

registerPost("/produtos/upload.php", async (request, reply) => {
  return { success: true, arquivo: "sem-foto.jpg" };
});


// === PAYABLE (PAGAR) ROUTES ===
registerAll("/pagar/listar.php", async (request, reply) => {
  const query = request.query as any;
  const data = query?.data;
  const data1 = query?.data1;

  let filtered = contasPagar.filter(c => c.status === "Pendente");
  if (data && data1) {
    filtered = filtered.filter(c => c.vencimento >= data && c.vencimento <= data1);
  }

  if (filtered.length > 0) {
    const dados = filtered.map(c => {
      const forn = fornecedores.find(f => f.id.toString() === c.cliente);
      return {
        id: c.id.toString(),
        cliente: forn ? forn.nome : (c.descricao || "Sem Fornecedor"),
        saida: c.saida,
        vencimento: c.vencimento,
        frequencia: c.frequencia,
        valor: c.valor.toString(),
        status: c.status,
        arquivo: c.arquivo,
        tumb: c.arquivo.endsWith(".pdf") ? "pdf.png" : c.arquivo,
        valor_antigo: "",
      };
    });
    return { success: true, resultado: dados };
  } else {
    return { success: false, resultado: "0" };
  }
});

registerPost("/pagar/salvar.php", async (request, reply) => {
  const body = request.body as any;
  const id = body?.id;
  const valor = parseFloat(body?.valor || "0");
  const descricao = body?.descricao || "";
  const forn = body?.forn || "";
  const saida = body?.saida || "Sim";
  const doc = body?.doc || "";
  const plano = body?.plano || "";
  const desp = body?.desp || "";
  const freq = body?.freq || "Mensal";
  const emissao = body?.emissao || new Date().toISOString().split('T')[0];
  const venc = body?.venc || new Date().toISOString().split('T')[0];
  const foto = body?.foto || "sem-foto.jpg";
  const user = body?.user || "1";

  if (!id || id === "0" || id === 0) {
    const newId = contasPagar.length > 0 ? Math.max(...contasPagar.map(c => c.id)) + 1 : 1;
    contasPagar.push({
      id: newId,
      descricao,
      cliente: forn,
      saida,
      vencimento: venc,
      frequencia: freq,
      valor,
      status: "Pendente",
      arquivo: foto,
      data_emissao: emissao,
      documento: doc,
      plano_conta: desp ? `${desp} - ${plano}` : plano,
      usuario_lanc: user,
    });
  } else {
    const conta = contasPagar.find(c => c.id.toString() === id.toString());
    if (conta) {
      conta.descricao = descricao;
      conta.cliente = forn;
      conta.saida = saida;
      conta.vencimento = venc;
      conta.frequencia = freq;
      conta.valor = valor;
      conta.arquivo = foto;
      conta.data_emissao = emissao;
      conta.documento = doc;
      conta.plano_conta = desp ? `${desp} - ${plano}` : plano;
      conta.usuario_lanc = user;
    }
  }
  return { mensagem: "Salvo com sucesso!", sucesso: true };
});

registerAll("/pagar/excluir.php", async (request, reply) => {
  const query = request.query as any;
  const id = query?.id;

  const index = contasPagar.findIndex(c => c.id.toString() === id?.toString());
  if (index !== -1) {
    contasPagar.splice(index, 1);
    return "Excluído com Sucesso";
  }
  return { mensagem: "Conta não encontrada", sucesso: false };
});

registerAll("/pagar/baixar.php", async (request, reply) => {
  const query = request.query as any;
  const id = query?.id;

  const conta = contasPagar.find(c => c.id.toString() === id?.toString());
  if (conta) {
    conta.status = "Paga";
    return { mensagem: "Baixa realizada com sucesso!", sucesso: true };
  }
  return { mensagem: "Conta não encontrada", sucesso: false };
});

registerAll("/pagar/calcular.php", async (request, reply) => {
  return { success: true, valor: "0" };
});

registerAll("/pagar/listar_desp.php", async (request, reply) => {
  const query = request.query as any;
  const plano = query?.plano || "";

  let id_cat = 1;
  if (plano) {
    const cd = cat_despesas.find(c => c.nome.toLowerCase() === plano.toLowerCase());
    if (cd) id_cat = cd.id;
  }

  const filtered = despesas.filter(d => d.cat_despesa === id_cat);
  return { success: true, resultado: filtered };
});

registerAll("/pagar/listar_estoque.php", async (request, reply) => {
  return { success: true, resultado: [] };
});

registerAll("/pagar/listar_forn.php", async (request, reply) => {
  return { success: true, resultado: fornecedores };
});

registerAll("/pagar/listar_freq.php", async (request, reply) => {
  return { success: true, resultado: frequencias };
});

registerAll("/pagar/listar_id.php", async (request, reply) => {
  const query = request.query as any;
  const id = query?.id;

  const c = contasPagar.find(cp => cp.id.toString() === id?.toString());
  if (c) {
    return {
      success: true,
      dados: {
        id: c.id.toString(),
        descricao: c.descricao,
        forn: c.cliente,
        saida: c.saida,
        venc: c.vencimento,
        freq: c.frequencia,
        valor: c.valor.toString(),
        status: c.status,
        foto: c.arquivo,
        emissao: c.data_emissao || "",
        doc: c.documento || "",
        plano: c.plano_conta || "",
        user: c.usuario_lanc || "",
      }
    };
  } else {
    return { success: false, resultado: "0" };
  }
});

registerAll("/pagar/listar_plano.php", async (request, reply) => {
  return { success: true, resultado: cat_despesas };
});

registerAll("/pagar/listar_saida.php", async (request, reply) => {
  return { success: true, resultado: [] };
});

registerPost("/pagar/parcelar.php", async (request, reply) => {
  return { mensagem: "Parcelas criadas com sucesso!", sucesso: true };
});

registerPost("/pagar/upload.php", async (request, reply) => {
  return { success: true, arquivo: "sem-foto.jpg" };
});


// === DASHBOARD ROUTE ===
registerAll("/dashboard/ListAllCards.php", async (request, reply) => {
  const activeClients = clients.filter(c => c.ativo === "Sim").length;
  const paidReceivables = contasReceber.filter(r => r.status === "Paga").length;
  const totalReceivables = contasReceber.length;
  const pendingReceivables = contasReceber.filter(r => r.status === "Pendente").length;
  const pendingPayablesToday = contasPagar.filter(p => p.status === "Pendente").length;

  return {
    success: true,
    quantidade_clientes: activeClients,
    contasRecebidas: paidReceivables,
    contasaReceber: totalReceivables,
    contasaPagarHoje: pendingPayablesToday,
    contasaReceberPendentes: pendingReceivables,
  };
});

// Default root fallback
app.get("/", async () => {
  return { message: "API Financeira (Fastify Mock Server) is running!" };
});

// Wildcard 404 handler returning nice JSON fallback
app.setNotFoundHandler(async (request, reply) => {
  return reply.status(404).send({ error: "Route not found", path: request.url });
});

// Run server on port 3000 and bind to 0.0.0.0
const start = async () => {
  try {
    await app.listen({ port: 3000, host: "0.0.0.0" });
    console.log("Server listening on port 3000");
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
