#!/bin/bash

# Azure Web App Deployment Script
# This script helps deploy the IRA Calculator to Azure

echo "🚀 Deploying IRA Calculator to Azure..."

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI is not installed. Please install it first:"
    echo "   https://docs.microsoft.com/en-us/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in to Azure
if ! az account show &> /dev/null; then
    echo "🔐 Please log in to Azure first:"
    az login
fi

# Build the React app
echo "📦 Building React app..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Create resource group if it doesn't exist
RESOURCE_GROUP="moss-ira-calc-rg"
LOCATION="eastus"

echo "🏗️  Creating resource group: $RESOURCE_GROUP"
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service plan
PLAN_NAME="moss-ira-calc-plan"
echo "📋 Creating App Service plan: $PLAN_NAME"
az appservice plan create \
    --name $PLAN_NAME \
    --resource-group $RESOURCE_GROUP \
    --sku F1 \
    --is-linux

# Create Web App
WEBAPP_NAME="moss-ira-calc"
echo "🌐 Creating Web App: $WEBAPP_NAME"
az webapp create \
    --name $WEBAPP_NAME \
    --resource-group $RESOURCE_GROUP \
    --plan $PLAN_NAME \
    --runtime "NODE:20-lts"

# Configure the Web App
echo "⚙️  Configuring Web App..."
az webapp config set \
    --resource-group $RESOURCE_GROUP \
    --name $WEBAPP_NAME \
    --linux-fx-version "NODE:20-lts"

# Create zip file from build folder
echo "📁 Creating deployment package..."
cd build && zip -r ../build.zip . && cd ..

# Deploy using the newer command
echo "🚀 Deploying to Azure..."
az webapp deploy \
    --resource-group $RESOURCE_GROUP \
    --name $WEBAPP_NAME \
    --src-path build.zip \
    --type zip

# Clean up zip file
rm build.zip

echo "✅ Deployment complete!"
echo "🌐 Your app is available at: https://$WEBAPP_NAME.azurewebsites.net"
echo ""
echo "📋 Next steps:"
echo "   1. Set up custom domain: moss-ira-calc.azurewebsites.net"
echo "   2. Configure SSL certificate"
echo "   3. Set up continuous deployment from your Git repository"
