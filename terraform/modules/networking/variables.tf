variable "aws_region" {
  type        = string
  description = "Região da AWS"
}

variable "project_name" {
  type        = string
  description = "Nome do projeto para tags e composição dos recursos"
}

variable "environment" {
  type        = string
  description = "Ambiente (dev, staging, prod, etc.)"
}
