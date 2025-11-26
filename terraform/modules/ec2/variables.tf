variable "project_name" {
  type        = string
  description = "Project name para compor nomes dos recursos"
}

variable "environment" {
  type        = string
  description = "Ambiente do recurso (ex: dev, prod)"
}

variable "ssh_public_key" {
  type        = string
  description = "Conteúdo da chave pública SSH"
  default     = ""
  sensitive   = true
}

variable "local_ssh_pub_file" {
  type        = string
  description = "Arquivo local padrão da chave pública SSH"
  default     = "~/.ssh/aws_key.pub"
}

variable "subnet_id" {
  type        = string
  description = "ID da subnet pública para instância EC2"
}

variable "vpc_security_group_ids" {
  type        = list(string)
  description = "IDs dos Security Groups para EC2"
}
