import { APIGatewayProxyHandler } from 'aws-lambda';
import chromium from 'chrome-aws-lambda'
import handlebars from 'handlebars';
import { S3 } from 'aws-sdk'
import dayjs from 'dayjs'
import path from 'path'
import fs from 'fs'

import { document } from '../utils/dynamodbClient'

interface ICreateCertificate {
  id: string;
  name: string;
  grade: string;
}

interface ITemplate {
  id: string;
  name: string;
  grade: string;
  date: string;
  medal: string;
}

const compile = async (data: ITemplate) => {
  const filePath = path.join(
    process.cwd(),
    'src',
    'templates',
    'certificate.hbs'
  );

  const html = fs.readFileSync(filePath, 'utf-8');

  return handlebars.compile(html)(data)

}

export const handle: APIGatewayProxyHandler = async (event) => {
  const { id, name, grade } = JSON.parse(event.body) as ICreateCertificate;

  const response = await document.query({
    TableName: 'users_certificates',
    KeyConditionExpression: 'id = :id',
    ExpressionAttributeValues: {
      ":id": id
    }
  }).promise();

  const userAlreadyExists = response.Items[0];

  if (!userAlreadyExists)
    await document.put({
      TableName: 'users_certificates',
      Item: {
        id,
        name,
        grade
      }
    }).promise();

  const medalPath = path.join(
    process.cwd(),
    'src',
    'templates',
    'selo.png'
  );

  const medal = fs.readFileSync(medalPath, 'base64')

  const data: ITemplate = {
    date: dayjs().format('DD/MM/YYYY'),
    grade,
    name,
    id,
    medal
  }

  const html = await compile(data);

  const browser = await chromium.puppeteer.launch({
    headless: true,
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath
  })

  const page = await browser.newPage();

  await page.setContent(html);

  const pdf  = await page.pdf({
    format: 'a4',
    printBackground: true,
    landscape: true,
    preferCSSPageSize: true,
  })

  await browser.close();

  const s3 = new S3();

  await s3.putObject({
    Bucket: 'certificates-serverless',
    Key: `${id}.pdf`,
    ACL: 'public-read',
    Body: pdf,
    ContentType: 'pdf'
  }).promise();

  return {
    statusCode: 201,
    body: JSON.stringify({
      message: 'Certificate created!',
      url: `https://certificates-serverless.s3.sa-east-1.amazonaws.com/${id}.pdf`
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  };
}