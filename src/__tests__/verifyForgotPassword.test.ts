import Encryptor from '../../lib/Encryption/Encryptor'
import verifyForgotPassword, { VerifyForgotPWParamShape } from '../verifyForgotPassword'


describe('verifyForgotPassword', () => {
  const encryptor = new Encryptor()
  
  it('should be able change password', async () => {
    const password = await encryptor.encrypt('passwords')
    
    const payload = VerifyForgotPWParamShape.validateSync({
      "email": "nathan@rsolve.co",
      "newPassword": password,
      "confirmNewPassword": password
    })

    const result = await verifyForgotPassword(payload)
    
    expect(result).toBeTruthy()
  })

  it('should not be able to change password if password does not match', async () => {
    const payload = VerifyForgotPWParamShape.validateSync({
      "email": "nathan@rsolve.co",
      "newPassword": await encryptor.encrypt("password"),
      "confirmNewPassword": await encryptor.encrypt("word")
    })
    
    try {
      await verifyForgotPassword(payload)
    } catch (e) {
      expect(e.message).toBe('Invalid password')
    }
  })

  it('should not be able to change password if email does not exist', async () => {
    const password = await encryptor.encrypt("password")
    const payload = VerifyForgotPWParamShape.validateSync({
      "email": "changepasword@rsolve.com",
      "newPassword": password,
      "confirmNewPassword": password
    })

    try {
      await verifyForgotPassword(payload)
    } catch (e) {
      expect(e.message).toBe('Unable to properly process the request. Check the user record.')
    }
  })
})
