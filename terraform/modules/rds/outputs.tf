output "rds_endpoint" {
  description = "Endpoint da instância RDS"
  value       = aws_db_instance.postgres.endpoint
}

output "rds_address" {
  description = "Endereço da instância RDS"
  value       = aws_db_instance.postgres.address
}

output "database_name" {
  description = "Nome do banco de dados"
  value       = aws_db_instance.postgres.db_name
}
