pipeline {
agent any
tools { nodejs 'node20' }
environment {
AWS_REGION = 'eu-central-1' // ← change
SITE_BUCKET = 'my-netflix-site' // ← change
SITE_CDN_ID = 'EYOURCLOUDFRONTID' // ← change
}
options { timestamps(); ansiColor('xterm'); buildDiscarder(logRotator(numToKeepStr:'15')) }
stages {
stage('Checkout'){ steps { checkout([$class: 'GitSCM', branches: [[name: '*/main']], userRemoteConfigs: [[url: 'https://github.com/YOUR_USER/YOUR_REPO.git']]]) } }


stage('Install & Build web'){
steps { dir('apps/web'){ sh 'npm ci || npm install'; sh 'npm run build' } }
}


stage('Semgrep SAST'){
steps { sh 'docker run --rm -v "$PWD":/src returntocorp/semgrep:latest semgrep -q --config p/ci -f /src || true' }
}


stage('Gitleaks (secrets)'){
steps { sh 'docker run --rm -v "$PWD":/path zricethezav/gitleaks:latest detect -s /path -v --redact || true' }
}


stage('Trivy FS'){
steps { sh 'docker run --rm -v "$PWD":/src aquasec/trivy:latest fs --scanners vuln,secret,misconfig --severity HIGH,CRITICAL --exit-code 0 --format table /src | tee trivy-fs.txt'
archiveArtifacts artifacts: 'trivy-fs.txt', fingerprint: true }
}


stage('Install AWS CLI'){
steps { sh 'curl -sSL https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip -o awscliv2.zip && unzip -q awscliv2.zip && sudo ./aws/install --update || true' }
}


stage('Deploy site → S3 + Invalidate'){
steps {
withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: 'aws-deploy', usernameVariable: 'AWS_ACCESS_KEY_ID', passwordVariable: 'AWS_SECRET_ACCESS_KEY']]){
sh '''
export AWS_DEFAULT_REGION=${AWS_REGION}
aws s3 sync apps/web/out s3://${SITE_BUCKET}/ --delete
# set cache headers
find apps/web/out -name "*.html" -print0 | xargs -0 -I{} aws s3 cp "{}" s3://${SITE_BUCKET}/"{}" --content-type "text/html; charset=utf-8" --cache-control "public, max-age=60" --metadata-directive REPLACE
find apps/web/out -type f ! -name "*.html" -print0 | xargs -0 -I{} aws s3 cp "{}" s3://${SITE_BUCKET}/"{}" --cache-control "public, max-age=31536000, immutable" --metadata-directive REPLACE
aws cloudfront create-invalidation --distribution-id ${SITE_CDN_ID} --paths '/*'
'''
}
}
}
}
post { success { echo 'Deployed' } failure { echo 'Failed' } }
}