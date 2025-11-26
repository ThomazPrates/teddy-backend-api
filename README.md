# Teddy Backend API

API REST desenvolvida com NestJS, TypeScript e PostgreSQL. Projeto configurado para desenvolvimento local com Docker e deploy automatizado na AWS.

## 📋 Índice

- [Características](#-características)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Executando a Aplicação](#-executando-a-aplicação)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Scripts Disponíveis](#-scripts-disponíveis)
- [API Endpoints](#-api-endpoints)
- [Desenvolvimento](#-desenvolvimento)
- [Deploy](#-deploy)
- [Testes](#-testes)
- [Contribuindo](#-contribuindo)

## ✨ Características

- 🚀 **NestJS** - Framework Node.js progressivo
- 🗄️ **PostgreSQL** - Banco de dados relacional
- 🔄 **TypeORM** - ORM para TypeScript
- ✅ **Validação** - Validação automática de dados com class-validator
- 🐳 **Docker** - Ambiente de desenvolvimento containerizado
- ☁️ **AWS** - Infraestrutura como código com Terraform
- 🔐 **Segurança** - Validação de entrada e sanitização de dados

## 🛠 Tecnologias

### Backend
- **NestJS** ^10.0.0 - Framework Node.js
- **TypeScript** ^5.1.3 - Linguagem de programação
- **TypeORM** ^0.3.27 - ORM
- **PostgreSQL** - Banco de dados
- **class-validator** - Validação de DTOs
- **class-transformer** - Transformação de objetos

### DevOps
- **Docker** & **Docker Compose** - Containerização
- **Terraform** - Infraestrutura como código
- **AWS** - Cloud provider (EC2, RDS, VPC)

### Ferramentas de Desenvolvimento
- **ESLint** - Linter
- **Prettier** - Formatador de código
- **Jest** - Framework de testes

## 📦 Pré-requisitos

### Opção 1: Desenvolvimento com Docker (Recomendado)
- [Docker Desktop](https://www.docker.com/products/docker-desktop) instalado e rodando
- Docker Compose v3.8 ou superior

### Opção 2: Desenvolvimento Local
- [Node.js](https://nodejs.org/) versão 18 ou superior
- [PostgreSQL](https://www.postgresql.org/download/) versão 15 ou superior
- npm ou yarn

## 🚀 Instalação

### Clone o repositório

```bash
git clone <repository-url>
cd teddy-backend-api
```

### Com Docker (Recomendado)

```bash
# 1. Copiar arquivo de ambiente
cp .env.example .env

# 2. Iniciar serviços (aplicação + banco de dados)
npm run docker:up
```

A aplicação estará disponível em `http://localhost:3000` e o banco de dados em `localhost:5432`.

Para mais detalhes sobre Docker, consulte [README-DOCKER.md](README-DOCKER.md).

### Sem Docker

```bash
# 1. Instalar dependências
npm install

# 2. Configurar banco de dados PostgreSQL
# Certifique-se de que o PostgreSQL está rodando

# 3. Copiar e configurar variáveis de ambiente
cp .env.example .env
# Editar .env com as credenciais do seu PostgreSQL

# 4. Executar migrações (se necessário)
# O TypeORM criará as tabelas automaticamente em desenvolvimento
```

## ▶️ Executando a Aplicação

### Com Docker

```bash
# Iniciar serviços
npm run docker:up

# Ver logs
npm run docker:logs

# Parar serviços
npm run docker:down
```

### Sem Docker

```bash
# Modo desenvolvimento (com hot-reload)
npm run start:dev

# Modo produção
npm run build
npm run start:prod
```

A aplicação estará disponível em `http://localhost:3000`.

## 📁 Estrutura do Projeto

```
teddy-backend-api/
├── src/
│   ├── user/                 # Módulo de usuários
│   │   ├── dto/             # Data Transfer Objects
│   │   ├── entities/        # Entidades TypeORM
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.repository.ts
│   │   └── user.module.ts
│   ├── app.module.ts        # Módulo principal
│   └── main.ts              # Arquivo de entrada
├── terraform/               # Configuração de infraestrutura AWS
├── docker-compose.yml       # Configuração Docker Compose
├── Dockerfile              # Imagem de produção
├── Dockerfile.dev          # Imagem de desenvolvimento
└── package.json
```

## 📜 Scripts Disponíveis

### Desenvolvimento
```bash
npm run start:dev      # Inicia em modo desenvolvimento com hot-reload
npm run start:debug    # Inicia em modo debug
npm run build          # Compila o projeto TypeScript
npm run start:prod     # Inicia em modo produção
```

### Qualidade de Código
```bash
npm run lint           # Executa ESLint e corrige problemas
npm run format         # Formata código com Prettier
```

### Testes
```bash
npm run test           # Executa testes unitários
npm run test:watch     # Executa testes em modo watch
npm run test:cov       # Executa testes com cobertura
npm run test:e2e       # Executa testes end-to-end
```

### Docker
```bash
npm run docker:up      # Inicia serviços (app + postgres)
npm run docker:down    # Para os serviços
npm run docker:build   # Rebuild das imagens Docker
npm run docker:logs    # Ver logs dos serviços
npm run docker:restart # Reinicia os serviços
npm run docker:clean   # Para e remove volumes (apaga dados do banco)
```

## 🔌 API Endpoints

### Usuários

#### Criar Usuário
```http
POST /users
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Resposta de Sucesso (201):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Resposta de Erro (409):**
```json
{
  "statusCode": 409,
  "message": "Email já cadastrado"
}
```

## 💻 Desenvolvimento

### Estrutura de Módulos

O projeto segue a arquitetura modular do NestJS:

- **Controller**: Recebe requisições HTTP e retorna respostas
- **Service**: Contém a lógica de negócio
- **Repository**: Gerencia acesso aos dados (padrão Repository)
- **Entity**: Define a estrutura da tabela no banco de dados
- **DTO**: Define a estrutura de dados para validação

### Adicionar Novo Módulo

```bash
# Usando NestJS CLI
nest generate module nome-do-modulo
nest generate controller nome-do-modulo
nest generate service nome-do-modulo
```

### Variáveis de Ambiente

Crie um arquivo `.env` baseado no `.env.example`:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=teddydb

# Application
NODE_ENV=development
PORT=3000
```

**Nota**: No Docker Compose, `DATABASE_HOST` deve ser `postgres` (nome do serviço).

## 🚢 Deploy

### Deploy na AWS

O projeto inclui configuração Terraform para deploy na AWS. Veja a documentação de deploy para mais detalhes.

**Recursos provisionados:**
- VPC com subnets públicas e privadas
- EC2 Instance para a aplicação
- RDS PostgreSQL para o banco de dados
- Security Groups configurados
- Internet Gateway e Route Tables

### Ambientes

- **Development**: Branch `develop`
- **Production**: Branch `main`

## 🧪 Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:cov
```

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código

- Use ESLint e Prettier para manter consistência
- Siga os padrões do NestJS
- Escreva testes para novas funcionalidades
- Documente mudanças significativas

## 📝 Licença

Este projeto está sob a licença MIT.

## 📚 Documentação Adicional

- [Guia Docker](README-DOCKER.md) - Documentação completa sobre Docker
- [NestJS Documentation](https://docs.nestjs.com/) - Documentação oficial do NestJS
- [TypeORM Documentation](https://typeorm.io/) - Documentação do TypeORM

## 👥 Autores

- **Seu Nome** - *Desenvolvimento inicial*

## 🙏 Agradecimentos

- NestJS por fornecer um framework excelente
- Comunidade open source

---

**Desenvolvido com ❤️ usando NestJS**
