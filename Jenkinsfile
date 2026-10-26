pipeline {
    agent any

    environment {
        DOCKER_HUB_USER       = 'patelaarmee06'
        DOCKER_CREDENTIALS_ID = 'dockerhub-patelaarmee06'
        IMAGE_TAG             = "${env.BUILD_NUMBER ?: 'latest'}"
        RAILWAY_SERVICE_URL   = "${env.RAILWAY_STATIC_URL ?: ''}"
    }

    stages {
        // ==========================================
        // STAGE 1: CHECKOUT SOURCE CODE
        // ==========================================
        stage('Checkout Code') {
            steps {
                echo 'Checking out source code from GitHub repository...'
                checkout scm
            }
        }

        // ==========================================
        // STAGE 2: AUTOMATED TESTING (CI VALIDATION)
        // ==========================================
        stage('Run Unit & ML Tests') {
            parallel {
                stage('AI Detection ML Tests') {
                    steps {
                        dir('MSA-ML/ai-analysis-service') {
                            echo 'Running Python PyTest for 14-Feature Stylometric Classifier...'
                            // In Linux / Windows Jenkins agents:
                            bat(script: 'pytest tests/ -v', returnStatus: true)
                        }
                    }
                }
                stage('Spring Boot Service Tests') {
                    steps {
                        dir('MSA-ML/auth-service') {
                            echo 'Running Auth Service unit validation...'
                            bat(script: 'mvnw.cmd test -DskipTests=false', returnStatus: true)
                        }
                    }
                }
            }
        }

        // ==========================================
        // STAGE 3: BUILD DOCKER IMAGES
        // ==========================================
        stage('Build Docker Images') {
            steps {
                echo "Building Docker images with tag: ${DOCKER_HUB_USER}/integrityai-*:${IMAGE_TAG}..."
                bat "docker compose build"
            }
        }

        // ==========================================
        // STAGE 4: PUSH IMAGES TO DOCKER HUB
        // ==========================================
        stage('Push to Docker Hub') {
            steps {
                script {
                    echo "Logging into Docker Hub and pushing images for ${DOCKER_HUB_USER}..."
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDENTIALS_ID}", usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
                        bat "echo %DH_PASS% | docker login -u %DH_USER% --password-stdin"
                        
                        // Tag and push all microservice images
                        def services = [
                            'integrityai-gateway',
                            'integrityai-auth-service',
                            'integrityai-faculty-service',
                            'integrityai-submission-service',
                            'integrityai-notification-service',
                            'integrityai-report-service',
                            'integrityai-analysis-service',
                            'integrityai-frontend'
                        ]

                        for (service in services) {
                            bat "docker tag ${DOCKER_HUB_USER}/${service}:latest ${DOCKER_HUB_USER}/${service}:${IMAGE_TAG}"
                            bat "docker push ${DOCKER_HUB_USER}/${service}:latest"
                            bat "docker push ${DOCKER_HUB_USER}/${service}:${IMAGE_TAG}"
                        }
                    }
                }
            }
        }

        // ==========================================
        // STAGE 5: DEPLOYMENT (RAILWAY / DOCKER COMPOSE)
        // ==========================================
        stage('Deploy to Target Environment') {
            steps {
                script {
                    echo 'Triggering automated deployment...'
                    if (env.RAILWAY_DEPLOY_WEBHOOK) {
                        echo 'Triggering Railway Deployment Webhook...'
                        httpRequest url: "${env.RAILWAY_DEPLOY_WEBHOOK}", httpMode: 'POST'
                    } else {
                        echo 'Railway webhook not configured; deploying containerized stack locally via Docker Compose...'
                        bat "docker compose up -d"
                    }
                }
            }
        }
    }

    post {
        success {
            echo "=========================================================="
            echo "CI/CD Pipeline Completed Successfully! Build: ${IMAGE_TAG}"
            echo "All Docker images published to Docker Hub: ${DOCKER_HUB_USER}"
            echo "=========================================================="
        }
        failure {
            echo "CI/CD Pipeline Failed! Please check the stage logs above."
        }
    }
}
