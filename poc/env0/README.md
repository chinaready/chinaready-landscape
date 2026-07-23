# env0 + AWS China Compatibility POC

## Objective

Verify whether env0 can successfully provision infrastructure in **AWS China (`aws-cn`)** using the official Terraform AWS Provider.

This POC focuses on validating the core Terraform workflow rather than env0's advanced platform features.

---

## Test Environment

- Platform: env0
- IaC: Terraform
- Provider: `hashicorp/aws`
- AWS Region: `cn-north-1` (AWS China Beijing)
- Authentication: IAM User (Access Key / Secret Key)

---

## Test Workflow

### 1. Verify Authentication

Use the Terraform `aws_caller_identity` data source to verify that env0 can authenticate with AWS China.

Expected result:

- Terraform initializes successfully.
- AWS China STS API returns the correct AWS Account ID.

---

### 2. Provision AWS Resources

Deploy a minimal set of AWS China resources:

- AWS Systems Manager Parameter Store (`aws_ssm_parameter`)
- Amazon S3 Bucket (`aws_s3_bucket`)

Expected result:

- `terraform apply` completes successfully.
- Both resources are created in AWS China.

---

### 3. Verify Terraform State

Run Terraform again after the deployment.

Expected result:

- No unexpected changes.
- Existing resources are correctly discovered from Terraform state.

---

### 4. Destroy Resources

Destroy all resources created during the test.

Expected result:

- `terraform destroy` completes successfully.
- All resources are removed from AWS China.

---

## Verification Results

The following capabilities were successfully verified:

- ✅ Authentication to AWS China using IAM User credentials
- ✅ Terraform execution against AWS China (`aws-cn`)
- ✅ Resource creation
- ✅ Resource state management
- ✅ Resource destruction

Verified AWS services:

- AWS Systems Manager Parameter Store
- Amazon S3

---

## Scope

This POC validates that env0's Terraform execution environment is compatible with AWS China for standard Terraform workflows.

The following areas were **not** included in this POC:

- AWS AssumeRole
- OIDC authentication
- env0 AWS Account Integration
- Cost Estimation
- Drift Detection
- Policy as Code
- Multi-account deployment
- Private networking scenarios

---

## Conclusion

This POC demonstrates that env0 can successfully execute Terraform deployments against AWS China (`aws-cn`) using the official Terraform AWS Provider.

The complete Terraform lifecycle was successfully validated:

- Plan
- Apply
- Create resources
- Read state
- Destroy resources

Based on this POC, env0 is compatible with standard Terraform workflows targeting AWS China.
