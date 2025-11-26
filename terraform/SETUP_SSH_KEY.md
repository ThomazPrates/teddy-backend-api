# 🔑 Configuração da Chave SSH

O Terraform lê automaticamente a chave SSH pública do arquivo `~/.ssh/aws_key.pub`. Você não precisa passar a chave pelo terminal.

## 📝 Passo a Passo

### 1. Gerar Chave SSH (se ainda não tiver)

```bash
# Gerar chave SSH
ssh-keygen -t rsa -b 4096 -f ~/.ssh/aws_key

# Isso cria dois arquivos:
# - ~/.ssh/aws_key (chave privada - NÃO compartilhe!)
# - ~/.ssh/aws_key.pub (chave pública - usada pelo Terraform)
```

### 2. Verificar se a chave pública existe

```bash
# Linux/Mac
cat ~/.ssh/aws_key.pub

# Windows (PowerShell)
Get-Content $env:USERPROFILE\.ssh\aws_key.pub
```

A chave deve estar no formato OpenSSH, algo como:
```
ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQC... seu-email@example.com
```

### 3. Usar no Terraform

O Terraform vai ler automaticamente de `~/.ssh/aws_key.pub`. Não precisa passar nenhuma variável!

```bash
# Apenas execute normalmente
terraform init
terraform plan
terraform apply
```

## 🔧 Alternativas

### Opção 1: Usar arquivo em outro local

Se sua chave estiver em outro local, edite `terraform/environments/dev/main.tf`:

```hcl
module "ec2" {
  # ...
  local_ssh_pub_file = "/caminho/para/sua/chave.pub"
  # ...
}
```

### Opção 2: Passar via variável de ambiente (se necessário)

```bash
export TF_VAR_ssh_public_key="$(cat ~/.ssh/aws_key.pub)"
terraform apply
```

### Opção 3: Usar AWS Systems Manager Parameter Store

Para produção, você pode armazenar a chave no AWS Systems Manager:

```hcl
data "aws_ssm_parameter" "ssh_public_key" {
  name = "/teddy-backend/ssh-public-key"
}

module "ec2" {
  ssh_public_key = data.aws_ssm_parameter.ssh_public_key.value
  # ...
}
```

## ⚠️ Troubleshooting

### Erro: "Key is not in valid OpenSSH public key format"

1. Verifique se o arquivo existe:
   ```bash
   ls -la ~/.ssh/aws_key.pub
   ```

2. Verifique o formato da chave:
   ```bash
   head -1 ~/.ssh/aws_key.pub
   ```
   Deve começar com `ssh-rsa`, `ssh-ed25519`, ou `ecdsa-sha2-nistp256`

3. Se a chave tiver quebras de linha ou espaços extras, normalize:
   ```bash
   # Linux/Mac
   cat ~/.ssh/aws_key.pub | tr -d '\n' > ~/.ssh/aws_key_clean.pub
   
   # Windows (PowerShell)
   (Get-Content $env:USERPROFILE\.ssh\aws_key.pub -Raw).Trim() | Set-Content $env:USERPROFILE\.ssh\aws_key_clean.pub
   ```

### Erro: "No such file or directory"

Certifique-se de que o arquivo `~/.ssh/aws_key.pub` existe. Se não existir, gere a chave (veja passo 1 acima).

## 🔒 Segurança

- ✅ **Chave pública** (`aws_key.pub`) pode ser compartilhada
- ❌ **Chave privada** (`aws_key`) NUNCA compartilhe ou commite no Git
- ✅ Adicione `~/.ssh/aws_key` ao `.gitignore`
- ✅ Use permissões corretas:
  ```bash
  chmod 600 ~/.ssh/aws_key      # Chave privada
  chmod 644 ~/.ssh/aws_key.pub  # Chave pública
  ```

## 📚 Referências

- [AWS EC2 Key Pairs](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html)
- [OpenSSH Key Format](https://www.ssh.com/academy/ssh/keygen)

