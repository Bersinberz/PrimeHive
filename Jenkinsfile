pipeline {
    agent any

    environment {
        DOCKER_REGISTRY    = credentials('docker-registry-url')
        DOCKER_CREDENTIALS = credentials('docker-hub-credentials')
        SERVER_IMAGE       = "${DOCKER_REGISTRY}/primehive-server"
        CLIENT_IMAGE       = "${DOCKER_REGISTRY}/primehive-client"
        DEPLOY_HOST        = credentials('deploy-host')
        DEPLOY_USER        = credentials('deploy-user')
        SSH_KEY            = credentials('deploy-ssh-key')
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {

        // ── 1. Checkout ──────────────────────────────────────────
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    env.GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    env.IMAGE_TAG        = "${env.BRANCH_NAME}-${env.GIT_COMMIT_SHORT}"
                }
                echo "Building tag: ${env.IMAGE_TAG}"
            }
        }

        // ── 2. Install & Test ────────────────────────────────────
        stage('Test') {
            parallel {
                stage('Server Tests') {
                    steps {
                        dir('server') {
                            sh 'npm ci'
                            sh 'npm test'
                        }
                    }
                    post {
                        always {
                            junit allowEmptyResults: true, testResults: 'server/test-results/**/*.xml'
                        }
                    }
                }
                stage('Client Tests') {
                    steps {
                        dir('client') {
                            sh 'npm ci'
                            sh 'npm test'
                        }
                    }
                }
            }
        }

        // ── 3. Build Docker Images ───────────────────────────────
        stage('Build Images') {
            parallel {
                stage('Build Server') {
                    steps {
                        sh """
                            docker build \
                                --target production \
                                --tag ${SERVER_IMAGE}:${IMAGE_TAG} \
                                --tag ${SERVER_IMAGE}:latest \
                                --cache-from ${SERVER_IMAGE}:latest \
                                ./server
                        """
                    }
                }
                stage('Build Client') {
                    steps {
                        withCredentials([string(credentialsId: 'vite-api-url', variable: 'VITE_API_URL')]) {
                            sh """
                                docker build \
                                    --target production \
                                    --build-arg VITE_API_URL=${VITE_API_URL} \
                                    --tag ${CLIENT_IMAGE}:${IMAGE_TAG} \
                                    --tag ${CLIENT_IMAGE}:latest \
                                    --cache-from ${CLIENT_IMAGE}:latest \
                                    ./client
                            """
                        }
                    }
                }
            }
        }

        // ── 4. Security Scan ─────────────────────────────────────
        stage('Security Scan') {
            steps {
                sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --exit-code 0 --severity HIGH,CRITICAL ${SERVER_IMAGE}:${IMAGE_TAG} || true"
                sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image --exit-code 0 --severity HIGH,CRITICAL ${CLIENT_IMAGE}:${IMAGE_TAG} || true"
            }
        }

        // ── 5. Push to Registry ──────────────────────────────────
        stage('Push Images') {
            when {
                anyOf {
                    branch 'main'
                    branch 'production'
                }
            }
            steps {
                sh "echo ${DOCKER_CREDENTIALS_PSW} | docker login ${DOCKER_REGISTRY} -u ${DOCKER_CREDENTIALS_USR} --password-stdin"
                sh "docker push ${SERVER_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${SERVER_IMAGE}:latest"
                sh "docker push ${CLIENT_IMAGE}:${IMAGE_TAG}"
                sh "docker push ${CLIENT_IMAGE}:latest"
            }
        }

        // ── 6. Deploy to Production ──────────────────────────────
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sshagent(credentials: ['deploy-ssh-key']) {
                    sh """
                        ssh -o StrictHostKeyChecking=no ${DEPLOY_USER}@${DEPLOY_HOST} '
                            cd /opt/primehive &&
                            docker-compose pull &&
                            docker-compose up -d --remove-orphans &&
                            docker image prune -f
                        '
                    """
                }
            }
        }

    }

    post {
        success {
            echo "✅ Build ${env.IMAGE_TAG} deployed successfully."
        }
        failure {
            echo "❌ Build failed. Check logs above."
        }
        always {
            sh 'docker logout ${DOCKER_REGISTRY} || true'
            cleanWs()
        }
    }
}
