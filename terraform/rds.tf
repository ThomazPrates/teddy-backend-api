resource "aws_db_instance" "postgres" {
  identifier        = "${var.project_name}-db"
  engine            = "postgres"
  instance_class    = "db.t3.micro" # Free tier
  allocated_storage = 20
  storage_type      = "gp2"

  db_name  = "teddydb"
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  skip_final_snapshot       = true # Para desenvolvimento
  publicly_accessible       = false
  auto_minor_version_upgrade = true

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "mon:04:00-mon:05:00"

  tags = {
    Name = "${var.project_name}-postgres"
  }
}

