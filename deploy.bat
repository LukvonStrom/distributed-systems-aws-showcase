@echo off 

echo "Packaging..."

call aws cloudformation package --template-file distributed-systems-aws-showcase.yml --s3-bucket aws-ds-demo --output-template-file output.yml

echo "Deploying..."
call aws cloudformation deploy --template-file output.yml --stack-name distributed-systems-aws-showcase-dh --capabilities CAPABILITY_IAM