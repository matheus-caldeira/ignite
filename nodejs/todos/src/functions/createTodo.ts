import { APIGatewayProxyHandler } from 'aws-lambda';
import { v4 } from 'uuid';

import { document } from '../utils/dynamodbClient'

interface ITodo {
  id: string;
  user_id: string;
  title: string;
  done: boolean;
  deadline: Date;
}

export const handle: APIGatewayProxyHandler = async (event) => {
  const { userId } = event.pathParameters;
  const { deadline, done, title } = JSON.parse(event.body);

  if (!deadline || !title) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: `Missing params: ${!deadline ? 'deadline' : 'title'}`
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    }
  }

  const todo: ITodo = {
    id: v4(),
    user_id: userId,
    title,
    done: Boolean(done),
    deadline: new Date(deadline)
  }

  await document.put({
    TableName: 'todos',
    Item: todo,
  }).promise();

  return {
    statusCode: 201,
    body: JSON.stringify({
      todo
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  };
}
