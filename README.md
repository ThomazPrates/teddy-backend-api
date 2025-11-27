# Teddy Backend API

API REST para encurtamento de URLs desenvolvida com NestJS, permitindo que usuários criem links curtos e personalizados, gerenciem suas URLs e façam redirecionamentos.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Diagramas de Arquitetura](#diagramas-de-arquitetura)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Configuração](#configuração)
- [Executando o Projeto](#executando-o-projeto)
- [Documentação da API](#documentação-da-api)
- [Comandos Disponíveis](#comandos-disponíveis)
- [Testes](#testes)
- [CI/CD](#cicd)
- [Deploy](#deploy)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Escalabilidade](#escalabilidade)

## 🎯 Sobre o Projeto

Teddy Backend API é uma solução completa para encurtamento de URLs que permite:

- Criar URLs encurtadas com códigos únicos
- Gerenciar URLs (criar, listar, atualizar, deletar)
- Autenticação JWT para usuários
- Redirecionamento automático para URLs originais
- Suporte a URLs públicas e privadas (associadas a usuários)

## 🏗 Diagramas de Arquitetura

### Arquitetura Geral do Sistema

```mermaid
graph TB
    subgraph "Cliente"
        User[👤 Usuário]
        Browser[🌐 Navegador]
    end
    
    subgraph "API Layer"
        API[NestJS API<br/>Porta 3000]
        Swagger[📚 Swagger UI<br/>/api-docs]
    end
    
    subgraph "Módulos da Aplicação"
        Auth[🔐 Auth Module<br/>JWT]
        User[👥 User Module]
        Shorten[🔗 Shorten Module]
        Redirect[↩️ Redirect Module]
    end
    
    subgraph "Data Layer"
        DB[(🗄️ PostgreSQL<br/>RDS/Container)]
        TypeORM[TypeORM]
    end
    
    subgraph "Infraestrutura"
        Docker[🐳 Docker Compose<br/>Desenvolvimento]
        AWS[☁️ AWS<br/>Produção]
    end
    
    User --> Browser
    Browser --> API
    Browser --> Swagger
    API --> Auth
    API --> User
    API --> Shorten
    API --> Redirect
    Auth --> TypeORM
    User --> TypeORM
    Shorten --> TypeORM
    Redirect --> TypeORM
    TypeORM --> DB
    API --> Docker
    API --> AWS
```

### Arquitetura de Infraestrutura AWS (Produção)

```mermaid
graph TB
    subgraph "Internet"
        Users[👥 Usuários]
    end
    
    subgraph "AWS Cloud"
        subgraph "VPC - Virtual Private Cloud"
            subgraph "Public Subnet"
                EC2[🖥️ EC2 Instance<br/>NestJS App<br/>Docker Container]
                SG_EC2[🔒 Security Group<br/>Porta 3000, 22]
            end
            
            subgraph "Private Subnet"
                RDS[(🗄️ RDS PostgreSQL<br/>Multi-AZ)]
                SG_RDS[🔒 Security Group<br/>Porta 5432]
            end
            
            IGW[🌐 Internet Gateway]
            NAT[NAT Gateway]
        end
        
        subgraph "Networking"
            VPC[VPC]
            RouteTable[Route Tables]
        end
    end
    
    subgraph "CI/CD"
        GitHub[📦 GitHub]
        Actions[⚙️ GitHub Actions]
        Terraform[🏗️ Terraform]
    end
    
    Users -->|HTTPS| IGW
    IGW --> EC2
    EC2 -->|Consulta| RDS
    EC2 -.->|Regras| SG_EC2
    RDS -.->|Regras| SG_RDS
    
    GitHub -->|Push| Actions
    Actions -->|Deploy| Terraform
    Terraform -->|Provisiona| VPC
    Terraform -->|Provisiona| EC2
    Terraform -->|Provisiona| RDS
```

### Fluxo CI/CD Pipeline

```mermaid
graph LR
    subgraph "GitHub Repository"
        DevBranch[🌿 Branch: develop]
        MainBranch[🌳 Branch: main]
        OtherBranch[🌱 Outras branches]
    end
    
    subgraph "GitHub Actions"
        Trigger[⚡ Trigger: Push]
        BuildTest[🔨 Build & Test Job]
        DeployDev[🚀 Deploy Dev Job]
        DeployProd[🚀 Deploy Prod Job]
    end
    
    subgraph "Build & Test"
        Lint[📝 ESLint]
        Test[🧪 Jest Tests]
        Build[🏗️ Build]
        DockerBuild[🐳 Docker Build]
    end
    
    subgraph "Deploy Dev"
        TFInitDev[🏗️ Terraform Init]
        TFPlanDev[📋 Terraform Plan]
        TFApplyDev[✅ Terraform Apply]
        DeployAppDev[🚀 Deploy App]
    end
    
    subgraph "Deploy Prod"
        TFInitProd[🏗️ Terraform Init]
        TFPlanProd[📋 Terraform Plan]
        TFApplyProd[✅ Terraform Apply]
        DeployAppProd[🚀 Deploy App]
    end
    
    subgraph "AWS Environments"
        AWSDev[☁️ AWS Dev<br/>EC2 + RDS]
        AWSProd[☁️ AWS Prod<br/>EC2 + RDS]
    end
    
    DevBranch -->|Push| Trigger
    MainBranch -->|Push| Trigger
    OtherBranch -->|Push| Trigger
    
    Trigger --> BuildTest
    BuildTest --> Lint
    Lint --> Test
    Test --> Build
    Build --> DockerBuild
    
    DevBranch -->|Apenas develop| DeployDev
    MainBranch -->|Apenas main| DeployProd
    
    DeployDev --> TFInitDev
    TFInitDev --> TFPlanDev
    TFPlanDev --> TFApplyDev
    TFApplyDev --> DeployAppDev
    DeployAppDev --> AWSDev
    
    DeployProd --> TFInitProd
    TFInitProd --> TFPlanProd
    TFPlanProd --> TFApplyProd
    TFApplyProd --> DeployAppProd
    DeployAppProd --> AWSProd
```

### Fluxo de Requisições da API

```mermaid
sequenceDiagram
    participant Client as 👤 Cliente
    participant API as 🚀 NestJS API
    participant Auth as 🔐 Auth Guard
    participant Service as 📦 Service Layer
    participant DB as 🗄️ PostgreSQL
    
    Note over Client,DB: Fluxo de Autenticação
    Client->>API: POST /auth/login
    API->>Service: AuthService.signIn()
    Service->>DB: Verificar credenciais
    DB-->>Service: Dados do usuário
    Service->>Service: Gerar JWT
    Service-->>API: Token JWT
    API-->>Client: Token JWT
    
    Note over Client,DB: Criar URL Encurtada
    Client->>API: POST /shorten<br/>(com/sem token)
    API->>Auth: OptionalAuthGuard
    Auth-->>API: User (se autenticado)
    API->>Service: ShortenService.createShortUrl()
    Service->>Service: Gerar código único
    Service->>DB: Salvar URL
    DB-->>Service: URL criada
    Service-->>API: URL encurtada
    API-->>Client: Resposta com URL curta
    
    Note over Client,DB: Listar URLs do Usuário
    Client->>API: GET /shorten/my-urls<br/>(Bearer Token)
    API->>Auth: AuthGuard
    Auth->>Auth: Validar JWT
    Auth-->>API: User autenticado
    API->>Service: ShortenService.listByOwner()
    Service->>DB: Buscar URLs do usuário
    DB-->>Service: Lista de URLs
    Service-->>API: URLs do usuário
    API-->>Client: Lista de URLs
    
    Note over Client,DB: Redirecionamento
    Client->>API: GET redirect/:code
    API->>Service: RedirectService.getOriginalUrl()
    Service->>DB: Buscar URL por código
    DB-->>Service: URL original
    Service-->>API: URL original
    API-->>Client: 302 Redirect
```

### Arquitetura de Desenvolvimento Local

```mermaid
graph TB
    subgraph "Docker Compose"
        subgraph "Network: teddy-network"
            AppContainer[🐳 Container: App<br/>NestJS<br/>Porta 3000]
            DBContainer[🐳 Container: Postgres<br/>PostgreSQL 15<br/>Porta 5432]
        end
        
        Volumes[💾 Volumes<br/>postgres_data<br/>node_modules]
    end
    
    subgraph "Host Machine"
        Code[📁 Código Fonte<br/>Volume Mount]
        Env[⚙️ .env file]
    end
    
    Developer[👨‍💻 Desenvolvedor]
    
    Developer -->|npm run docker:up| AppContainer
    Developer -->|Edita código| Code
    Code -.->|Volume Mount| AppContainer
    AppContainer -->|Consulta| DBContainer
    DBContainer -->|Persiste| Volumes
    AppContainer -->|Lê| Env
```

## ✨ Funcionalidades

### Autenticação
- ✅ Cadastro de usuários
- ✅ Login com JWT
- ✅ Proteção de rotas com guards

### Encurtamento de URLs
- ✅ Criar URLs encurtadas (com ou sem autenticação)
- ✅ Listar URLs do usuário autenticado
- ✅ Atualizar URLs existentes
- ✅ Deletar URLs (soft delete)
- ✅ Redirecionamento automático

### Infraestrutura
- ✅ Deploy automatizado com CI/CD
- ✅ Infraestrutura como código (Terraform)
- ✅ Ambientes separados (dev/prod)
- ✅ Containerização com Docker
- ✅ BASE_URL configurável por ambiente
- ✅ URLs encurtadas completas nas respostas da API

## 🛠 Tecnologias

### Backend
- **NestJS** - Framework Node.js
- **TypeScript** - Linguagem de programação
- **TypeORM** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Swagger** - Documentação da API
- **Jest** - Testes unitários

### DevOps
- **Docker** & **Docker Compose** - Containerização
- **Terraform** - Infraestrutura como código (gerenciado via CI/CD)
- **AWS** - Cloud provider (EC2, RDS)
- **GitHub Actions** - CI/CD e deploy automatizado

## 📦 Pré-requisitos

Antes de começar, você precisa ter instalado:

- **Node.js** (v20 ou superior)
- **npm** ou **yarn**
- **Docker** e **Docker Compose** (para desenvolvimento local)
- **Git**

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd teddy-backend-api
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente (veja [Configuração](#configuração))

## ⚙️ Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=teddydb

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d

# Application
NODE_ENV=development
PORT=3000
BASE_URL=http://localhost:3000  # URL base da API (usada para gerar URLs encurtadas completas)
```

> **Nota sobre BASE_URL**: Esta variável define a URL base da API e é usada para gerar as URLs encurtadas completas nas respostas. 
> - **Desenvolvimento**: `http://localhost:3000`
> - **Produção**: `http://<EC2_IP>:3000` ou `https://api.seudominio.com`
> - **Alternativa**: Você pode usar `API_URL` em vez de `BASE_URL` (BASE_URL tem prioridade)

> **Nota**: A configuração do Terraform é feita automaticamente via CI/CD usando os secrets do GitHub. Não é necessário configurar arquivos `terraform.tfvars` manualmente.

## 🏃 Executando o Projeto

### Desenvolvimento Local

#### Opção 1: Com Docker Compose (Recomendado)
```bash
# Sobe os containers (app + PostgreSQL)
npm run docker:up

# A aplicação estará disponível em http://localhost:3000
# PostgreSQL em localhost:5432
```

#### Opção 2: Sem Docker
```bash
# Certifique-se de ter PostgreSQL rodando localmente

# Inicia em modo desenvolvimento (watch mode)
npm run start:dev

# Ou em modo debug
npm run start:debug
```

### Produção

```bash
# Build do projeto
npm run build

# Inicia em modo produção
npm run start:prod
```

## 📚 Documentação da API

A documentação interativa da API está disponível via Swagger:

- **URL**: `http://localhost:3000/api-docs`
- **Autenticação**: Use o endpoint `/auth/login` para obter o token JWT e clique em "Authorize" no Swagger

### Endpoints Principais

#### Autenticação
- `POST /auth/login` - Login do usuário
- `POST /users` - Criar novo usuário

#### Encurtamento
- `POST /shorten` - Criar URL encurtada (público ou autenticado)
- `GET /shorten/my-urls` - Listar URLs do usuário (requer autenticação)
- `PUT /shorten/my-urls/:id` - Atualizar URL (requer autenticação)
- `DELETE /shorten/my-urls/:id` - Deletar URL (requer autenticação)

#### Redirecionamento
- `GET /:code` - Redireciona para a URL original (exemplo: `GET /abc123`)

## 📝 Comandos Disponíveis

### Desenvolvimento
| Comando | Descrição |
|---------|-----------|
| `npm run start` | Inicia a aplicação NestJS |
| `npm run start:dev` | Inicia em modo desenvolvimento (watch) |
| `npm run start:debug` | Inicia em modo debug |
| `npm run start:prod` | Inicia em modo produção |

### Build
| Comando | Descrição |
|---------|-----------|
| `npm run build` | Compila o projeto TypeScript |

### Qualidade de Código
| Comando | Descrição |
|---------|-----------|
| `npm run lint` | Executa ESLint e corrige problemas |
| `npm run format` | Formata o código com Prettier |

### Testes
| Comando | Descrição |
|---------|-----------|
| `npm run test` | Executa todos os testes |
| `npm run test:watch` | Executa testes em modo watch |
| `npm run test:cov` | Executa testes com cobertura de código |
| `npm run test:debug` | Executa testes em modo debug |

### Docker
| Comando | Descrição |
|---------|-----------|
| `npm run docker:up` | Sobe os containers (app + PostgreSQL) |
| `npm run docker:down` | Para e remove os containers |
| `npm run docker:build` | Constrói as imagens Docker |

### Terraform (Apenas para Troubleshooting)
| Comando | Descrição |
|---------|-----------|
| `npm run terraform:output:dev` | Mostra os outputs do Terraform em dev (IP do EC2, RDS endpoint) |
| `npm run terraform:output:prod` | Mostra os outputs do Terraform em prod (IP do EC2, RDS endpoint) |
| `npm run terraform:destroy:dev` | ⚠️ Destrói a infraestrutura em dev (use com cuidado) |
| `npm run terraform:destroy:prod` | ⚠️ Destrói a infraestrutura em prod (use com cuidado) |

> **Nota**: O deploy é feito automaticamente via CI/CD. Os comandos acima são apenas para troubleshooting e destruição de recursos quando necessário.

## 🧪 Testes

O projeto utiliza Jest para testes unitários e de integração.

```bash
# Executar todos os testes
npm run test

# Executar com cobertura
npm run test:cov

# Executar em modo watch
npm run test:watch
```

Os relatórios de cobertura são gerados na pasta `coverage/`.

## 🔄 CI/CD

O projeto utiliza GitHub Actions para automação de CI/CD.

### Workflow

- **Push em qualquer branch**: Executa `build-and-test` (lint, testes, build)
- **Push na branch `develop`**: Executa `build-and-test` + deploy para ambiente **dev**
- **Push na branch `main`**: Executa `build-and-test` + deploy para ambiente **prod**

### Jobs

1. **build-and-test**: Compila, executa lint, testes e build
2. **deploy-dev**: Deploy para ambiente de desenvolvimento (apenas na branch `develop`)
3. **deploy-prod**: Deploy para ambiente de produção (apenas na branch `main`)

## 🚢 Deploy

O deploy é feito **automaticamente via CI/CD** quando você faz push para as branches `develop` ou `main`.

### Configuração Inicial

1. **Configure os secrets no GitHub** (Settings → Secrets and variables → Actions):
   - `AWS_ACCESS_KEY_ID` - Credencial de acesso AWS
   - `AWS_SECRET_ACCESS_KEY` - Chave secreta AWS
   - `AWS_REGION` - Região AWS (ex: `us-east-1`)
   - `PROJECT_NAME` - Nome do projeto
   - `DB_USERNAME` - Usuário do banco de dados
   - `DB_PASSWORD` - Senha do banco de dados
   - `DATABASE_NAME` - Nome do banco (opcional, padrão: `teddydb`)
   - `JWT_SECRET` - Secret para assinatura JWT

2. **Faça push para a branch apropriada**:
   - Push para `develop` → deploy automático em **dev**
   - Push para `main` → deploy automático em **prod**

3. **A `BASE_URL` é configurada automaticamente** usando o IP do EC2: `http://<EC2_IP>:3000`

### Infraestrutura

A infraestrutura na AWS inclui:
- **EC2**: Instância para hospedar a aplicação (com IP público)
- **RDS PostgreSQL**: Banco de dados gerenciado em subnet privada
- **Security Groups**: Configuração de segurança (porta 3000 aberta publicamente)
- **VPC**: Rede virtual isolada com subnets públicas e privadas

### Acessando a API após Deploy

Após o deploy via CI/CD, você pode obter o IP do EC2 e acessar a API:

```bash
# Obter o IP do EC2 (usando npm script)
npm run terraform:output:prod

# Ou diretamente com Terraform
terraform -chdir=./terraform/environments/prod output ec2_public_ip

# Acessar a API
curl http://<EC2_IP>:3000/api-docs

# Exemplo: Criar URL encurtada
curl -X POST http://<EC2_IP>:3000/shorten \
  -H "Content-Type: application/json" \
  -d '{"originalUrl": "https://www.example.com"}'
```

> **Importante**: A `BASE_URL` é configurada automaticamente no deploy para usar o IP do EC2: `http://<EC2_IP>:3000`. Se você tiver um domínio, adicione o secret `BASE_URL=https://api.seudominio.com` no GitHub.

## 📈 Escalabilidade

### Escala Vertical  
- Aumentar recursos da instância EC2 (CPU, RAM)
- Aumentar recursos do RDS (CPU, memória, armazenamento)
- ⚠️ Pode causar downtime temporário durante upgrades

### Escala Horizontal  
- **EC2**: Usar Auto Scaling Groups para criar/remover instâncias automaticamente
- **RDS**: Criar réplicas de leitura para distribuir carga de leitura
- **Load Balancer**: Usar ELB/ALB para distribuir requisições entre instâncias

### Desafios e Soluções  
- **Sincronização de dados**: Réplicas RDS são somente leitura; escritas vão para instância principal
- **Gerenciamento de estado**: Usar balanceadores de carga (ELB/ALB) para múltiplas instâncias
- **Monitoramento**: Configurar CloudWatch para monitorar uso e performance
- **Auto Scaling**: Configurar políticas de auto scaling baseadas em métricas

---
