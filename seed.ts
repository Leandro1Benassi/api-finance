import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({
  url: "file:dev.db",
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Seed Usuario
  const user1 = await prisma.usuario.upsert({
    where: { email: "admin@finance.com" },
    update: {},
    create: {
      nome: "Admin",
      email: "admin@finance.com",
      senha: "admin",
    },
  });

  const user2 = await prisma.usuario.upsert({
    where: { email: "benassileandro@gmail.com" },
    update: {},
    create: {
      nome: "Leandro Benassi",
      email: "benassileandro@gmail.com",
      senha: "admin",
    },
  });

  // Seed Categoria
  const cat1 = await prisma.categoria.upsert({
    where: { nome: "Informática" },
    update: {},
    create: { nome: "Informática" },
  });

  const cat2 = await prisma.categoria.upsert({
    where: { nome: "Escritório" },
    update: {},
    create: { nome: "Escritório" },
  });

  const cat3 = await prisma.categoria.upsert({
    where: { nome: "Serviços" },
    update: {},
    create: { nome: "Serviços" },
  });

  // Seed Fornecedores
  const forn1 = await prisma.fornecedor.upsert({
    where: { nome: "Fornecedor Alpha" },
    update: {},
    create: { nome: "Fornecedor Alpha" },
  });

  const forn2 = await prisma.fornecedor.upsert({
    where: { nome: "Fornecedor Beta" },
    update: {},
    create: { nome: "Fornecedor Beta" },
  });

  // Seed CatDespesa
  const cd1 = await prisma.catDespesa.upsert({
    where: { nome: "Operacional" },
    update: {},
    create: { nome: "Operacional" },
  });

  const cd2 = await prisma.catDespesa.upsert({
    where: { nome: "Pessoal" },
    update: {},
    create: { nome: "Pessoal" },
  });

  // Seed Despesas
  const desps = [
    { nome: "Internet", cat_despesa_id: cd1.id },
    { nome: "Salários", cat_despesa_id: cd2.id },
    { nome: "Marketing", cat_despesa_id: cd1.id },
  ];
  for (const d of desps) {
    const existing = await prisma.despesa.findFirst({
      where: { nome: d.nome },
    });
    if (!existing) {
      await prisma.despesa.create({
        data: { nome: d.nome, cat_despesa_id: d.cat_despesa_id },
      });
    }
  }

  // Seed Frequencias
  const freqs = [
    { nome: "Uma Vez", dias: 0 },
    { nome: "Única", dias: 0 },
    { nome: "Mensal", dias: 30 },
    { nome: "Semanal", dias: 7 },
    { nome: "Anual", dias: 360 },
  ];
  for (const f of freqs) {
    await prisma.frequencia.upsert({
      where: { nome: f.nome },
      update: { dias: f.dias },
      create: f,
    });
  }

  // Seed Bancos
  const banks = ["Banco do Brasil", "Itaú", "Bradesco", "Santander", "Nubank"];
  for (const b of banks) {
    await prisma.banco.upsert({
      where: { nome: b },
      update: {},
      create: { nome: b },
    });
  }

  // Seed Clientes
  const clientsData = [
    { nome: "Cliente Alpha", telefone: "11999999999", email: "alpha@cliente.com", ativo: "Sim", doc: "123.456.789-00" },
    { nome: "Cliente Beta", telefone: "11888888888", email: "beta@cliente.com", ativo: "Sim", doc: "987.654.321-11" },
    { nome: "Inativo Corp", telefone: "11777777777", email: "inativo@corp.com", ativo: "Não", doc: "111.222.333-44" },
  ];
  for (const c of clientsData) {
    await prisma.cliente.upsert({
      where: { doc: c.doc },
      update: {},
      create: c,
    });
  }

  // Seed Produtos
  const prodsData = [
    { codigo: "001", nome: "Teclado Mecânico", descricao: "Teclado Mecânico RGB", estoque: 10, valor_compra: 150.0, valor_venda: 250.0, categoria_id: cat1.id, ativo: "Sim", lucro: 100.0, fornecedor: forn1.id.toString() },
    { codigo: "002", nome: "Cadeira Ergonômica", descricao: "Cadeira Office Premium", estoque: 5, valor_compra: 600.0, valor_venda: 990.0, categoria_id: cat2.id, ativo: "Sim", lucro: 390.0, fornecedor: forn2.id.toString() },
  ];
  for (const p of prodsData) {
    await prisma.produto.upsert({
      where: { codigo: p.codigo },
      update: {},
      create: p,
    });
  }

  // Seed Contas Pagar
  const countCp = await prisma.contaPagar.count();
  if (countCp === 0) {
    await prisma.contaPagar.create({
      data: {
        descricao: "Aluguel Escritório",
        cliente: "1",
        saida: "Sim",
        vencimento: new Date().toISOString().split("T")[0],
        frequencia: "Mensal",
        valor: 1500.0,
        status: "Pendente",
        arquivo: "sem-foto.jpg",
        data_emissao: new Date().toISOString().split("T")[0],
      },
    });
    await prisma.contaPagar.create({
      data: {
        descricao: "Conta de Luz",
        cliente: "2",
        saida: "Sim",
        vencimento: new Date().toISOString().split("T")[0],
        frequencia: "Mensal",
        valor: 250.0,
        status: "Pendente",
        arquivo: "sem-foto.jpg",
        data_emissao: new Date().toISOString().split("T")[0],
      },
    });
  }

  // Seed Contas Receber
  const countCr = await prisma.contaReceber.count();
  if (countCr === 0) {
    await prisma.contaReceber.create({
      data: {
        vencimento: new Date().toISOString().split("T")[0],
        status: "Paga",
      },
    });
    await prisma.contaReceber.create({
      data: {
        vencimento: new Date().toISOString().split("T")[0],
        status: "Pendente",
      },
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
