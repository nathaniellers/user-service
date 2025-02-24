
import * as AWS from 'aws-sdk'
import Config from '../Constants/Config'

export default class Encryptor {

  private kms: AWS.KMS  

  constructor() {
    const { KMS } = AWS
    this.kms = new KMS({ region: Config.REGION })
  }

  async encrypt(data: string) {

    const result = await this.kms.encrypt({
      KeyId: Config.KMS_KEY_ID_PASSWORD,
      EncryptionAlgorithm: 'RSAES_OAEP_SHA_256',
      Plaintext: Buffer.from(data),
    }).promise()

    return Buffer.from(result.CiphertextBlob!).toString('base64')
  }
  
  async decrypt(encodedData: string) {
    const decrypted = await this.kms.decrypt({
      KeyId: Config.KMS_KEY_ID_PASSWORD,
      CiphertextBlob: Buffer.from(encodedData, 'base64'),
      EncryptionAlgorithm: 'RSAES_OAEP_SHA_256',
    }).promise()
  
    return Buffer.from(decrypted.Plaintext!).toString()
  }
}