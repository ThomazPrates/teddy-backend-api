# 🔧 Guia de Troubleshooting - Deploy EC2

## Problema: "A conexão foi recusada" ao acessar a API

### Passo 1: Diagnosticar o problema

Execute o script de diagnóstico:

**PowerShell:**
```powershell
.\scripts\diagnose-ec2.ps1 -EC2IP "98.87.7.164"
```

**Bash/Linux:**
```bash
chmod +x scripts/diagnose-ec2.sh
./scripts/diagnose-ec2.sh 98.87.7.164
```

Isso vai mostrar:
- ✅ Status do Docker
- ✅ Containers em execução
- ✅ Logs do container
- ✅ Porta 3000 em uso
- ✅ Arquivo .env
- ✅ docker-compose.prod.yml

### Passo 2: Problemas comuns e soluções

#### ❌ Problema 1: Container não existe ou não está rodando

**Sintomas:**
- `docker ps -a` não mostra `teddy-backend-app`
- Ou mostra mas com status `Exited`

**Solução:**
Execute o deploy manual:

```powershell
.\scripts\deploy-manual.ps1 `
  -EC2IP "98.87.7.164" `
  -RDSEndpoint "teddy-backend-api-develop-db.cefuq2ao6tm0.us-east-1.rds.amazonaws.com:5432" `
  -DBUser "seu_db_user" `
  -DBPassword "sua_db_password" `
  -DBName "teddydb" `
  -JWTSecret "seu_jwt_secret"
```

#### ❌ Problema 2: Docker não está rodando

**Sintomas:**
- `systemctl status docker` mostra erro
- `docker ps` retorna erro

**Solução via SSH:**
```bash
ssh -i ~/.ssh/aws_key ec2-user@98.87.7.164
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker ec2-user
# Sair e reconectar para aplicar grupo docker
exit
```

#### ❌ Problema 3: Container crashando (ver logs)

**Sintomas:**
- Container existe mas está `Exited`
- Logs mostram erros

**Solução:**
1. Ver logs detalhados:
```bash
ssh -i ~/.ssh/aws_key ec2-user@98.87.7.164
docker logs teddy-backend-app
```

2. Problemas comuns:
   - **Erro de conexão com RDS**: Verifique se o RDS endpoint está correto no `.env`
   - **Erro de autenticação**: Verifique `DATABASE_USER` e `DATABASE_PASSWORD`
   - **Porta já em uso**: Verifique se outro processo está usando porta 3000

#### ❌ Problema 4: Arquivo .env não existe ou está incorreto

**Sintomas:**
- `.env` não existe ou está vazio
- Variáveis de ambiente incorretas

**Solução via SSH:**
```bash
ssh -i ~/.ssh/aws_key ec2-user@98.87.7.164
cat /home/ec2-user/app/.env
```

Se estiver incorreto, crie manualmente:
```bash
cat > /home/ec2-user/app/.env << 'EOF'
NODE_ENV=production
PORT=3000
BASE_URL=http://98.87.7.164:3000
DATABASE_HOST=teddy-backend-api-develop-db.cefuq2ao6tm0.us-east-1.rds.amazonaws.com:5432
DATABASE_PORT=5432
DATABASE_USER=seu_db_user
DATABASE_PASSWORD=sua_db_password
DATABASE_NAME=teddydb
JWT_SECRET=seu_jwt_secret
JWT_EXPIRES_IN=1d
EOF
```

#### ❌ Problema 5: Deploy não foi executado (apenas Terraform foi aplicado)

**Sintomas:**
- EC2 existe mas não há código/aplicação
- `/home/ec2-user/app` está vazio

**Solução:**
Execute o deploy manual (veja Problema 1) ou aguarde o CI/CD executar automaticamente ao fazer push para `develop` ou `main`.

### Passo 3: Verificar se a aplicação está funcionando

Após o deploy, teste:

```powershell
# Teste básico
Invoke-WebRequest -Uri "http://98.87.7.164:3000/api-docs" -UseBasicParsing

# Ou via curl
curl http://98.87.7.164:3000/api-docs
```

### Passo 4: Comandos úteis para debug

**Conectar via SSH:**
```bash
ssh -i ~/.ssh/aws_key ec2-user@98.87.7.164
```

**Ver containers:**
```bash
docker ps -a
```

**Ver logs em tempo real:**
```bash
docker logs -f teddy-backend-app
```

**Reiniciar container:**
```bash
cd /home/ec2-user/app
docker-compose -f docker-compose.prod.yml restart
```

**Rebuild completo:**
```bash
cd /home/ec2-user/app
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

**Verificar porta:**
```bash
sudo netstat -tlnp | grep 3000
```

**Verificar variáveis de ambiente do container:**
```bash
docker exec teddy-backend-app env
```

### Passo 5: Se nada funcionar

1. **Verifique o Security Group:**
   - Porta 3000 deve estar aberta para `0.0.0.0/0`
   - Execute: `terraform output` para verificar

2. **Verifique o RDS:**
   - O RDS deve estar acessível do EC2
   - Security Group do RDS deve permitir conexão do EC2

3. **Verifique logs do CloudWatch (se habilitado):**
   - AWS Console > EC2 > Instances > Selecione a instância > Logs

4. **Recrie a infraestrutura:**
   ```bash
   terraform destroy
   terraform apply
   ```

## Checklist de Deploy

- [ ] Terraform apply executado com sucesso
- [ ] EC2 está rodando (verificar no AWS Console)
- [ ] Security Group permite porta 3000
- [ ] SSH funciona (`ssh -i ~/.ssh/aws_key ec2-user@<IP>`)
- [ ] Docker está instalado e rodando (`docker ps`)
- [ ] Arquivo `.env` existe e está correto
- [ ] `docker-compose.prod.yml` existe no EC2
- [ ] Container `teddy-backend-app` está rodando (`docker ps`)
- [ ] Logs não mostram erros (`docker logs teddy-backend-app`)
- [ ] Porta 3000 está em uso (`netstat -tlnp | grep 3000`)
- [ ] API responde (`curl http://<IP>:3000/api-docs`)

