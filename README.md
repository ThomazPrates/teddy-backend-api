# README - Deploy da Aplicação NestJS com Docker, Terraform, EC2 e RDS PostgreSQL

## Visão Geral  
Esta aplicação NestJS está configurada para ser executada via Docker Compose e implantada em infraestrutura AWS usando Terraform. A hospedagem ocorre em instância EC2 e o banco de dados é um RDS PostgreSQL.

## Pré-requisitos  
- Docker e Docker Compose instalados na máquina local  
- AWS CLI configurada  
- Terraform instalado  
- Conta AWS com permissões para criar EC2, RDS e demais recursos  

## Comandos principais - package.json

| Comando                       | Descrição                                                      |
|------------------------------|----------------------------------------------------------------|
| `npm run build`               | Compila o projeto NestJS                                       |
| `npm run format`              | Formata o código com Prettier                                  |
| `npm run start`               | Inicia a aplicação NestJS localmente                           |
| `npm run start:debug`         | Inicia em modo debug e watch                                   |
| `npm run lint`                | Executa ESLint para correção automática                        |
| `npm run test`                | Executa os testes com Jest                                     |
| `npm run test:watch`          | Executa testes em modo watch                                   |
| `npm run test:cov`            | Roda testes com cobertura                                      |
| `npm run test:debug`          | Debug dos testes                                               |
| `npm run docker:up`           | Sobe os containers via docker-compose                          |
| `npm run docker:down`         | Derruba os containers (terraform/docker-compose.yml)           |
| `npm run terraform:init:dev` | Inicializa Terraform para ambiente dev                         |
| `npm run terraform:init:prod`| Inicializa Terraform para ambiente prod                        |
| `npm run terraform:plan:dev` | Exibe plano Terraform para dev                                 |
| `npm run terraform:plan:prod`| Exibe plano Terraform para prod                                |
| `npm run terraform:apply:dev`| Aplica infraestrutura Terraform para dev                      |
| `npm run terraform:apply:prod`| Aplica infraestrutura Terraform para prod                    |
| `npm run terraform:destroy:dev`| Destrói infraestrutura dev                                   |
| `npm run terraform:destroy:prod`| Destrói infraestrutura prod                                 |
| `npm run terraform:output:dev`| Exibe outputs Terraform dev                                   |
| `npm run terraform:output:prod`| Exibe outputs Terraform prod                                 |
| `npm run deploy`              | Build + aplica Terraform dev                                   |
| `npm run deploy:prod`         | Build + aplica Terraform prod                                  |

## Passo a passo para deploy  

1. Clone o repositório  
2. Configure os arquivos `terraform.tfvars` com as credenciais e parâmetros AWS  
3. Inicialize Terraform para o ambiente desejado: `npm run terraform:init:dev`
4. Planeje a infraestrutura: `npm run terraform:plan:dev`
5. Aplique alterações para criar recursos AWS (EC2, RDS): `npm run terraform:apply:dev`
6. Para testes locais, suba os containers Docker: `npm run docker:up`
7. Para produção, use os comandos equivalentes com `prod`.  

## Escalabilidade em Produção

### Escala Vertical  
- Consiste em aumentar recursos da instância EC2 (CPU, RAM) e do RDS (CPU, memória e armazenamento).  
- O Amazon RDS permite aumento automático ou manual do armazenamento, mas reduzí-lo manualmente não é suportado.  
- Pode causar downtime temporário durante upgrades, que deve ser planejado.  

### Escala Horizontal  
- Para EC2, usar Auto Scaling Groups que criam/removem instâncias automaticamente conforme demanda.  
- Para RDS PostgreSQL, é possível criar réplicas de leitura que distribuem a carga de leitura e aumentam capacidade horizontalmente.  

### Desafios e Soluções  
- **Sincronização e consistência de dados**: As réplicas são somente leitura; escritas devem ir para a instância principal. Isso exige arquitetura que lide com replicação e failover.  
- **Gerenciamento de estado da aplicação**: Em múltiplas instâncias EC2, use balanceadores de carga (ELB) para distribuir requisições.  
- **Limitações de redução de recursos**: Reduzir a escala vertical do RDS não é suportado automaticamente; planejamento é essencial para evitar recursos ociosos.  
- **Escalabilidade automática**: Configurar Auto Scaling para EC2 e monitorar uso do RDS para ajustes manuais ou semi-automáticos.  