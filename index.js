const { skyflowUtil } = require('./skyflowUtil');

const VAULT_URI = process.env.VAULT_URI;
const VAULT_ID = process.env.VAULT_ID;

/**
 * Lambda function for receiving tokens from Snowflake.
 * @param {object} event Object describing the type of event that triggered the Lambda.
 * @param {object} context Object containing information about the
 * invocation, function, and execution environment.
 * @return String describing the result of the function execution.
 */
exports.handler = async (event, context) => {
  console.log("EVENT: \n" + JSON.stringify(event, null, 2));

  let body = JSON.parse(event.body);
  
  // Detokenize the passed in tokens.
  let response = await skyflowUtil.detokenize(body.data);

  // Convert the response into the the format Snowflake expects.
  let dataForSnowlake = [];
  for(let i = 0; i < response.length; i++) {
    dataForSnowlake.push([i, response[i].value]);
  }

  return {
    'statusCode': 200,
    'body': JSON.stringify({ data: dataForSnowlake })
  };
};
