# Data source to get the latest Amazon Linux 2 AMI
data "aws_ami" "amazon_linux_2" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Key Pair (você precisa gerar uma chave SSH antes)
resource "aws_key_pair" "main" {
  key_name   = "${var.project_name}-key"
  public_key = file("~/.ssh/aws_key.pub")
}

# EC2 Instance
resource "aws_instance" "app" {
  ami           = data.aws_ami.amazon_linux_2.id
  instance_type = "t2.micro" # Free tier

  subnet_id                   = aws_subnet.public.id
  vpc_security_group_ids      = [aws_security_group.ec2.id]
  key_name                    = aws_key_pair.main.key_name
  associate_public_ip_address = true

  user_data = <<-EOF
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
              EOF

  tags = {
    Name = "${var.project_name}-app-server"
  }
}

