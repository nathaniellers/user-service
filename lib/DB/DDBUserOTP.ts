import { DynamoDB } from 'aws-sdk'
import { InferType } from 'yup'
import DDBUser from './DDBUser'
import { UserOTPSchema } from '../Schema/UserOTPSchema'
import Config from '../Constants/Config'

const { Converter } = DynamoDB
const { marshall, unmarshall } = Converter

type DDBUserConstruct = {
  tableName?: string,
  region?: string
}

type UserOTPParam = {
  otp: string,
  projection?: string[]
}

export default class DDBUserOTP {

  private table: string
  private ddb: DynamoDB
  private ddbUser: DDBUser
  private dataset: string = 'user-otp'
  // private IndexName: string = 'GSI_Dataset_ID'
  // private excludedKeys: string[] = [
  //   'id',
  //   'email',
  //   'dataset',
  //   'otp',
  //   'userPrimaryKey',
  //   'expirationDate',
  // ] // keys that MUST NOT be updated using the update method
  private projection: string = [
    'id',
    'otp',
    'userPrimaryKey',
    'isVerified',
    'expirationDate',
    'createdAt',
    'updatedAt',
  ].join(', ')

  constructor(config?: DDBUserConstruct) {
    const { tableName, region } = config || {}
    const ddbConfig = {
      apiVersion: Config.AWS_API_VERSION,
      region: region || Config.REGION
    }
    this.ddbUser = new DDBUser()
    this.ddb = new DynamoDB(ddbConfig)
    this.table = tableName || Config.DDB_TABLE
  }

  async query(_params: UserOTPParam): Promise<DynamoDB.QueryOutput> {
    const { otp } = _params
    const params = {
      ExpressionAttributeValues: {
        ':dataset': { S: this.dataset },
        ':sort': { S: otp }
      },
      KeyConditionExpression: 'dataset = :dataset and sort = :sort',
      ProjectionExpression: (() => {
        if (_params && _params.projection && _params.projection.length) {
          return _params.projection?.join(', ')
        }
        return this.projection
      })(),
      TableName: this.table,
    }
    
    try {
      const result = await this.ddb.query(params).promise()
      const { $response } = result
      const { error } = $response

      if (error) {
        throw error
      }

      const data = <DynamoDB.QueryOutput>$response.data

      if (data && data.Count) {
        return {
          ...data,
          Items: data.Items?.map((item) => unmarshall(item))
        }
      }

      return data
    } catch (e) {
      throw new Error(e)
    }
  }

  async add(_userOTP: InferType<typeof UserOTPSchema>) {
    const userOTP = Object.assign({}, _userOTP)
    userOTP.sort = userOTP.otp
    const userQueryRes = await this.ddbUser.query({ email: _userOTP.userPrimaryKey.sort })

    if (!userQueryRes.Count) {
      throw new Error('User does not exist')
    }

    const params = {
      TableName: this.table,
      Item: marshall(userOTP),
    }

    try {
      const result = await this.ddb.putItem(params).promise()
      const { $response } = result
      const { error } = $response

      if (error) {
        throw error
      }

      return result
    } catch (e) {
      throw new Error(e)
    }
  }

  private async execUpdate(params: DynamoDB.UpdateItemInput) {
    const result = await this.ddb.updateItem(params).promise()
    const { $response } = result
    const { error } = $response

    if (error) {
      throw error
    }

    const data = <DynamoDB.UpdateItemOutput>$response.data

    if (data) {
      return {
        ...data,
        Attributes: unmarshall(data.Attributes!)
      }
    }

    return data
  }

  async verifyOtp({ otp }: UserOTPParam)  {
    const { table: TableName, dataset } = this
    const UpdateExpression = 'SET isVerified = :isVerified, updatedAt = :updatedAt'
    const ReturnValues = 'UPDATED_NEW'
    const ExpressionAttributeValues = marshall({
      ':isVerified': true,
      ':updatedAt': String(new Date()),
    })
    const Key = {
      dataset: { S: dataset },
      sort: { S: otp },
    }

    try {
      return this.execUpdate({
        TableName,
        Key,
        UpdateExpression,
        ExpressionAttributeValues,
        ReturnValues,
      })
    } catch (e) {
      throw new Error(e)
    }
  }
}
