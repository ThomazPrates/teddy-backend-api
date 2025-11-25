output "ec2_public_ip" {
  description = "EC2 Public IP"
  value       = aws_instance.app.public_ip
}

output "ec2_public_dns" {
  description = "EC2 Public DNS"
  value       = aws_instance.app.public_dns
}

output "rds_endpoint" {
  description = "RDS Endpoint"
  value       = aws_db_instance.postgres.endpoint
}

output "rds_address" {
  description = "RDS Address"
  value       = aws_db_instance.postgres.address
}

output "database_name" {
  description = "Database Name"
  value       = aws_db_instance.postgres.db_name
}

