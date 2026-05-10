# 🚀 Expense Tracker — Azure DevOps Deployment Guide

Full deployment of the MERN Expense Tracker app on **Microsoft Azure** using:
- 🐳 **Docker** — containerize frontend (React/Nginx) and backend (Node/Express)
- ☸️ **Kubernetes (AKS)** — orchestrate containers with auto-scaling
- 🏗️ **Terraform** — provision all Azure infrastructure as code
- ⚙️ **GitHub Actions** — fully automated CI/CD pipeline

---

## Architecture Overview

```
GitHub Push → GitHub Actions
                ├── Test (backend + frontend)
                ├── Build & Push Docker images → Azure Container Registry (ACR)
                ├── Terraform → AKS + ACR + Key Vault + Log Analytics
                └── kubectl apply → Deploy to AKS
                                        ├── frontend (React + Nginx) ×2 pods
                                        ├── backend  (Node.js)       ×3 pods
                                        └── Ingress (NGINX) → TLS → Internet
```

MongoDB is hosted on **MongoDB Atlas** (recommended free tier for start).

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Azure CLI | Latest | `winget install Microsoft.AzureCLI` |
| Terraform | ≥ 1.7 | `winget install Hashicorp.Terraform` |
| kubectl | Latest | `az aks install-cli` |
| Docker Desktop | Latest | https://docker.com/products/docker-desktop |
| Git | Latest | https://git-scm.com |

---

## Step 1 — Azure Setup (One Time)

### 1.1 Login
```bash
az login
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### 1.2 Create Service Principal for GitHub Actions (OIDC — no passwords!)
```bash
# Create a service principal
az ad app create --display-name "expense-tracker-github-sp"

# Note the appId from output, then create federated credential:
APP_ID="<appId from above>"

az ad app federated-credential create \
  --id $APP_ID \
  --parameters '{
    "name": "github-actions",
    "issuer": "https://token.actions.githubusercontent.com",
    "subject": "repo:YOUR_GITHUB_USERNAME/expense-tracker:ref:refs/heads/main",
    "audiences": ["api://AzureADTokenExchange"]
  }'

# Assign Contributor role
az role assignment create \
  --assignee $APP_ID \
  --role Contributor \
  --scope /subscriptions/YOUR_SUBSCRIPTION_ID
```

### 1.3 Create Terraform State Storage
```bash
az group create --name tfstate-rg --location eastus

az storage account create \
  --name expensetrackertfstate \
  --resource-group tfstate-rg \
  --location eastus \
  --sku Standard_LRS

az storage container create \
  --name tfstate \
  --account-name expensetrackertfstate
```

---

## Step 2 — MongoDB Atlas

1. Go to https://cloud.mongodb.com → Create a **free** M0 cluster
2. Create a database user with a strong password
3. Whitelist `0.0.0.0/0` (or use Azure peering for production)
4. Copy the connection string:
   ```
   mongodb+srv://USER:PASS@cluster0.xxxxx.mongodb.net/expensedb?retryWrites=true&w=majority
   ```

---

## Step 3 — GitHub Repository Setup

### 3.1 Push your project
Your project structure should look like:
```
expense-tracker/
├── backend/          (from original project)
├── frontend/         (from original project)
├── docker/
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── nginx.conf
├── k8s/
│   ├── base/
│   └── overlays/production/
├── terraform/
├── .github/workflows/ci-cd.yml
└── docker-compose.yml
```

### 3.2 Add GitHub Secrets
Go to: **GitHub Repo → Settings → Secrets and variables → Actions → New repository secret**

| Secret Name | Value |
|-------------|-------|
| `AZURE_CLIENT_ID` | App ID from Step 1.2 |
| `AZURE_TENANT_ID` | Your Azure Tenant ID (`az account show --query tenantId -o tsv`) |
| `AZURE_SUBSCRIPTION_ID` | Your Subscription ID |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Any strong random string (e.g. `openssl rand -hex 32`) |
| `VITE_API_URL` | `https://expense-tracker.YOURDOMAIN.com/api` (or backend IP after first deploy) |
| `ACR_LOGIN_SERVER` | `expensetrackerprodacr.azurecr.io` (from Terraform output) |
| `AKS_CLUSTER_NAME` | `expense-tracker-production-aks` |
| `AKS_RESOURCE_GROUP` | `expense-tracker-production-rg` |

> ⚠️ `ACR_LOGIN_SERVER`, `AKS_CLUSTER_NAME`, and `AKS_RESOURCE_GROUP` become available after the **first Terraform run**. See Step 4.

---

## Step 4 — First-time Terraform Apply (Bootstrap)

Run Terraform locally once to create the Azure infrastructure:

```bash
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values

terraform init
terraform plan
terraform apply
```

