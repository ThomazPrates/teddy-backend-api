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

locals {
  ssh_public_key_raw = var.ssh_public_key != "" ? var.ssh_public_key : file(pathexpand(var.local_ssh_pub_file))
  ssh_public_key_content = trimspace(replace(local.ssh_public_key_raw, "/[\r\n]+/", ""))
}

resource "aws_key_pair" "main" {
  key_name   = "${var.project_name}-${var.environment}-key"
  public_key = local.ssh_public_key_content

  tags = {
    Name        = "${var.project_name}-${var.environment}-key"
    Environment = var.environment
  }
}

resource "aws_instance" "app" {
  ami                         = data.aws_ami.amazon_linux_2.id
  instance_type               = var.environment == "prod" ? "t3.small" : "t2.micro"
  subnet_id                   = var.subnet_id
  vpc_security_group_ids      = var.vpc_security_group_ids
  key_name                    = aws_key_pair.main.key_name
  associate_public_ip_address = true
  user_data                   = file("${path.module}/user-data.sh")

  tags = {
    Name        = "${var.project_name}-${var.environment}-app-server"
    Environment = var.environment
  }
}
