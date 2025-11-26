output "ec2_public_ip" {
  description = "IP público da EC2"
  value       = aws_instance.app.public_ip
}

output "ec2_public_dns" {
  description = "DNS público da EC2"
  value       = aws_instance.app.public_dns
}
