# Guia de Desenvolvimento Local com Docker

Este guia explica como configurar e executar o projeto localmente usando Docker Compose.

## Pré-requisitos

- Docker Desktop instalado e rodando
- Docker Compose (v3.8 ou superior)

## Configuração Inicial

### 1. Criar arquivo .env

Copie o arquivo de exemplo e ajuste conforme necessário:

```bash
cp .env.example .env
```

O arquivo `.env` já está configurado com valores padrão que funcionam com o Docker Compose.

### 2. Iniciar os serviços

```bash
# Iniciar todos os serviços (app + postgres)
npm run docker:up

# Ou usando docker-compose diretamente
docker-compose up -d
```

Isso irá:
- Criar e iniciar o container do PostgreSQL
- Criar e iniciar o container da aplicação NestJS
- Criar a rede Docker `teddy-network`
- Criar o volume `postgres_data` para persistência dos dados

## Comandos Úteis

### Gerenciamento de Containers

```bash
# Iniciar serviços
npm run docker:up

# Parar serviços (mantém volumes)
npm run docker:down

# Parar e remover volumes (apaga dados do banco)
npm run docker:clean

# Reiniciar serviços
npm run docker:restart

# Ver logs
npm run docker:logs

# Ver logs apenas da aplicação
docker-compose logs -f app

# Ver logs apenas do banco
docker-compose logs -f postgres
```

### Build

```bash
# Rebuild das imagens
npm run docker:build

# Rebuild forçado (sem cache)
docker-compose build --no-cache
```

### Executar comandos dentro dos containers

```bash
# Executar comando na aplicação
docker-compose exec app npm run lint
docker-compose exec app npm test

# Acessar shell do container da aplicação
docker-compose exec app sh

# Acessar banco de dados via psql
docker-compose exec postgres psql -U postgres -d teddydb
```

## Acessar a Aplicação

Após iniciar os serviços:

- **API**: http://localhost:3000
- **PostgreSQL**: localhost:5432

## Estrutura dos Serviços

### PostgreSQL
- **Imagem**: `postgres:15-alpine`
- **Porta**: 5432
- **Usuário padrão**: `postgres`
- **Senha padrão**: `postgres`
- **Database**: `teddydb`
- **Volume**: `postgres_data` (persistência dos dados)

### Aplicação NestJS
- **Imagem**: Baseada em `node:18-alpine`
- **Porta**: 3000
- **Modo**: Desenvolvimento (hot-reload habilitado)
- **Volumes**: 
  - Código fonte montado (hot-reload)
  - `node_modules` isolado

## Desenvolvimento

### Hot Reload

O código fonte está montado como volume, então qualquer alteração nos arquivos será refletida automaticamente. O NestJS está configurado com `--watch`, então a aplicação será reiniciada automaticamente.

### Banco de Dados

O banco de dados é criado automaticamente quando o container do PostgreSQL inicia. O TypeORM está configurado com `synchronize: true` em desenvolvimento, então as tabelas serão criadas automaticamente.

### Resetar o Banco de Dados

Para resetar completamente o banco de dados:

```bash
npm run docker:clean
npm run docker:up
```

Isso irá remover todos os volumes e recriar tudo do zero.

## Troubleshooting

### Porta já em uso

Se a porta 3000 ou 5432 já estiver em uso:

1. Edite o arquivo `.env` e altere as portas:
   ```env
   DATABASE_PORT=5433
   PORT=3001
   ```

2. Ou pare o serviço que está usando a porta:
   ```bash
   # Windows
   netstat -ano | findstr :3000
   taskkill /PID <PID> /F
   
   # Linux/Mac
   lsof -ti:3000 | xargs kill
   ```

### Container não inicia

Verifique os logs:
```bash
docker-compose logs app
docker-compose logs postgres
```

### Banco de dados não conecta

1. Verifique se o PostgreSQL está saudável:
   ```bash
   docker-compose ps
   ```

2. Verifique as variáveis de ambiente no `.env`

3. Teste a conexão manualmente:
   ```bash
   docker-compose exec postgres psql -U postgres -d teddydb
   ```

### Rebuild necessário após mudanças no Dockerfile

```bash
docker-compose build --no-cache
docker-compose up -d
```

### Limpar tudo e começar do zero

```bash
# Parar e remover containers, volumes e redes
docker-compose down -v

# Remover imagens
docker-compose down --rmi all

# Limpar sistema Docker (cuidado: remove tudo não utilizado)
docker system prune -a --volumes
```

## Variáveis de Ambiente

As variáveis podem ser configuradas no arquivo `.env`:

```env
# Database
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=teddydb

# Application
NODE_ENV=development
PORT=3000
```

**Nota**: No Docker Compose, `DATABASE_HOST` deve ser `postgres` (nome do serviço), não `localhost`.

## Produção Local

Para testar a build de produção localmente:

```bash
# Build da imagem de produção
docker build -t teddy-backend-api:prod .

# Executar
docker run -p 3000:3000 --env-file .env teddy-backend-api:prod
```

Ou adicione um serviço de produção no `docker-compose.yml`:

```yaml
  app-prod:
    build:
      context: .
      dockerfile: Dockerfile
    environment:
      NODE_ENV: production
      DATABASE_HOST: postgres
      # ... outras variáveis
    ports:
      - "3000:3000"
    depends_on:
      - postgres
```

