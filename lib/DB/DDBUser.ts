import { DynamoDB } from 'aws-sdk'
import { InferType } from 'yup'
import { UserSchema } from '../Schema/UserSchema'
import Config from '../Constants/Config'

const { Converter } = DynamoDB
const { marshall, unmarshall } = Converter

type DDBUserConstruct = {
  tableName?: string,
  region?: string
}

type SearchParam = {
  keyword: string,
  nextKey?: DynamoDB.Key,
  limit?: number
}

type UserEmailParam = {
  email: string,
  projection?: string[]
}

type generateTotpParam = {
  email: string,
  secret: any,
}

type ResetPasswordParam = {
  email: string
  salt: string
  password: string
}

type UserProfileImageParam = {
  email: string
  s3Bucket: string
  s3Key: string
  projection?: string[]
}

type UserPasswordParam = {
  email: string
  password: string
  salt: string
  isNewUser: boolean
  isPasswordReset: boolean
}

export default class DDBUser {

  private table: string
  private ddb: DynamoDB
  private dataset: string = 'user'
  private excludedKeys: string[] = [
    'id',
    'sort',
    'email',
    'dataset',
    'createdAt',
    'isActive',
    'lastLogin',
    'profileImage',
    'loginAttempts',
    'resetPasswordToken',
    'resetPasswordTokenExpDate',
    'password',
    'salt',
    'isNewUser',
    'isPasswordReset',
  ]
  private projection: string = [
    'id',
    'dataset',
    'sort',
    'email',
    'fullName',
    'profileImage',
    'roleId',
    'roleName',
    'isLockedOut',
    'isActive',
    'isNewUser',
    'isPasswordReset',
    'isEmailVerified',
    'secret',
    'hasTOTP',
    'lockedAt',
    'createdAt',
    'updatedAt'
  ].join(', ')

  constructor(config?: DDBUserConstruct) {
    const { tableName, region } = config || {}
    this.ddb = new DynamoDB({
      apiVersion: Config.AWS_API_VERSION,
      region: region || Config.REGION
    })
    this.table = tableName || Config.DDB_TABLE
  }

  async searchByFullName(param: SearchParam) {
    const { keyword, nextKey, limit } = param
    let params: DynamoDB.QueryInput = {
      ExpressionAttributeValues: {
        ':dataset': { S: this.dataset },
        ':keyword': { S: keyword },
      },
     KeyConditionExpression: 'dataset = :dataset',
     FilterExpression: 'contains(fullName, :keyword)',
     ProjectionExpression: this.projection,
     TableName: this.table,
     Limit: limit || 10,
    }

    if (nextKey) {
      params = {
        ...params,
        ExclusiveStartKey: nextKey,
      }
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
    } catch (e) {
      throw new Error(e)
    }
  }

