# Guia de Deploy

Este projeto suporta dois ambientes: **development** e **production**.

## Deploy Automático via GitHub Actions

O projeto está configurado com GitHub Actions para deploy automático:

- **Deploy em Dev**: Automático quando há push/merge na branch `develop`
- **Deploy em Prod**: Automático quando há push/merge na branch `main`

Veja [.github/GITHUB_ACTIONS_SETUP.md](.github/GITHUB_ACTIONS_SETUP.md) para configurar os secrets necessários.

## Deploy Manual

Se preferir fazer deploy manualmente:

## Pré-requisitos

1. AWS CLI configurado
2. Terraform instalado
3. Chave SSH em `~/.ssh/aws_key.pub`
4. Variáveis de ambiente configuradas

## Configuração Inicial

### 1. Configurar variáveis do Terraform

Edite os arquivos de configuração do Terraform:

- **Desenvolvimento**: `terraform/terraform.tfvars.dev`
- **Produção**: `terraform/terraform.tfvars.prod`

**Importante**: Altere a senha do banco de dados em produção!

### 2. Inicializar Terraform

```bash
# Para desenvolvimento
npm run terraform:init:dev

# Para produção
npm run terraform:init:prod
```

## Deploy

### Deploy em Desenvolvimento

```bash
# Ver o plano de mudanças
npm run terraform:plan:dev

# Aplicar mudanças
npm run terraform:apply:dev

# Ou fazer build + deploy
npm run deploy:dev
```

### Deploy em Produção

```bash
# Ver o plano de mudanças
npm run terraform:plan:prod

# Aplicar mudanças
npm run terraform:apply:prod

# Ou fazer build + deploy
npm run deploy:prod
```

## Verificar Outputs

Após o deploy, você pode ver os outputs do Terraform:

```bash
npm run terraform:output:dev
npm run terraform:output:prod
```

Os outputs incluem:
- `ec2_public_ip` - IP público da instância EC2
- `ec2_public_dns` - DNS público da instância EC2
- `rds_endpoint` - Endpoint do RDS
- `rds_address` - Endereço do RDS
- `database_name` - Nome do banco de dados

## Configuração da Aplicação

### Variáveis de Ambiente

Crie arquivos `.env` para cada ambiente:

**`.env.development`** (desenvolvimento local):
```env
NODE_ENV=development
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=sua_senha_local
DATABASE_NAME=teddydb
```

**`.env.production`** (produção na AWS):
```env
NODE_ENV=production
DATABASE_HOST=<rds-endpoint-do-terraform-output>
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=<senha-do-terraform.tfvars.prod>
DATABASE_NAME=teddydb
```

## Diferenças entre Ambientes

### Desenvolvimento
- EC2: `t2.micro`
- RDS: `db.t3.micro`, 20GB storage
- Backup: 7 dias
- Snapshot final: Não criado

### Produção
- EC2: `t3.small`
- RDS: `db.t3.small`, 100GB storage
- Backup: 30 dias
- Snapshot final: Criado antes de destruir

## Destruir Infraestrutura

⚠️ **CUIDADO**: Isso irá deletar todos os recursos!

```bash
# Desenvolvimento
npm run terraform:destroy:dev

# Produção
npm run terraform:destroy:prod
```

## Troubleshooting

### Erro de autenticação AWS
Certifique-se de que o AWS CLI está configurado:
```bash
aws configure
```

### Erro de chave SSH
Certifique-se de que a chave existe:
```bash
ls ~/.ssh/aws_key.pub
```

### Erro de conexão com banco
Verifique se o security group do RDS permite conexões do EC2 e se as variáveis de ambiente estão corretas.

