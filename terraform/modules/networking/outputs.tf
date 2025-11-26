output "vpc_id" {
  description = "ID da VPC principal"
  value       = aws_vpc.main.id
}

output "public_subnet_id" {
  description = "ID da subnet pública"
  value       = aws_subnet.public.id
}

output "private_subnet_1_id" {
  description = "ID da primeira subnet privada"
  value       = aws_subnet.private_1.id
}

output "private_subnet_2_id" {
  description = "ID da segunda subnet privada"
  value       = aws_subnet.private_2.id
}

output "db_subnet_group_name" {
  description = "Nome do grupo de subnets para RDS"
  value       = aws_db_subnet_group.main.name
}
