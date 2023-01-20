# Skyflow Detokenization Lambda Function for Snowflake

## Overview

This application is a Lambda function that can be used as the API endpoint for an external
detokenize function created for Snowflake. Once you've created this function and configured the
Snowflake external function, you can write queries like `select detokenize(‘12ab7c59-18b2-4db8-8b9f-1135a42ba96a’);` directly from Snowflake.

Usage of this function assumes that sensitive data going into Snowflake is de-identified and replaced
by Skyflow tokens.

See this [blog post](https://www.skyflow.com/post/how-to-de-identify-and-secure-pii-in-snowflake)
for details on how this works.

## Requirements

- node - v10.17
- npm > 6.x.x

You can find the documentation and steps to install node and npm [here](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm).

## Configuration

### Vault service account

Before you can run the application, you need to create a service account key for your vault and 
set it up within AWS Secrets Manager to be used by the Lambda function.

1. Follow the [Create a service account](https://docs.skyflow.com/api-authentication/#create-a-service-account) guide to create your service account key.
1. Open the credentials.json file and copy the contents.
1. In AWS Secrets Manager, create a new secret with type **Other type of secret**, set the Key to be `raw-credential` and the Value to be the contents of credentials.json.
1. Note the name of the secret you create, you'll need that later.

#### Create Lambda function
1. From your terminal, navigate to the root directory of this project and type `zip -r function.zip .`.
1. In AWS Lambda, create a new function.
1. Upload the function.zip code to your newly created function.
1. Under **Configuration > Environment variables**, create and set the following variables:
  * `REGION` - Set the value to correspond to the AWS region you are using, e.g. us-east-2.
  * `SECRET_KEY` - Set to `raw-credential`.
  * `SECRET_NAME` - Name of the secret you created.
  * `VAULT_ID` - Your Skyflow Vault ID. Found on your Vault Details page.
  * `VAULT_URL` - Your Skyflow Vault URL. Found on your Vault Details page.

#### Set environment variables
The import data script and demo application need environment variables for your VAULT_ID, VAULT_URL,
and SERVICE_ACCOUNT_KEY.

1. From the vault details modal, copy the Vault ID.
1. In your terminal, execute `export VAULT_ID=$VAULT_ID` replacing `$VAULT_ID` with the vault ID you
copied.
1. From the vault details modal, copy the Vault URL.
1. In your terminal, execute `export VAULT_URL=$VAULT_URL` replacing `$VAULT_URL` with the vault URL
you copied.
1. Create a role with a policy for inserting and reading records for the persons table in the vault
you created.
1. Create a service account assigning the role.
1. Open the downloaded credentials.json file and copy the contents.
1. In your terminal, execute `export VAULT_URL=$SERVICE_ACCOUNT_KEY_DATA`, replacing
`$SERVICE_ACCOUNT_KEY_DATA` with the contents of the credentials.json file you downloaded.

## Snowflake external function

To make use of this function and start retrieving the original sensitive data values from SQL within Snowflake, you need to create an [external function](https://docs.snowflake.com/en/sql-reference/external-functions-introduction.html) in Snowflake that calls this Lambda function.

You can see instructions on how to setup an external function for AWS [here](https://quickstarts.snowflake.com/guide/getting_started_external_functions_aws/index.html?index=..%2F..index#5).