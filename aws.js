let AWS = require('aws-sdk');
AWS.config.region = process.env.AWS_REGION;

module.exports.lambdaInvoke = async function lambdaInvoke(functionName, payload, invocationType = 'RequestResponse') {
    const { Payload } = await (new AWS.Lambda().invoke(
        {
            FunctionName: buildLambdaFunctionArn(functionName),
            Payload: JSON.stringify(payload),
            InvocationType: invocationType
        }
    ).promise());

    const response = JSON.parse(Payload);
    response.body = JSON.parse(response.body);
    return response
}

function buildLambdaFunctionArn(functionName){
    return `arn:aws:lambda:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:function:${functionName}`
}

module.exports.dynamodbGet = async function dynamodbGet(tableName, key){
    return await (new AWS.DynamoDB.DocumentClient()).get({
        TableName: tableName,
        Key: key
    }).promise()
}

module.exports.dynamodbBatchWrite = async function dynamodbBatchWrite(tableName, items){
    const putReqs = items.map(x => ({
        PutRequest: {
            Item: x
        }
    }));

    const params = {
        RequestItems: {
            [tableName]: putReqs
        }
    };

    return await (new AWS.DynamoDB.DocumentClient()).batchWrite(params).promise()
}

module.exports.dynamodbEmptyTable = async function dynamodbEmptyTable(tableName, primaryKeyName) {
    const rows = await (new AWS.DynamoDB.DocumentClient()).scan({
        TableName: tableName,
    }).promise();

    rows.Items.forEach(async function(element, i) {

        await (new AWS.DynamoDB.DocumentClient()).delete({
            TableName: tableName,
            Key: {[primaryKeyName]: element[primaryKeyName]},
        }).promise();
    });
}

module.exports.sqsSendMessage = async function sqsSendMessage(messageBody, queueUrl, options){
    let params = {
        MessageBody: messageBody,
        QueueUrl: queueUrl
    }

    params = { ...params, ...options }

    return await (new aws.SQS()).sendMessage(params).promise()
}

module.exports.sqsReceiveMessage = async function sqsReceiveMessage(queueUrl, visibilityTimeout = 0){

    const queueData = await (new AWS.SQS()).receiveMessage({
        QueueUrl: queueUrl,
        WaitTimeSeconds: 0,
        VisibilityTimeout: visibilityTimeout
    }).promise()

    if (queueData.Messages) {
        await (new AWS.SQS()).deleteMessage({
            QueueUrl: queueURL,
            ReceiptHandle: queueData.Messages[0].ReceiptHandle
        }).promise()
    }

    return queueData.Messages
}