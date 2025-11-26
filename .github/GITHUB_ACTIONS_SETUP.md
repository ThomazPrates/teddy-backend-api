# Configuração do GitHub Actions

Este documento explica como configurar os secrets necessários para os workflows de deploy.

## Secrets Necessários

Configure os seguintes secrets no GitHub:

### 1. Acesse as configurações do repositório
- Vá em **Settings** → **Secrets and variables** → **Actions**

### 2. Adicione os seguintes secrets:

#### AWS Credentials
- `AWS_ACCESS_KEY_ID` - Access Key ID da sua conta AWS
- `AWS_SECRET_ACCESS_KEY` - Secret Access Key da sua conta AWS

#### Database Passwords
- `DB_PASSWORD_DEV` - Senha do banco de dados para desenvolvimento
- `DB_PASSWORD_PROD` - Senha do banco de dados para produção

#### Network
- `MY_IP` - Seu endereço IP para acesso SSH (ex: `179.218.23.204/32`)

#### SSH Key
- `SSH_PUBLIC_KEY` - Chave pública SSH para acesso às instâncias EC2

**Como obter:**
```bash
# Se você já tem uma chave SSH
cat ~/.ssh/aws_key.pub

# Ou criar uma nova chave
ssh-keygen -t rsa -b 4096 -f ~/.ssh/aws_key -C "github-actions"
cat ~/.ssh/aws_key.pub
```

Copie o conteúdo completo (começando com `ssh-rsa` ou `ssh-ed25519`) e adicione como secret.

## Como obter as credenciais AWS

### 1. Criar usuário IAM na AWS

1. Acesse o console da AWS
2. Vá em **IAM** → **Users** → **Add users**
3. Crie um usuário com permissões para:
   - EC2 (criar, modificar, deletar instâncias)
   - RDS (criar, modificar, deletar bancos de dados)
   - VPC (criar e gerenciar VPCs)
   - Security Groups
   - Key Pairs

### 2. Criar Access Key

1. No usuário criado, vá em **Security credentials**
2. Clique em **Create access key**
3. Escolha **Application running outside AWS**
4. Copie o **Access key ID** e **Secret access key**
5. Adicione como secrets no GitHub

### 3. Política IAM recomendada

Crie uma política customizada com as seguintes permissões:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ec2:*",
        "rds:*",
        "vpc:*",
        "iam:CreateRole",
        "iam:AttachRolePolicy",
        "iam:PassRole"
      ],
      "Resource": "*"
    }
  ]
}
```

## Workflows

### CI (Continuous Integration)
- **Trigger**: Pull requests e pushes para `develop` e `main`
- **Ações**: Lint, testes e build

### Deploy to Development
- **Trigger**: Push para `develop` ou manual via `workflow_dispatch`
- **Ações**: 
  - Executa testes
  - Faz build da aplicação
  - Deploy da infraestrutura via Terraform
  - Mostra resumo do deploy

### Deploy to Production
- **Trigger**: Push para `main` ou manual via `workflow_dispatch`
- **Ações**: 
  - Executa testes
  - Faz build da aplicação
  - Deploy da infraestrutura via Terraform
  - Mostra resumo do deploy
  - **Requer aprovação** (se configurado no environment)

## Configurar Environment Protection (Opcional)

Para produção, você pode configurar proteções:

1. Vá em **Settings** → **Environments**
2. Crie um environment chamado `production`
3. Configure:
   - **Required reviewers**: Adicione pessoas que devem aprovar o deploy
   - **Wait timer**: Tempo de espera antes do deploy (opcional)

## Testando os Workflows

### Testar CI
1. Crie um pull request para `develop` ou `main`
2. O workflow de CI será executado automaticamente

### Testar Deploy Manual
1. Vá em **Actions** no GitHub
2. Selecione o workflow desejado (Deploy to Development ou Deploy to Production)
3. Clique em **Run workflow**
4. Selecione a branch e clique em **Run workflow**

## Troubleshooting

### Erro de autenticação AWS
- Verifique se os secrets `AWS_ACCESS_KEY_ID` e `AWS_SECRET_ACCESS_KEY` estão configurados corretamente
- Verifique se o usuário IAM tem as permissões necessárias

### Erro no Terraform
- Verifique se todos os secrets necessários estão configurados
- Verifique os logs do workflow para mais detalhes

### Erro de build
- Verifique se todas as dependências estão no `package.json`
- Verifique se não há erros de lint ou testes falhando

