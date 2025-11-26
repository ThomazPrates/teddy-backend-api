terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

module "networking" {
  source        = "../../modules/networking"
  aws_region    = var.aws_region
  project_name  = var.project_name
  environment   = var.environment
}

module "security" {
  source       = "../../modules/security"
  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.networking.vpc_id
  my_ip        = var.my_ip
}

module "ec2" {
  source                 = "../../modules/ec2"
  project_name           = var.project_name
  environment            = var.environment
  ssh_public_key         = var.ssh_public_key
  local_ssh_pub_file     = "~/.ssh/aws_key.pub"
  subnet_id              = module.networking.public_subnet_id
  vpc_security_group_ids = [module.security.ec2_sg_id]
}

module "rds" {
  source                 = "../../modules/rds"
  project_name           = var.project_name
  environment            = var.environment
  db_username            = var.db_username
  db_password            = var.db_password
  db_subnet_group_name   = module.networking.db_subnet_group_name
  vpc_security_group_ids = [module.security.rds_sg_id]
}

output "ec2_public_ip" {
  value = module.ec2.ec2_public_ip
}

output "ec2_public_dns" {
  value = module.ec2.ec2_public_dns
}

output "rds_endpoint" {
  value = module.rds.rds_endpoint
}

output "database_name" {
  value = module.rds.database_name
}
