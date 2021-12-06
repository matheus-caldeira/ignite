import { APIGatewayProxyHandler } from 'aws-lambda';

import { document } from '../utils/dynamodbClient'

export const handle: APIGatewayProxyHandler = async (event) => {
  const { userId } = event.pathParameters;

  const response = await document.scan({
    TableName: 'todos',
    ExpressionAttributeNames: {
      "#user_id": "user_id"
    },
    ExpressionAttributeValues: {
      ":user_id": userId
    },
    FilterExpression: "#user_id = :user_id",
  }).promise();

  const todos = response.Items;

  return {
    statusCode: 201,
    body: JSON.stringify({
      todos
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  };
}
