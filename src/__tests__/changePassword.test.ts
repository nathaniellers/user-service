import Encryptor from '../../lib/Encryption/Encryptor'
import changePassword, { ChangePasswordParamShape } from '../changePassword'


describe('changePassword', () => {
  jest.setTimeout(30000)
  const encryptor = new Encryptor()

  it('should be able to change a user\'s password', async () => {
    
    const email = 'nathan@rsolve.co'
    const param = ChangePasswordParamShape.validateSync({
      email,
      currentPassword: await encryptor.encrypt('passwords'),
      newPassword: await encryptor.encrypt('password'),
    })
    
    const result = await changePassword(param)
    
    expect(result).toBeTruthy()
  })

  it('should not be able to change a deactivated user\'s password', async () => {
    
    const email = 'nathan@rsolve.co'
    const param = ChangePasswordParamShape.validateSync({
      email,
      currentPassword: await encryptor.encrypt('password'),
      newPassword: await encryptor.encrypt('passwords'),
    })
    
    try {
      await changePassword(param)
    } catch (e) {
      expect(e.message).toBe('Invalid password')
    }
  })
  
  it('should not be able to use old password as new password', async () => {
    const email = 'nathan@rsolve.co'
    const param = ChangePasswordParamShape.validateSync({
      email,
      currentPassword: encryptor.encrypt('password'),
      newPassword: encryptor.encrypt('password'),
    })
    
    try {
      await changePassword(param)
    } catch (e) {
      expect(e.message).toBe('Invalid password')
    }
  })
})
