# Diagnóstico de Problemas no EC2

## Problema: API não está acessível pelo IP

### Checklist de Verificação

Execute estes comandos via SSH para diagnosticar:

```bash
# 1. Conectar ao EC2
ssh -i ~/.ssh/aws_key ec2-user@98.86.229.75

# 2. Verificar se Docker está rodando
sudo systemctl status docker

# 3. Verificar containers
docker ps -a

# 4. Ver logs do container (últimas 50 linhas)
docker logs --tail 50 teddy-backend-app

# 5. Verificar se porta 3000 está em uso
sudo netstat -tlnp | grep 3000
# ou
sudo ss -tlnp | grep 3000

# 6. Verificar arquivo .env
cat /home/ec2-user/app/.env

# 7. Verificar se docker-compose.prod.yml existe
ls -la /home/ec2-user/app/docker-compose.prod.yml

# 8. Testar conexão localmente no EC2
curl http://localhost:3000/api-docs

# 9. Verificar variáveis de ambiente do container
docker exec teddy-backend-app env
```

### Problemas Comuns e Soluções

#### 1. Container não está rodando

**Sintoma:** `docker ps` não mostra `teddy-backend-app`

**Solução:**
```bash
cd /home/ec2-user/app
docker-compose -f docker-compose.prod.yml up -d --build
docker logs teddy-backend-app
```

#### 2. Container está crashando

**Sintoma:** Container existe mas está `Exited`

**Verificar logs:**
```bash
docker logs teddy-backend-app
```

**Problemas comuns:**
- **Erro de conexão com RDS**: Verificar `DATABASE_HOST` no `.env`
  - O RDS endpoint pode ter `:5432` no final, mas o TypeORM pode precisar apenas do hostname
  - Exemplo: `teddy-backend-api-dev-db.cefuq2ao6tm0.us-east-1.rds.amazonaws.com` (sem `:5432`)
- **Erro de autenticação**: Verificar `DATABASE_USER` e `DATABASE_PASSWORD`
- **Porta já em uso**: Verificar se outro processo está usando porta 3000

#### 3. RDS Endpoint com porta no final

**Problema:** O output do Terraform retorna `hostname:5432`, mas o TypeORM pode precisar apenas do hostname.

**Solução:** Ajustar o `.env` para separar host e porta:

```bash
# No EC2, editar .env
ssh -i ~/.ssh/aws_key ec2-user@98.86.229.75
cd /home/ec2-user/app

# Extrair apenas o hostname (sem :5432)
RDS_HOST=$(echo "teddy-backend-api-dev-db.cefuq2ao6tm0.us-east-1.rds.amazonaws.com:5432" | cut -d: -f1)

# Atualizar .env
sed -i "s|DATABASE_HOST=.*|DATABASE_HOST=${RDS_HOST}|" .env

# Reiniciar container
docker-compose -f docker-compose.prod.yml restart
```

#### 4. Security Group não permite tráfego

**Verificar:** A porta 3000 deve estar aberta para `0.0.0.0/0`

**Solução:** Verificar no AWS Console ou via Terraform:
```bash
terraform -chdir=./terraform/environments/dev output
```

#### 5. Aplicação não está escutando em 0.0.0.0

**Verificar:** O `main.ts` deve ter `app.listen(port, '0.0.0.0')`

**Status:** ✅ Já está correto no código

### Script de Diagnóstico Completo

Execute este script no EC2:

```bash
#!/bin/bash
echo "=== Diagnóstico EC2 ==="
echo ""
echo "1. Docker Status:"
sudo systemctl status docker | head -5
echo ""
echo "2. Containers:"
docker ps -a
echo ""
echo "3. Logs do Container (últimas 30 linhas):"
docker logs --tail 30 teddy-backend-app 2>&1 || echo "Container não encontrado"
echo ""
echo "4. Porta 3000:"
sudo netstat -tlnp | grep 3000 || echo "Porta 3000 não está em uso"
echo ""
echo "5. Arquivo .env:"
cat /home/ec2-user/app/.env 2>/dev/null || echo ".env não encontrado"
echo ""
echo "6. Teste local:"
curl -v http://localhost:3000/api-docs 2>&1 | head -20 || echo "Falha na conexão local"
```

