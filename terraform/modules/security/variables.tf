variable "project_name" {
  type        = string
  description = "Nome do projeto para tag"
}

variable "environment" {
  type        = string
  description = "Ambiente (dev, prod, etc.)"
}

variable "vpc_id" {
  type        = string
  description = "ID da VPC onde serão criados os security groups"
}

variable "my_ip" {
  type        = string
  description = "IP permitido para acessar a EC2 via SSH"
}
