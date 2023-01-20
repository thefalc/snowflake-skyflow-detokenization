const AWS = require('aws-sdk');
const axios = require('axios');
const Qs = require('qs');

// Required constants for communicating with the vault.
const VAULT_URI = process.env.VAULT_URI;
const VAULT_ID = process.env.VAULT_ID;
const SECRET_NAME = process.env.SECRET_NAME;
const SECRET_KEY = process.env.SECRET_KEY;
const REGION = process.env.REGION;

// Setup for the Skyflow SDK.
const { Skyflow,
  generateBearerTokenFromCreds,
  isExpired } = require('skyflow-node');

let bearerToken = '';

// Initialize the Skyflow client
const client = Skyflow.init({
  // Id of the vault that the client should connect to
  vaultID: VAULT_ID,
  // URL of the vault that the client should connect to  
  vaultURL: VAULT_URI,
  // Helper function generates a Skyflow bearer token
  getBearerToken: getSkyflowBearerToken
});

const skyflowUtil = {
  /**
   * Detokenizes an array of tokenized values.
   * @param {Array} data List of tokens.
   * @returns List of detokenized objects.
   */
   detokenize: async function(data) {
    let records = [];

    for(let i = 0; i < data.length; i++) {
      records.push({
        token: data[i][1]
      });
    }

    const body = {
      detokenizationParameters: records,
    };

    let uri = VAULT_URI + '/detokenize';
    try {
      const response = await axios.post(uri, body, { headers: await getRequestHeaders() });

      return response.data.records;
    } catch(e) {
      console.dir(e.response);
    }
    
    return false;
  }
}

function getSkyflowBearerToken() {
  return new Promise(async (resolve, reject) => {
    try {
      if (!isExpired(bearerToken)) {
        resolve(bearerToken);
      }
      else {
        // let response =  generateBearerToken();
        bearerToken = await generateBearerToken();
        console.log(bearerToken);
        resolve(bearerToken);
      }
    } catch (e) {
      reject(e);
    }
  });
}

async function getRequestHeaders() {
  let credentials = await getVaultBearerToken();
  console.log('credentials: ' + credentials);

  let response = await generateBearerTokenFromCreds(credentials);

  console.log('response: ');
  console.log(response);

  return {
    'Authorization': 'Bearer ' + response.accessToken,
    'Content-Type': 'application/json'
  };
}

async function generateBearerToken() {
  let credentials = await getVaultBearerToken();
  console.log(credentials);

  let response = await generateBearerTokenFromCreds(credentials);
  return response.accessToken;
}

/**
 * Gets the service account key from the AWS Secrets Manager.
 * @return The raw service account key credentials JSON.
 */
 async function getVaultBearerToken() {
  // Create a Secrets Manager client
  const client = new AWS.SecretsManager({ region: REGION });

  try {
    const data = await client.getSecretValue({ SecretId: SECRET_NAME }).promise();
    const rawCredential = JSON.parse(data.SecretString);

    return rawCredential[SECRET_KEY];
  } catch(e) {
    console.log('error');
    console.log(e);
  }
}

module.exports = { skyflowUtil };