After apply, note the outputs:
```bash
terraform output acr_login_server    # → set as ACR_LOGIN_SERVER secret
terraform output aks_cluster_name    # → set as AKS_CLUSTER_NAME secret
terraform output resource_group_name # → set as AKS_RESOURCE_GROUP secret
```

After this, all subsequent infra changes are handled by GitHub Actions automatically.

---

## Step 5 — Configure Ingress (Domain + TLS)

### 5.1 Install NGINX Ingress Controller on AKS
```bash
az aks get-credentials --resource-group expense-tracker-production-rg \
                        --name expense-tracker-production-aks

helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx --create-namespace \
  --set controller.service.type=LoadBalancer
```

### 5.2 Install cert-manager (auto TLS via Let's Encrypt)
```bash
helm repo add jetstack https://charts.jetstack.io
helm repo update

helm install cert-manager jetstack/cert-manager \
  --namespace cert-manager --create-namespace \
  --set installCRDs=true
```

Create a ClusterIssuer:
```bash
kubectl apply -f - <<EOF
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: letsencrypt-prod
spec:
  acme:
    server: https://acme-v02.api.letsencrypt.org/directory
    email: your@email.com
    privateKeySecretRef:
      name: letsencrypt-prod
    solvers:
      - http01:
          ingress:
            class: nginx
EOF
```

### 5.3 Point your domain
```bash
# Get the public IP of the ingress load balancer
kubectl get svc -n ingress-nginx

# Add an A record in your DNS provider:
# expense-tracker.YOURDOMAIN.com → <EXTERNAL-IP>
```

### 5.4 Update Ingress YAML
Edit `k8s/base/ingress.yaml` → replace `expense-tracker.YOURDOMAIN.com` with your actual domain.

---

## Step 6 — Trigger Deployment

```bash
git add .
git commit -m "feat: add DevOps pipeline"
git push origin main
```

GitHub Actions will automatically:
1. ✅ Run tests
2. 🐳 Build and push Docker images to ACR
3. 🏗️ Run Terraform (update infra if changed)
4. 🚀 Deploy to AKS with zero-downtime rolling update

Watch it live at: **GitHub → Actions tab**

---

## Local Development with Docker Compose

```bash
# Copy and edit environment variables
cp .env.example .env   # Set MONGO_ROOT_USER, MONGO_ROOT_PASS, JWT_SECRET

# Start all services
docker-compose -f docker/docker-compose.yml up --build

# Access:
# Frontend: http://localhost
# Backend:  http://localhost:5000
```

---

## Useful Commands

```bash
# View all pods
kubectl get pods -n expense-tracker

# View logs
kubectl logs -n expense-tracker deploy/backend -f

# Scale manually
kubectl scale deployment backend --replicas=4 -n expense-tracker

# Check HPA (auto-scaling) status
kubectl get hpa -n expense-tracker

# Rollback a deployment
kubectl rollout undo deployment/backend -n expense-tracker

# Destroy all infrastructure (careful!)
# Trigger workflow_dispatch with destroy_infra = 'yes'
```

---

## Cost Estimate (Azure — East US)

| Resource | SKU | Est. Monthly Cost |
|----------|-----|-------------------|
| AKS (2× D2s_v3 nodes) | Standard | ~$140 |
| Azure Container Registry | Standard | ~$10 |
| Log Analytics Workspace | PerGB2018 | ~$5 |
| Key Vault | Standard | ~$1 |
| Load Balancer | Standard | ~$18 |
| **Total** | | **~$175/month** |

> MongoDB Atlas M0 (free) for development. M10 cluster ~$57/month for production.

---

## Pipeline Flow Diagram

```
┌──────────────────────────────────────────────────────┐
│                  GitHub Actions                      │
│                                                      │
│  Push to main                                        │
│       │                                              │
│       ▼                                              │
│  ┌─────────┐  ┌──────────────┐                      │
│  │ Test BE │  │  Test FE     │  (parallel)           │
│  └────┬────┘  └──────┬───────┘                      │
│       └──────┬────────┘                              │
│              ▼                                       │
│       ┌─────────────┐                               │
│       │ Build Docker│ → Push to ACR                 │
│       │  (BE + FE)  │                               │
│       └──────┬──────┘                               │
│              ▼                                       │
│       ┌─────────────┐                               │
│       │  Terraform  │ → Plan + Apply                │
│       │  (AKS infra)│                               │
│       └──────┬──────┘                               │
│              ▼                                       │
│       ┌─────────────┐                               │
│       │  kubectl    │ → Rolling deploy to AKS       │
│       │  apply -k   │                               │
│       └─────────────┘                               │
└──────────────────────────────────────────────────────┘
```
#   e x p e n s e - t r a c k e r  
 