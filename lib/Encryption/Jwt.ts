import * as AWS from 'aws-sdk'
import Config from '../Constants/Config'

export enum Algo {
  RS256 = 'RS256'
}

type JWTSignPayload = {
  header: {
    alg: Algo,
    typ: 'JWT'
  },
  payload: object,
}

export default class JWT {

  private kms: AWS.KMS  

  constructor() {
    const { KMS } = AWS
    this.kms = new KMS({ region: Config.REGION })
  }

  async sign({ header, payload }: JWTSignPayload) {
    const jwtHeader = Buffer.from(JSON.stringify(header)).toString('base64')
    const jwtPayload = Buffer.from(JSON.stringify(payload)).toString('base64')
  
    const message = Buffer.from(`${jwtHeader}.${jwtPayload}`)
    const signResponse = await this.kms.sign({
      KeyId: Config.KMS_KEY_ID_AUTH,
      Message: message,
      SigningAlgorithm: 'RSASSA_PKCS1_V1_5_SHA_256',
      MessageType: 'RAW'
    }).promise()

    const jwtSignature = signResponse.Signature?.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
    const jwtToken = `${jwtHeader}.${jwtPayload}.${jwtSignature}`
    
    return jwtToken
  }
  
  async verify(jwt: string) {
    const [header, payload, signature] = jwt.split('.')
    const message = Buffer.from(`${header}.${payload}`)
    
    try {
      const { SignatureValid } = await this.kms.verify({
        KeyId: Config.KMS_KEY_ID_AUTH,
        Message: message,
        Signature: Buffer.from(signature, 'base64'),
        SigningAlgorithm: 'RSASSA_PKCS1_V1_5_SHA_256',
        MessageType: 'RAW',
      }).promise()

      return SignatureValid
    } catch (e) {
      return false
    }
  }

  async decodeJWT(jwt: string) {
    
    try {
      const base64Url = jwt.split('.')[1];
      const base64 = base64Url.replace('-', '+').replace('_', '/');
      const decodedData = JSON.parse(Buffer.from(base64, 'base64').toString('binary'));

      return decodedData
    } catch (e) {
      return false
    }
  }
}
