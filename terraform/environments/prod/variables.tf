variable "aws_region" {
  description = "AWS Region"
  type        = string
}

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment"
  type        = string
}

variable "db_username" {
  description = "Database username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "my_ip" {
  description = "Your IP address for SSH access"
  type        = string
}

variable "ssh_public_key" {
  description = "SSH public key for EC2 access (opcional - se não fornecido, lê de ~/.ssh/aws_key.pub)"
  type        = string
  sensitive   = true
  default     = ""
}
