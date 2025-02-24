import Salt from '../../lib/Encryption/Salt'
import { v4 as uuidv4 } from 'uuid'
import UserSchema from '../../lib/Schema/UserSchema'
import { InferType } from 'yup'
import DDBUser from '../../lib/DB/DDBUser'
import Encryptor from '../../lib/Encryption/Encryptor'
import addUser from '../addUser'

jest.setTimeout(30000)

describe('addUser', () => {
  const encryptor = new Encryptor()

  it('it should be able to add a user', async () => {
    const password = 'password'
    
    const { salt } = new Salt(uuidv4()).hash(password) 
    const param = {
      "dataset": "user",
      "id": uuidv4(),
      "email": "nathan@rsolve.co",
      "fullName": "Nathanielle Romero",
      "roleId": "bd537252-7c6f-46d3-a40f-9548b594f16c",
      "loginAttempts": 0,
      "roleName": "Administrator",
      "isActive": true,
      "isPasswordReset": false,
      "hasTOTP": false,
      "isEmailVerified": false,
    }
    
    const encryptedUserPayload = <InferType<typeof UserSchema>>{
      ...param,
      salt,
      password: await encryptor.encrypt(password),
    }

    const result = await addUser(encryptedUserPayload)
    expect(result).toBeTruthy()    
  })

  it('it should not be able to add user with wrong email format', async () => {
    const ddb = new DDBUser()
    const password = 'password'
    const { encVal, salt } = new Salt(uuidv4()).hash(password) 
    const param = {
      "dataset": "user",
      "id": uuidv4(),
      "email": "nathan",
      "fullName": "Nathan Romero",
      "password": encVal,
      "salt": salt
    }

    const encryptedUserPayload = <InferType<typeof UserSchema>>{
      ...param,
      salt,
      password: encVal,
    }

    
    try {
      await ddb.add(UserSchema.validateSync(encryptedUserPayload))
    } catch (e) {
      expect(e.message).toBe('email must be a valid email')
    }
  })
})