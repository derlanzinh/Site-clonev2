# Deploy na Vercel

Este projeto está configurado para deploy na Vercel com Serverless Functions.

## Como fazer o deploy

### 1. Preparar o projeto

```bash
# Instalar dependências
npm install

# Testar localmente (opcional)
npm start
```

### 2. Deploy via CLI da Vercel

```bash
# Instalar CLI da Vercel (se não tiver)
npm i -g vercel

# Fazer login na Vercel
vercel login

# Deploy do projeto
vercel

# Para deploy em produção
vercel --prod
```

### 3. Deploy via GitHub

1. Faça upload do projeto para um repositório GitHub
2. Conecte o repositório na dashboard da Vercel
3. A Vercel detectará automaticamente as configurações
4. O deploy será feito automaticamente

## Estrutura para Vercel

O projeto foi adaptado para funcionar na Vercel com:

- **Frontend**: Arquivos estáticos em `/public`
- **Backend**: Serverless Functions em `/api`
- **Configuração**: `vercel.json` com as rotas e builds

### Arquivos importantes:

- `vercel.json` - Configuração da Vercel
- `api/clone.js` - Function para clonagem de sites
- `api/clone-discord.js` - Function para clonagem Discord
- `.gitignore` - Arquivos a serem ignorados

## Limitações na Vercel

- **Timeout**: Functions têm limite de 30 segundos (configurado)
- **Armazenamento**: Arquivos são salvos em `/tmp` (temporário)
- **Memória**: Limitada conforme plano da Vercel

## Variáveis de ambiente

Se necessário, configure variáveis de ambiente na dashboard da Vercel:

1. Acesse o projeto na Vercel
2. Vá em Settings → Environment Variables
3. Adicione as variáveis necessárias

## Domínio personalizado

Para usar um domínio personalizado:

1. Vá em Settings → Domains na dashboard
2. Adicione seu domínio
3. Configure os DNS conforme instruções

## Monitoramento

- Logs disponíveis na dashboard da Vercel
- Analytics integrado
- Métricas de performance automáticas

