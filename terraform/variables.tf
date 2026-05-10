variable "project_name" {
  description = "Project name prefix for all resources"
  type        = string
  default     = "expense-tracker"
}

variable "environment" {
  description = "Deployment environment (dev / staging / production)"
  type        = string
  default     = "production"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "eastus"
}

variable "kubernetes_version" {
  description = "AKS Kubernetes version"
  type        = string
  default     = "1.30"
}

variable "node_vm_size" {
  description = "VM size for AKS node pool"
  type        = string
  default     = "Standard_D2s_v3"
}

variable "node_count" {
  description = "Initial node count"
  type        = number
  default     = 2
}

variable "node_min_count" {
  description = "Minimum nodes (auto-scaling)"
  type        = number
  default     = 2
}

variable "node_max_count" {
  description = "Maximum nodes (auto-scaling)"
  type        = number
  default     = 5
}

# ── Secrets (passed via GitHub Actions / TF_VAR_ env vars) ────────────────────
variable "mongo_uri" {
  description = "MongoDB Atlas connection string"
  type        = string
  sensitive   = true
}

variable "jwt_secret" {
  description = "JWT signing secret"
  type        = string
  sensitive   = true
}
