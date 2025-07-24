const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config(); // Carrega as variáveis de ambiente do .env

const app = express();

// Habilita CORS para todas as origens (para desenvolvimento)
app.use(cors());

app.use(express.json()); // Para parsear o corpo das requisições JSON

// Importa o módulo de login
const loginRoute = require('./api/login'); // Ajuste o caminho se necessário

// Define a rota POST para /api/login
app.post('/api/login', loginRoute);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

