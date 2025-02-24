import * as AWS from 'aws-sdk'

const { STAGE: stage, REGION: region } = process.env

type Param = {
  service: LambdaService,
  method: EmailMethod | AuthenticationMethod,
  payload: any
}

export enum LambdaService {
  Email = 'email-service',
  Authentication = 'authentication-service'
}

export enum EmailMethod {
  SendEmail = 'sendEmail'
}

export enum AuthenticationMethod {
  GenerateJwt = 'generateJwt',
  InvalidateSession = 'invalidateSession'
}

export default async function Invoke(param: Param) {
  const { service, method, payload } = param
  const lambda = new AWS.Lambda({
    apiVersion: '2015-03-31',
    region,
  });
  const params = {
    FunctionName: `${service}-${stage}-${method}`,
    Payload: JSON.stringify(payload),
  }

  const response = await lambda.invoke(params).promise()  
  const { Payload } = response

  try {
    return JSON.parse(<string>Payload)
  } catch (e) {
    return Payload
  }
}
