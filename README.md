# E-Commerce Backend built with Node.js & PostgreSQL and deployed on AWS ECS

This application implements an e-commerce API with user authentication, product listing, cart management, and order creation. It uses PostgreSQL with Flyway-based database migrations, Docker for local development, and is designed to be deployed on AWS ECS via GitHub Actions CI/CD.

## Project Overview

This project demonstrates a complete backend workflow for a modern web application, including:

- REST API development with Node.js and Express
- PostgreSQL database integration
- Flyway migration management
- Dockerized local development and testing
- AWS deployment using ECS, RDS, and Secrets Manager
- CI/CD automation with GitHub Actions

The application is structured as a small e-commerce platform with the following core features:

- User registration and login
- JWT-based authentication
- Product catalog
- Shopping cart functionality
- Order placement and history

## Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Flyway
- Docker / Docker Compose
- GitHub Actions
- AWS ECS
- AWS ECR
- AWS RDS PostgreSQL
- AWS Secrets Manager

## Project Architecture

The application is built around a modular backend structure with route handlers and a service layer:

- Authentication routes for register/login
- Product routes for browsing products
- Cart routes for adding/updating/removing items
- Order routes for checkout and order history
- Service modules for products, cart, orders, auth, and user profile logic
- PostgreSQL database with Flyway migrations for schema versioning

## Local Development

### Prerequisites

- Docker
- Docker Compose
- Node.js (optional, for local non-container development)

### Run Locally with Docker

```bash
docker compose up --build
```

The stack will start:

- PostgreSQL database
- Flyway migration container
- Node.js application server

### Verify the app

The service will be available at:

```bash
http://localhost:3000
```

### Health Check

```bash
curl http://localhost:3000/health
```

## API Endpoints

| Group | Method | Endpoint | Description |
| --- | --- | --- | --- |
| Authentication | POST | `/register` | Register a new user account. |
| Authentication | POST | `/login` | Authenticate a user and receive a JWT token. |
| Products | GET | `/products` | List all active products. |
| Products | POST | `/products` | Create a new product (authenticated). |
| Cart | GET | `/cart` | Get the current user's cart contents. |
| Cart | POST | `/cart/items` | Add an item to the cart. |
| Cart | PUT | `/cart/items/:productId` | Update the quantity of an item in the cart. |
| Cart | DELETE | `/cart/items/:productId` | Remove an item from the cart. |
| Orders | POST | `/orders` | Create an order from the current cart. |
| Orders | GET | `/orders` | Get the current user's order history. |
| Orders | GET | `/orders/:id` | Get details for a specific order. |

## DevOps & AWS Deployment  

This project is designed for deployment on AWS using the following services:

- Amazon ECR for storing container images
- Amazon ECS for running the containerized app
- Amazon RDS for PostgreSQL hosting
- AWS Secrets Manager for database credentials
- GitHub Actions for automated deployment

## Step-by-Step Deployment Guide

### 1. Create Amazon ECR repositories

Create two repositories:

- Application image: `nodeapp-ecommerce`
- Flyway migration image: `nodeapp-ecommerce-flyway`

### 2. Create a VPC

Create a VPC with:

- 2 public subnets
- 2 private subnets
- an Internet Gateway
- a NAT Gateway
- a public route table
- a private route table

### 3. Create security groups

#### ALB security group

Inbound:

- HTTP 80 from `0.0.0.0/0`

Outbound:

- All traffic

#### ECS security group

Inbound:

- TCP 3000 from the ALB security group

Outbound:

- All traffic

#### RDS security group

Inbound:

- TCP 5432 from the ECS security group

Outbound:

- Default

### 4. Create Amazon RDS

Create a PostgreSQL RDS instance in the private subnets.

Use:

- engine: PostgreSQL
- deployment: Single AZ
- database name: `app_db`
- username: `app_user`

After creation, copy the RDS endpoint.

### 5. Create Secrets Manager secrets

#### Database secret

Name: `nodeapp/db`

```json
{
  "DB_HOST": "RDS_ENDPOINT",
  "DB_PORT": "5432",
  "DB_NAME": "app_db",
  "DB_USER": "app_user",
  "DB_PASSWORD": "your-password"
}
```

#### Application secret

Name: `nodeapp/app`

```json
{
  "JWT_SECRET": "your-secret",
  "NODE_ENV": "production"
}
```

### 6. Create IAM roles

#### ECS task execution role

Attach:

- `AmazonECSTaskExecutionRolePolicy`
- a policy that allows `secretsmanager:GetSecretValue` for the required secrets

#### GitHub Actions IAM role

Configure GitHub OIDC authentication and grant permissions for:

- Amazon ECR
- Amazon ECS
- IAM PassRole
- CloudWatch Logs

### 7. Create the ECS cluster

Create a cluster using:

