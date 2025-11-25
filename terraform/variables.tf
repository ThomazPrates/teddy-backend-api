variable "aws_region" {
  description = "AWS Region"
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name"
  default     = "mvp-teddy"
}

variable "environment" {
  description = "Environment"
  default     = "dev"
}

variable "db_username" {
  description = "Database username"
  default     = "postgres"
  sensitive   = true
}

variable "db_password" {
  description = "Database password"
  sensitive   = true
}

variable "my_ip" {
  description = "Your IP address for SSH access"
  type        = string
}

variable "ssh_public_key" {
  description = "SSH public key for EC2 access"
  type        = string
  default     = ""
  sensitive   = true
}