  async query(_params: UserEmailParam): Promise<DynamoDB.QueryOutput> {
    const { email } = _params
    const params = {
      ExpressionAttributeValues: {
        ':dataset': { S: this.dataset },
        ':sort': { S: email }
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

  async add(_user: InferType<typeof UserSchema>) {
    const user = Object.assign({}, _user)
    user.sort = user.email

    // @ts-ignore
    delete user.profileImage

    const params = {
      TableName: this.table,
      Item: marshall(user),
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

  private generateUpdateExpression(_user: InferType<typeof UserSchema>) {
    const keys = Object.keys(_user)
    const updateExp = keys
      .filter((key) => !this.excludedKeys.find((excKey) => excKey === key))
      .map((key) => `${key} = :${key}`)
      .join(', ')

    return `SET ${updateExp}`    
  }

  private generateExpressionAttValues(_user: InferType<typeof UserSchema>) {
    const keys = Object.keys(_user)
    const expAttrValues = {}
    
    keys
      .filter((key) => !this.excludedKeys.find((excKey) => excKey === key))
      .forEach((key) => {
        expAttrValues[`:${key}`] = _user[key]
      })
    
    return marshall(expAttrValues)
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

  async update(_user: InferType<typeof UserSchema>)  {
    try {
      const { table: TableName, dataset } = this
      const { email } = _user
      const Key = {
        dataset: { S: dataset },
        sort: { S: email },
      }
      const UpdateExpression = this.generateUpdateExpression(_user)
      const ExpressionAttributeValues = this.generateExpressionAttValues(_user)
      const ReturnValues = 'UPDATED_NEW'

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

  async deactivate(_user: UserEmailParam)  {
    try {
      const { table: TableName, dataset } = this
      const { email } = _user
      const Key = {
        dataset: { S: dataset },
        sort: { S: email },
      }
      const UpdateExpression = 'SET isActive = :isActive, updatedAt = :updatedAt'
      const ExpressionAttributeValues = marshall({
        ':isActive': false,
        ':updatedAt': String(new Date()),
      })
      const ReturnValues = 'UPDATED_NEW'
      
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

  async reactivate(_user: UserEmailParam)  {
    try {
      const { table: TableName, dataset } = this
      const { email } = _user
      const Key = {
        dataset: { S: dataset },
        sort: { S: email },
      }
      const UpdateExpression = 'SET isActive = :isActive, updatedAt = :updatedAt'
      const ExpressionAttributeValues = marshall({
        ':isActive': true,
        ':updatedAt': String(new Date()),
      })
      const ReturnValues = 'UPDATED_NEW'
      
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

  async regenerateTOTP(_user: UserEmailParam)  {
    try {
      const { table: TableName, dataset } = this
      const { email } = _user
      const Key = {
        dataset: { S: dataset },
        sort: { S: email },
      }
      const UpdateExpression = 'SET hasTOTP = :hasTOTP, secret=:secret, updatedAt = :updatedAt'
      const ExpressionAttributeValues = marshall({
        ':hasTOTP': false,
        ':secret': null,
        ':updatedAt': String(new Date()),
      })
      const ReturnValues = 'UPDATED_NEW'
      
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

  async emailVerify(_user: UserEmailParam)  {
    try {
      const { table: TableName, dataset } = this
      const { email } = _user
      const Key = {
        dataset: { S: dataset },
        sort: { S: email },
      }
      const UpdateExpression = 'SET isActive = :isActive, isEmailVerified = :isEmailVerified'
      const ExpressionAttributeValues = marshall({
        ':isActive': true,
        ':isEmailVerified': true,
      })
      const ReturnValues = 'UPDATED_NEW'
      
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

  async increaseLoginAttempts(_user: UserEmailParam)  {
    try {
      const { table: TableName, dataset } = this
      const { email } = _user
      const Key = {
        dataset: { S: dataset },
        sort: { S: email },
      }
      const UpdateExpression = 'SET loginAttempts = loginAttempts + :loginAttempts, updatedAt = :updatedAt'
      const ExpressionAttributeValues = marshall({
        ':loginAttempts': 1,
        ':updatedAt': String(new Date()),
      })
      const ReturnValues = 'UPDATED_NEW'
      
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

  async resetLoginAttempts(_user: UserEmailParam)  {
    try {
      const { table: TableName, dataset } = this
      const { email } = _user
      const Key = {
        dataset: { S: dataset },
        sort: { S: email },
      }
      const UpdateExpression = 'SET loginAttempts = :loginAttempts, updatedAt = :updatedAt'
      const ExpressionAttributeValues = marshall({
        ':loginAttempts': 0,
        ':updatedAt': String(new Date()),
      })
      const ReturnValues = 'UPDATED_NEW'
      
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

  async updateLastLogin(_user: UserEmailParam)  {
    try {
      const { table: TableName, dataset } = this
      const { email } = _user
      const Key = {
        dataset: { S: dataset },
        sort: { S: email },
      }
      const UpdateExpression = 'SET lastLogin = :lastLogin, updatedAt = :updatedAt'
      const ExpressionAttributeValues = {
        ':lastLogin': { S: String(new Date()) },
        ':updatedAt': { S: String(new Date()) }
      }
      const ReturnValues = 'UPDATED_NEW'
      
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

  async newPassword({ email, password, salt, isNewUser, isPasswordReset }: UserPasswordParam)  {
    try {
      const { table: TableName, dataset } = this
      const Key = {
        dataset: { S: dataset },
        sort: { S: email },
      }
      const UpdateExpression = [
        'SET salt = :salt',
        'password = :password', 
        'isNewUser = :isNewUser', 
        'isPasswordReset = :isPasswordReset',
        'updatedAt = :updatedAt',
      ].join(', ')
      const ExpressionAttributeValues = {
        ':salt': { S: salt },
        ':password': { S: password  },
        ':isNewUser': { BOOL: isNewUser  },
        ':isPasswordReset': { BOOL: isPasswordReset  },
        ':updatedAt': { S: String(new Date()) }
      }
      const ReturnValues = 'UPDATED_NEW'
      
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

  async updateSecret(_user: generateTotpParam) {
    try {
      const { table: TableName, dataset } = this
      const { email, secret } = _user
      const Key = {
        dataset: { S: dataset },
        sort: { S: email },
      }
      const UpdateExpression = 'SET secret = :secret, updatedAt = :updatedAt'
      const ExpressionAttributeValues = marshall({
        ':secret': secret,
        ':updatedAt': String(new Date()),
      })
      const ReturnValues = 'UPDATED_NEW'
      
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

  async updateTotp(_user: UserEmailParam) {
    try {
      const { table: TableName, dataset } = this
      const { email } = _user
      const Key = {
        dataset: { S: dataset },
        sort: { S: email },
      }
      const UpdateExpression = 'SET hasTOTP = :hasTOTP, updatedAt = :updatedAt'
      const ExpressionAttributeValues = marshall({
        ':hasTOTP': true,
        ':updatedAt': String(new Date()),
      })
      const ReturnValues = 'UPDATED_NEW'
      
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

  async lockUser(_user: UserEmailParam) {
    try {
      const { table: TableName, dataset } = this
      const { email } = _user
      const Key = {
        dataset: { S: dataset },
        sort: { S: email },
      }
      const UpdateExpression = 'SET isLockedOut = :isLockedOut, lockedAt = :lockedAt, updatedAt = :updatedAt'
      const ExpressionAttributeValues = marshall({
        ':isLockedOut': true,
        ':lockedAt': String(new Date()),
        ':updatedAt': String(new Date()),
      })
      const ReturnValues = 'UPDATED_NEW'
      
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

  async setUserProfileImg(_user: UserProfileImageParam) {
    try {
      const { table: TableName, dataset } = this
      const { email, s3Bucket, s3Key } = _user
      const Key = {
        dataset: { S: dataset },
        sort: { S: email },
      }
      const UpdateExpression = [
        'SET',
        ' profileImage = :profileImage',
        ', updatedAt = :updatedAt'
      ].join('')
      const ExpressionAttributeValues = marshall({
        ':profileImage': {
          s3Bucket,
          s3Key,
        },
        ':updatedAt': String(new Date()),
      })
      const ReturnValues = 'UPDATED_NEW'
      
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

  async resetPassword({ email, salt, password }: ResetPasswordParam) {
    try {
      const { table: TableName, dataset } = this
      const Key = {
        dataset: { S: dataset },
        sort: { S: email },
      }
      const UpdateExpression = [
        'SET password = :password',
        'salt = :salt',
        'isPasswordReset = :isPasswordReset',
        'updatedAt = :updatedAt',
      ].join(', ')
      const ExpressionAttributeValues = marshall({
        ':password': password,
        ':salt': salt,
        ':isPasswordReset': true,
        ':updatedAt': String(new Date()),
      })
      const ReturnValues = 'UPDATED_NEW'
      
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
