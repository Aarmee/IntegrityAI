# INTEGRITYAI: JENKINS CI/CD SETUP GUIDE
## Automated Build, Test, and Docker Hub Deployment Pipeline

---

### Overview
This guide explains how to set up **Jenkins** to automatically:
1. Pull code from GitHub.
2. Execute automated unit & ML tests (`pytest` for 14-feature stylometric model).
3. Build Docker container images for all microservices.
4. Push all images to your Docker Hub account: **`aarmee`**.
5. Trigger automated deployment.

---

## 1. Running Jenkins Locally via Docker

If you don't have Jenkins installed on your machine yet, the easiest and cleanest way to run Jenkins is inside Docker:

```bash
docker run -d \
  --name integrityai-jenkins \
  -p 9090:8080 \
  -p 50000:50000 \
  -v jenkins_home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  jenkins/jenkins:lts-jdk17
```

* Open your browser: `http://localhost:9090`
* Retrieve the initial admin password:
  ```bash
  docker exec integrityai-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
  ```
* Complete the initial setup and install recommended plugins.

---

## 2. Configure Docker Hub Credentials in Jenkins

1. Go to **Jenkins Dashboard** $\to$ **Manage Jenkins** $\to$ **Credentials** $\to$ **System** $\to$ **Global credentials**.
2. Click **"+ Add Credentials"**:
   * **Kind:** Username with password
   * **Scope:** Global
   * **Username:** `aarmee` *(or your Docker Hub username)*
   * **Password:** *(Your Docker Hub password or Personal Access Token)*
   * **ID:** `dockerhub-aarmee` *(Must match the ID in Jenkinsfile)*
   * **Description:** `Docker Hub aarmee credentials`
3. Click **Create**.

---

## 3. Create the IntegrityAI Pipeline Job

1. From the Jenkins dashboard, click **"New Item"**.
2. Enter Name: **`IntegrityAI-Pipeline`**.
3. Select **"Pipeline"** and click **OK**.
4. In the Job Configuration:
   * Scroll down to the **Pipeline** section.
   * Under **Definition**, select: **Pipeline script from SCM**.
   * Under **SCM**, select: **Git**.
   * Enter your GitHub Repository URL (e.g., `https://github.com/aarmeepatel/IntegrityAI.git`).
   * Specify Branch: `*/main`
   * Under **Script Path**, enter: **`Jenkinsfile`**.
5. Click **Save**.

---

## 4. Running the Pipeline

1. Click **"Build Now"** on the left menu.
2. Jenkins will execute all 5 stages defined in [`Jenkinsfile`](file:///c:/Users/AARMEE/Desktop/MSA%20---%20Project/IntegrityAI/Jenkinsfile):
   * **Stage 1: Checkout Code** (Pulls latest code from GitHub)
   * **Stage 2: Run Unit & ML Tests** (Runs pytest verifying 22/22 ML tests pass)
   * **Stage 3: Build Docker Images** (Compiles JARs & builds images for all microservices)
   * **Stage 4: Push to Docker Hub** (Tags and pushes images to `aarmee/integrityai-*`)
   * **Stage 5: Deploy to Target Environment** (Triggers Railway webhook or local deployment)

---

## 5. Verifying on Docker Hub

After the build succeeds:
1. Log into [hub.docker.com](https://hub.docker.com) with `aarmee@gmail.com`.
2. Under **Repositories**, you will see your 8 published images:
   * `aarmee/integrityai-gateway`
   * `aarmee/integrityai-auth-service`
   * `aarmee/integrityai-faculty-service`
   * `aarmee/integrityai-submission-service`
   * `aarmee/integrityai-notification-service`
   * `aarmee/integrityai-report-service`
   * `aarmee/integrityai-analysis-service`
   * `aarmee/integrityai-frontend`
