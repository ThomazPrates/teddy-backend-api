output "ec2_sg_id" {
  description = "ID do security group para EC2"
  value       = aws_security_group.ec2.id
}

output "rds_sg_id" {
  description = "ID do security group para RDS"
  value       = aws_security_group.rds.id
}
