# Deploying IRA Calculator to Azure

This guide will help you deploy the IRA Calculator web app to Azure at `moss-ira-calc.azurewebsites.net`.

## Prerequisites

1. **Azure Account**: You need an Azure subscription (free tier works)
2. **Azure CLI**: Install the Azure Command Line Interface
3. **Git Repository**: Your code should be in a Git repository (GitHub, Azure DevOps, etc.)

## Option 1: Quick Deploy with Azure CLI (Recommended)

### Step 1: Install Azure CLI
```bash
# macOS (using Homebrew)
brew install azure-cli

# Windows (using winget)
winget install Microsoft.AzureCLI

# Linux
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash
```

### Step 2: Login to Azure
```bash
az login
```

### Step 3: Run Deployment Script
```bash
# Make script executable
chmod +x deploy-to-azure.sh

# Run deployment
./deploy-to-azure.sh
```

## Option 2: Manual Deployment

### Step 1: Build the App
```bash
npm install
npm run build
```

### Step 2: Create Azure Resources
```bash
# Create resource group
az group create --name moss-ira-calc-rg --location eastus

# Create App Service plan
az appservice plan create \
    --name moss-ira-calc-plan \
    --resource-group moss-ira-calc-rg \
    --sku F1 \
    --is-linux

# Create Web App
az webapp create \
    --name moss-ira-calc \
    --resource-group moss-ira-calc-rg \
    --plan moss-ira-calc-plan \
    --runtime "NODE:20-lts"
```

### Step 3: Deploy the App
```bash
# Create deployment package
cd build && zip -r ../build.zip . && cd ..

# Deploy
az webapp deployment source config-zip \
    --resource-group moss-ira-calc-rg \
    --name moss-ira-calc \
    --src build.zip
```

## Option 3: GitHub Actions (Continuous Deployment)

### Step 1: Set up GitHub Repository
1. Push your code to GitHub
2. Go to your repository settings
3. Add the following secret:
   - Name: `AZURE_WEBAPP_PUBLISH_PROFILE`
   - Value: [Get from Azure Portal]

### Step 2: Get Publish Profile
1. Go to Azure Portal
2. Navigate to your Web App
3. Click "Get publish profile"
4. Copy the content and paste it as the secret value

### Step 3: Push to Main Branch
The GitHub Action will automatically deploy when you push to main/master.

## Post-Deployment

### Custom Domain Setup
1. Go to Azure Portal → Your Web App → Custom domains
2. Add `moss-ira-calc.azurewebsites.net`
3. Verify domain ownership

### SSL Certificate
1. Azure provides free SSL certificates for `.azurewebsites.net` domains
2. For custom domains, you may need to purchase an SSL certificate

## Cost Estimation

- **F1 (Free) Tier**: $0/month (limited features)
- **B1 (Basic) Tier**: ~$13/month (recommended for production)
- **S1 (Standard) Tier**: ~$73/month (better performance)

## Troubleshooting

### Common Issues

1. **Build Fails**: Check for TypeScript/ESLint errors
2. **Deployment Fails**: Verify Azure CLI is logged in
3. **App Not Loading**: Check Web App logs in Azure Portal

### Useful Commands

```bash
# Check Web App status
az webapp show --name moss-ira-calc --resource-group moss-ira-calc-rg

# View logs
az webapp log tail --name moss-ira-calc --resource-group moss-ira-calc-rg

# Restart Web App
az webapp restart --name moss-ira-calc --resource-group moss-ira-calc-rg
```

## Support

If you encounter issues:
1. Check Azure Portal logs
2. Verify all prerequisites are met
3. Ensure you have sufficient Azure credits/subscription

Your IRA Calculator will be available at: **https://moss-ira-calc.azurewebsites.net**
