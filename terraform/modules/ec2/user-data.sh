#!/bin/bash
yum update -y

# Instalar Node.js 18
curl -sL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Instalar Git
yum install -y git

# Instalar PM2
npm install -g pm2

# Criar diretório para a aplicação
mkdir -p /home/ec2-user/app
chown -R ec2-user:ec2-user /home/ec2-user/app
