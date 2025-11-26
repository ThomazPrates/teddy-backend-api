#!/bin/bash
yum update -y

# Instalar Docker
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -aG docker ec2-user

# Aguardar Docker estar totalmente iniciado
sleep 5
systemctl status docker || true

# Instalar Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Instalar Git
yum install -y git

# Criar diretório para a aplicação
mkdir -p /home/ec2-user/app
chown -R ec2-user:ec2-user /home/ec2-user/app

# Criar script de deploy
cat > /home/ec2-user/deploy.sh << 'EOF'
#!/bin/bash
cd /home/ec2-user/app

# Parar containers existentes
docker-compose down || true

# Pull do código (ou usar outra forma de deploy)
# git pull origin main

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
  cat > .env << EOL
NODE_ENV=production
PORT=3000
DATABASE_HOST=${DATABASE_HOST}
DATABASE_PORT=5432
DATABASE_USER=${DATABASE_USER}
DATABASE_PASSWORD=${DATABASE_PASSWORD}
DATABASE_NAME=${DATABASE_NAME}
JWT_SECRET=${JWT_SECRET}
JWT_EXPIRES_IN=1d
EOL
fi

# Build e start
docker-compose -f docker-compose.prod.yml up -d --build
EOF

chmod +x /home/ec2-user/deploy.sh
chown ec2-user:ec2-user /home/ec2-user/deploy.sh
