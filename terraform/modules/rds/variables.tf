variable "project_name" {
  type        = string
  description = "Nome do projeto para tags e identificadores"
}

variable "environment" {
  type        = string
  description = "Ambiente (dev, staging, prod)"
}

variable "db_username" {
  type        = string
  description = "Usuário do banco de dados"
  sensitive   = true
}

variable "db_password" {
  type        = string
  description = "Senha do banco de dados"
  sensitive   = true
}

variable "db_subnet_group_name" {
  type        = string
  description = "Nome do grupo de subnets para RDS"
}

variable "vpc_security_group_ids" {
  type        = list(string)
  description = "Lista de IDs dos Security Groups para o RDS"
}
