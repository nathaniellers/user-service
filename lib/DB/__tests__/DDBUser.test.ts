
import { v4 as uuidv4 } from 'uuid'
import { InferType } from 'yup'
import DDBUser from '../../../lib/DB/DDBUser'
import UserSchema from '../../../lib/Schema/UserSchema'
import Salt from '../../../lib/Encryption/Salt'

describe('DDBUser', () => {

  const tableName = 'user-service'
  const key = 'sample-key'
  const password = 'hello-world'
  const ddb = new DDBUser({
    tableName,
  })
  const email = `${uuidv4().split('-')[3]}@email.com`

  it('should be able to add a user', async () => {
    const { encVal, salt } = new Salt(key).hash(password)
    const user = UserSchema.validateSync({
      id: uuidv4(),
      email: email,
      fullName: 'john doe',
      password: encVal,
      salt: salt,
      isActive: true
    })

    try {
      const result = await ddb.add(user)
      expect(result).toStrictEqual({})
    } catch (e) {
      throw e
    }
  })

  it('should be able to search for users', async () => {
    const result = await ddb.searchByFullName({
      keyword: 'john'
    })
  
    try {  
      expect(result?.Count).toBeGreaterThanOrEqual(1)
    } catch (e) {
      throw e
    }
  })

  it('should be able to search for users using a keyword', async () => {  
    const result = await ddb.searchByFullName({
      keyword: 'john',
    })
  
    try {  
      expect(result?.Count).toBeGreaterThanOrEqual(1)
    } catch (e) {
      throw e
    }
  })

  it('should be able to query users', async () => {
    const result = await ddb.query({
      email,
    })
  
    try {  
      expect(result.Count).toStrictEqual(1)
    } catch (e) {
      throw e
    }
  })

  it('should be able to update a user record', async () => {
    const result = await ddb.query({
      email,
    })
    let user = <InferType<typeof UserSchema>>Object.assign({}, result.Items![0])
    user.fullName = 'jane done'

    try {  
      const result = await ddb.update(user)
      expect(result.Attributes?.fullName).toStrictEqual('jane done')
    } catch (e) {
      throw e
    }
  })

  it('should be able to set user profile image', async () => {
    try {  
      const result = await ddb.setUserProfileImg({
        email,
        s3Bucket: 'SampleS3Bucket',
        s3Key: 'SampleS3Key',
      })
      expect(result).toBeTruthy()
    } catch (e) {
      throw e
    }
  })

  it('should be able to deactivate the user', async () => {
    try {  
      const result = await ddb.deactivate({
        email,
      })
      expect(result.Attributes?.isActive).toStrictEqual(false)
    } catch (e) {
      throw e
    }
  })

  it('should be able to reactivate the user', async () => {
    try {  
      const result = await ddb.reactivate({
        email,
      })
      expect(result.Attributes?.isActive).toStrictEqual(true)
    } catch (e) {
      throw e
    }
  })
})