- launch type: Fargate
- cluster name: `ecommerce-cluster`

### 8. Create the ECS task definition

Use the application image `nodeapp-ecommerce` and expose port `3000`.

Inject these secrets from Secrets Manager:

- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `JWT_SECRET`
- `NODE_ENV`

### 9. Create the Flyway task definition

Use the Flyway image `nodeapp-ecommerce-flyway`.

Set the command to:

```text
migrate
```

Set these environment variables:

```text
FLYWAY_URL=jdbc:postgresql://RDS_ENDPOINT:5432/app_db
FLYWAY_CONNECT_RETRIES=60
FLYWAY_BASELINE_ON_MIGRATE=true
```

And connect these secrets:

- `FLYWAY_USER`
- `FLYWAY_PASSWORD`

### 10. Create the ECS service

Deploy the app service with:

- launch type: Fargate
- private subnets
- ECS security group
- desired count: `1`

### 11. Create the Application Load Balancer

Deploy the ALB in the public subnets.

Listener:

- HTTP `:80`

Target group:

- HTTP `:3000`

Health check:

- path: `/health`
- expected status: `200`

### 12. Configure GitHub secrets

Add this repository secret:

```text
AWS_ROLE_ARN
```

### 13. Update Pipeline environment variables

Before running the pipeline you must replace the placeholder environment variables used by the workflow. Edit `.github/workflows/ci-cd.yml` (or set these as repository-level variables) and replace the sample values with your AWS account-specific values:

Example `env` block in the workflow (replace values):

```yaml
env:
  AWS_REGION: eu-north-1
  ECR_REPO: nodeapp-ecommerce
  ECR_FLYWAY_REPO: nodeapp-ecommerce-flyway
  ECS_CLUSTER: ecommerce-cluster
  ECS_SERVICE: nodeapp-service
  MIGRATE_TASKDEF: flyway-migrations
  ECS_SUBNETS: "subnet-aaa,subnet-bbb"
  ECS_SG: sg-0123456789
```

Also verify any other placeholders in the workflow or README (for example `your-account` and `region`) are replaced with your actual AWS account ID and region.

## GitHub Actions CI/CD

The deployment pipeline performs the following steps automatically:

- Checkout source code
- Configure AWS credentials using OIDC
- Login to Amazon ECR
- Build the application Docker image
- Push the application image to Amazon ECR
- Build the Flyway Docker image
- Push the Flyway image to Amazon ECR
- Run Flyway migrations as an ECS Fargate task
- Wait for migration completion
- Force a new ECS deployment
- Wait until the ECS service reaches a stable state
- Verify that the application is running successfully

### Testing the Pipeline
<img width="935" height="414" alt="Screenshot 2026-07-09 222800" src="https://github.com/user-attachments/assets/ce67c453-7638-4006-80b9-14c99fed0b06" /> <br> 
<img width="923" height="452" alt="Screenshot 2026-07-09 222830" src="https://github.com/user-attachments/assets/84831d1f-a9ed-4703-8e2a-af389a4c94f3" />

### Accessing the app on /health and /products endpoints
<img width="949" height="213" alt="Screenshot 2026-07-09 222950" src="https://github.com/user-attachments/assets/f2ed32db-f273-469a-9b17-8bd539208297" /> <br> 
<img width="958" height="215" alt="Screenshot 2026-07-09 223017" src="https://github.com/user-attachments/assets/084c474c-18b7-435b-9086-b7e9066c6db8" />

## Monitoring with Prometheus and Grafana

This project now exposes Prometheus metrics from the Node.js app and includes a local Prometheus + Grafana stack in Docker Compose.

### 1. Start the full stack

```bash
docker compose up --build -d
```

This starts:

- the Node.js application on `http://localhost:3000`
- Prometheus on `http://localhost:9090`
- Grafana on `http://localhost:3001`

### 2. Verify the app metrics endpoint

```bash
curl http://localhost:3000/metrics
```

You should see Prometheus metrics like `http_requests_total` and `http_request_duration_seconds`.

### 3. Check Prometheus targets

Open:

```text
http://localhost:9090/targets
```

You should see the `nodeapp` target as `UP`.

### 4. Open Grafana

Login with:

- username: `admin`
- password: `admin`

Grafana is preconfigured to use Prometheus as a datasource, and the sample dashboard is auto-loaded from `monitoring/grafana/dashboards/nodeapp-overview.json`.

### 5. View the dashboard

In Grafana, go to:

- Dashboards → Browse → NodeApp Overview

The dashboard includes:

- request rate by route
- 95th percentile response latency
- HTTP status code breakdown

### 6. Useful PromQL examples

```promql
sum(rate(http_requests_total[5m])) by (route)

histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le, route))

sum(rate(http_requests_total[5m])) by (status_code)
```


