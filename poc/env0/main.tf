terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }
}

provider "aws" {
  region = "cn-north-1"
}

############################################
# Verify AWS China
############################################

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

############################################
# SSM Parameter
############################################

resource "aws_ssm_parameter" "env0_test" {
  name        = "/env0/test"
  description = "Created by env0 AWS China compatibility test"
  type        = "String"
  value       = "hello-env0"

  tags = {
    Project = "env0-aws-china-test"
    Managed = "Terraform"
  }
}

############################################
# S3 Bucket
############################################

resource "aws_s3_bucket" "env0_test" {
  bucket = "env0-cn-test-097279986018-001"

  tags = {
    Name    = "env0 AWS China Test"
    Project = "env0-aws-china-test"
    Managed = "Terraform"
  }
}

############################################
# Outputs
############################################

output "account_id" {
  value = data.aws_caller_identity.current.account_id
}

output "region" {
  value = data.aws_region.current.name
}

output "bucket_name" {
  value = aws_s3_bucket.env0_test.bucket
}

output "parameter_name" {
  value = aws_ssm_parameter.env0_test.name
}

output "parameter_version" {
  value = aws_ssm_parameter.env0_test.version
}