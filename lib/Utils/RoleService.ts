import { DynamoDB, Lambda } from 'aws-sdk'
import { object, string, InferType } from 'yup'
import Config from '../Constants/Config'

export const RoleIdParam = object({
  id: string().required()
}).noUnknown(true)

export default class RoleService {

  lambda: Lambda

  constructor() {
    this.lambda = new Lambda({ region: Config.REGION })
  }

  public async getRoleInfo(param: InferType<typeof RoleIdParam>) {
    const FunctionName = `role-service-${Config.STAGE}-getRoleInfo`
    
    return new Promise((resolve, reject) => {
      this.lambda.invoke({
        FunctionName,
        Payload: JSON.stringify({
          queryStringParameters: {
            id: param.id
          },
        }),
      }, (err, data) => {
        if (err) {
          reject(err)
          return
        }
        
        const rawPayload = data.Payload?.toString()!
        const { body } = JSON.parse(rawPayload)
        const { data: bodyData } = JSON.parse(body)
        
        resolve(bodyData)
      })
    })
  }
}
