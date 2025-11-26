#!/bin/bash
# Script de diagnóstico rápido para EC2
# Uso: ssh -i ~/.ssh/aws_key ec2-user@<EC2_IP> 'bash -s' < check-ec2.sh

echo "=== Diagnóstico EC2 ==="
echo ""

echo "1. Docker Status:"
sudo systemctl status docker | head -5 || echo "Docker não está rodando"
echo ""

echo "2. Containers Docker:"
docker ps -a || echo "Erro ao listar containers"
echo ""

echo "3. Logs do Container (últimas 50 linhas):"
docker logs --tail 50 teddy-backend-app 2>&1 || echo "Container não encontrado ou sem logs"
echo ""

echo "4. Porta 3000:"
sudo netstat -tlnp | grep 3000 || sudo ss -tlnp | grep 3000 || echo "Porta 3000 não está em uso"
echo ""

echo "5. Arquivo .env:"
cat /home/ec2-user/app/.env 2>/dev/null || echo ".env não encontrado"
echo ""

echo "6. Teste local no EC2:"
curl -v http://localhost:3000/api-docs 2>&1 | head -20 || echo "Falha na conexão local"
echo ""

echo "7. Variáveis de ambiente do container:"
docker exec teddy-backend-app env 2>/dev/null | grep -E "DATABASE|PORT|NODE_ENV" || echo "Container não está rodando ou erro ao executar"
echo ""

echo "8. Verificar se docker-compose.prod.yml existe:"
ls -la /home/ec2-user/app/docker-compose.prod.yml 2>/dev/null || echo "docker-compose.prod.yml não encontrado"
echo ""

echo "=== Fim do Diagnóstico ==="

