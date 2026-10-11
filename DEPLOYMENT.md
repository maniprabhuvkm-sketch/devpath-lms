# DevPath Academy - Production Deployment Guide

This guide details three professional deployment strategies for the DevPath Academy E-Learning Platform:

1. **Option 1: Modern Cloud PaaS (Render / Railway)** — Fastest (free tier, automated HTTPS, zero infrastructure management).
2. **Option 2: Cloud Linux VPS (Ubuntu / AWS EC2 / DigitalOcean)** — Enterprise standard (PM2 process manager, Nginx reverse proxy, free Let's Encrypt SSL).
3. **Option 3: Docker Container Deployment** — Portable container image for any cloud provider (AWS ECS, GCP Cloud Run, Azure).

---

## Pre-Deployment: Push to GitHub / GitLab

Before deploying to any cloud service, initialize a Git repository and push your project to GitHub:

```powershell
cd C:\Users\manip\.gemini\antigravity\scratch\devpath-lms

# Initialize Git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "feat: initial release of DevPath Academy E-Learning Platform"

# Link to your remote GitHub repository
git branch -M main
git remote add origin https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>.git

# Push to GitHub
git push -u origin main
```

---

## Option 1: Cloud PaaS Deployment (Render.com)

Render provides a free Web Service tier with automated SSL certificates and continuous deployment from Git.

### Step-by-Step Instructions:
1. Navigate to [https://render.com](https://render.com) and log in with your GitHub account.
2. In the dashboard, click **New +** and select **Web Service**.
3. Select **Build and deploy from a Git repository** and connect your `devpath-lms` repository.
4. Fill in the service configuration:
   - **Name**: `devpath-academy` (or your preferred name)
   - **Region**: Choose the closest location to your audience (e.g., Frankfurt, Oregon, Singapore).
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: *(Leave empty or `npm install`)*
   - **Start Command**: `node server.js`
   - **Instance Type**: `Free`
5. Click **Create Web Service**.
6. Render will clone your repository, boot the Node.js server, and assign a live, secure HTTPS URL (e.g., `https://devpath-academy.onrender.com`).

---

## Option 2: Production Linux VPS Deployment (Ubuntu 22.04 / 24.04 LTS)

Recommended for dedicated production hosting on AWS EC2, DigitalOcean, Linode, or Hetzner.

### Step 1: Connect to your Server
```bash
ssh root@<YOUR_SERVER_IP>
```

### Step 2: System Update & Install Dependencies
```bash
# Update package repositories
apt update && apt upgrade -y

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs git nginx ufw

# Verify installation
node -v
npm -v
```

### Step 3: Clone Application & Configure Directories
```bash
# Create application root
mkdir -p /var/www
cd /var/www

# Clone repository
git clone https://github.com/<YOUR_USERNAME>/<YOUR_REPOSITORY_NAME>.git devpath-lms
cd devpath-lms

# Grant ownership to non-root user
chown -R www-data:www-data /var/www/devpath-lms
```

### Step 4: Configure PM2 for 24/7 Process Management
PM2 ensures the server restarts automatically after crashes or system reboots.
```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start server.js --name "devpath-lms"

# Configure PM2 to start on server boot
pm2 startup systemd
# (Run the generated sudo env command printed in terminal)

# Save process list
pm2 save
```

### Step 5: Configure Nginx as Reverse Proxy
Create an Nginx configuration file:
```bash
nano /etc/nginx/sites-available/devpath-lms
```

Paste the following configuration (replace `yourdomain.com` with your domain name or server IP):
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the configuration and restart Nginx:
```bash
ln -s /etc/nginx/sites-available/devpath-lms /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

### Step 6: Enable Free SSL/HTTPS with Let's Encrypt
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Certbot will configure TLS certificates and schedule automated renewals.

### Step 7: Configure Firewall
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

---

## Option 3: Docker Deployment

The application includes a production-ready `Dockerfile` and `docker-compose.yml`.

### Deploy Locally or on a Docker Host:
```bash
cd devpath-lms

# Build and launch container in background
docker compose up -d --build

# View container logs
docker compose logs -f

# Check health status
docker ps
```
The application will be live at `http://localhost:3000` (or `http://<SERVER_IP>:3000`).
All persistent progress and certificates will be mounted to `./data` on the host machine.
