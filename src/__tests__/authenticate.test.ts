import Encryptor from '../../lib/Encryption/Encryptor'
import authenticate from '../../src/authenticate'

jest.setTimeout(30000)

describe('authenticate', () => {
  const email = 'nathan@rsolve.co'
  const encryptor = new Encryptor()
  
  it('should be able authenticate using an encrypted password', async () => {
    
    const password = await encryptor.encrypt('passwords')  
    console.log(password);
    
    const result = await authenticate({ 
      email,
      password,
    })
    expect(result).toBeTruthy()
  })

  it('should be able to handle a wrong password', async () => {
    const param = {
      email,
      password: await encryptor.encrypt('wrongpassword'),
    }
    try {
      await authenticate(param)
    } catch (e) {
      expect(e.message).toBe('Cannot authenticate')
    }
  })

  it('should be able to return a lock-out message', async () => {
    try {
      await authenticate({
        email: 'lockedoutaccount@rsolve.co',
        password: 'password'
      })
    } catch (e) {
      expect(e.message).toBe('Locked out')
    }
  })
})