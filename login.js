const Airtable = require('airtable');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

const getRecords = async (table, filter = '') => {
  const result = [];
  await base(table)
    .select({ filterByFormula: filter, maxRecords: 100 })
    .eachPage((records, fetchNextPage) => {
      records.forEach(r => result.push({ id: r.id, ...r.fields }));
      fetchNextPage();
    });
  return result;
};

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método não permitido' });

  const { empresa, nome, cpf5 } = req.body;

  if (!empresa || !nome || !cpf5) return res.status(400).json({ error: 'Dados incompletos' });

  try {
    const empresas = await getRecords('Empresas', `{Nome da Empresa} = '${empresa}'`);
    if (!empresas.length) return res.status(404).json({ error: 'Empresa não encontrada' });

    const motoristas = await getRecords('Motoristas', `AND(FIND('${empresas[0].id}', ARRAYJOIN({Empresas})), {Primeiro Nome} = '${nome}', {CPF5} = '${cpf5}', {ativo} = 1)`);
    if (!motoristas.length) return res.status(401).json({ error: 'Usuário/senha inválidos' });

    res.json({
      usuarioId: motoristas[0].id,
      empresaId: empresas[0].id,
      isADM: motoristas[0].Administrador === true,
      nome: motoristas[0]['Primeiro Nome'],
      cor: empresas[0]['Cor Primária'],
      corSec: empresas[0]['Cor Secundária'],
      logo: empresas[0]['Logo da Empresa'] || ''
    });
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({ error: 'Erro interno do servidor', details: error.message });
  }
};

