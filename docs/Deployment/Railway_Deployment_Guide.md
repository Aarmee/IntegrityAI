# INTEGRITYAI: RAILWAY CLOUD DEPLOYMENT GUIDE
## Step-by-Step Deployment on Railway (railway.com)

---

### Why Railway?
Railway is one of the fastest, most developer-friendly cloud platforms. It provides:
1. **Zero-Configuration Docker Support:** Automatically detects `Dockerfile` in each service.
2. **Built-in Managed PostgreSQL:** 1-click cloud PostgreSQL database with automated backups.
3. **Automatic Public HTTPS Domains:** Generates free SSL domains (e.g., `https://integrityai-frontend.up.railway.app`).
4. **Environment Secret Management:** Easy GUI to paste your AWS S3, MongoDB Atlas, and Resend keys.

---

## 1. Quick Architecture on Railway

In Railway, your project will contain:
```
[ Railway Project: IntegrityAI ]
   ├── PostgreSQL (Managed Cloud Database - 1 click)
   ├── api-gateway (Docker: MSA-ML/api-gateway)
   ├── auth-service (Docker: MSA-ML/auth-service)
   ├── faculty-service (Docker: MSA-ML/faculty-service)
   ├── submission-service (Docker: MSA-ML/submission-service)
   ├── notification-service (Docker: MSA-ML/notification-service)
   ├── report-service (Docker: MSA-ML/report-service)
   ├── ai-analysis-service (Docker: MSA-ML/ai-analysis-service)
   └── frontend (Docker: frontend)  ---> Public HTTPS URL
```

---

## 2. Step-by-Step Deployment Steps

### STEP 1: Push Code to GitHub
Ensure your latest code with all Dockerfiles is pushed to your GitHub repository:
```bash
git add .
git commit -m "Add Dockerfiles, docker-compose, and Jenkinsfile for Railway deployment"
git push origin main
```

---

### STEP 2: Create a Project in Railway
1. Go to [railway.com](https://railway.com) and log in with your GitHub account.
2. Click **"+ New Project"**.
3. Select **"Provision PostgreSQL"** (this creates your cloud PostgreSQL instance in 5 seconds!).
4. Click on the PostgreSQL card $\to$ click **"Variables"** $\to$ copy the `DATABASE_URL` or individual credentials (`PGHOST`, `PGPORT`, `PGUSER`, `PGPASSWORD`).

---

### STEP 3: Deploy Backend Microservices from GitHub
In the same Railway project:
1. Click **"+ Create"** (or press `Ctrl + K`) $\to$ **"GitHub Repo"** $\to$ select your `IntegrityAI` repo.
2. Click on the newly added service $\to$ go to **"Settings"**:
   * Change **Service Name** to: `api-gateway`
   * Under **"Root Directory"**, enter: `/MSA-ML/api-gateway`
   * Railway will automatically detect the `Dockerfile` inside that directory!
3. Repeat this quick step for each service:
   * `auth-service` (Root Directory: `/MSA-ML/auth-service`)
   * `faculty-service` (Root Directory: `/MSA-ML/faculty-service`)
   * `submission-service` (Root Directory: `/MSA-ML/submission-service`)
   * `notification-service` (Root Directory: `/MSA-ML/notification-service`)
   * `report-service` (Root Directory: `/MSA-ML/report-service`)
   * `ai-analysis-service` (Root Directory: `/MSA-ML/ai-analysis-service`)

---

### STEP 4: Add Environment Variables in Railway
For each service in Railway, click **"Variables"** and add its required variables:

#### A. For `auth-service`, `faculty-service`, `notification-service`, `report-service`:
* `DB_URL`: `${{Postgres.DATABASE_URL}}` *(Railway automatically links this!)*
* `DB_USERNAME`: `postgres`
* `DB_PASSWORD`: `${{Postgres.PGPASSWORD}}`
* `JWT_SECRET`: `integrityai-secret-key-for-jwt-authentication-2026-must-be-at-least-256-bits`

#### B. For `submission-service`:
* `MONGODB_URI`: *(Your MongoDB Atlas connection string)*
* `AWS_ACCESS_KEY_ID`: *(Your AWS Access Key ID from .env)*
* `AWS_SECRET_ACCESS_KEY`: *(Your AWS Secret Access Key from .env)*
* `AWS_REGION`: `eu-north-1`
* `AWS_S3_BUCKET`: `integrityai-submissions-aarmee`
* `AI_ANALYSIS_SERVICE_URL`: `http://${{ai-analysis-service.RAILWAY_PRIVATE_DOMAIN}}:8090`
* `NOTIFICATION_SERVICE_URL`: `http://${{notification-service.RAILWAY_PRIVATE_DOMAIN}}:8084`
* `AUTH_SERVICE_URL`: `http://${{auth-service.RAILWAY_PRIVATE_DOMAIN}}:8081`

#### C. For `notification-service`:
* `RESEND_API_KEY`: *(Your Resend API Key from .env)*
* `RESEND_TEST_EMAIL`: `aaru140604@gmail.com`

#### D. For `api-gateway`:
* Go to **Settings** $\to$ **Networking** $\to$ click **"Generate Domain"** (e.g., `api-gateway-production.up.railway.app`).
* Under **Variables**:
  * `AUTH_SERVICE_URI`: `http://${{auth-service.RAILWAY_PRIVATE_DOMAIN}}:8081`
  * `FACULTY_SERVICE_URI`: `http://${{faculty-service.RAILWAY_PRIVATE_DOMAIN}}:8082`
  * `SUBMISSION_SERVICE_URI`: `http://${{submission-service.RAILWAY_PRIVATE_DOMAIN}}:8083`
  * `NOTIFICATION_SERVICE_URI`: `http://${{notification-service.RAILWAY_PRIVATE_DOMAIN}}:8084`
  * `REPORT_SERVICE_URI`: `http://${{report-service.RAILWAY_PRIVATE_DOMAIN}}:8085`
  * `AI_ANALYSIS_SERVICE_URI`: `http://${{ai-analysis-service.RAILWAY_PRIVATE_DOMAIN}}:8090`

---

### STEP 5: Deploy the Frontend
1. Click **"+ Create"** $\to$ **"GitHub Repo"** $\to$ select `IntegrityAI`.
2. In **Settings**:
   * Set **Service Name** to: `frontend`
   * Set **Root Directory** to: `/frontend`
3. In **Variables**:
   * `VITE_API_GATEWAY_URL`: `https://api-gateway-production.up.railway.app` *(The public domain from Step 4D)*
4. Under **Settings $\to$ Networking**, click **"Generate Domain"** (e.g., `https://integrityai-production.up.railway.app`).
5. Open your public domain in your browser! Your entire platform is live on the internet with SSL/HTTPS!

---

## 3. Alternative: Deploy Pre-Built Docker Images directly from Docker Hub
If you don't want Railway to compile code from source:
1. Let your **Jenkins** pipeline build and push the images to `patelaarmee06/integrityai-...`.
2. In Railway, click **"+ Create"** $\to$ **"Docker Image"** $\to$ type `patelaarmee06/integrityai-frontend:latest`.
3. Railway pulls the pre-built image from your Docker Hub account and starts it in 10 seconds!
