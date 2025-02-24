import forgotPassword from '../forgotPassword'

describe('forgotPassword', () => {

  it('should be able to sent email for forgot password', async () => {
    
    const email = 'nathan@rsolve.co'
    try {
      const result = await forgotPassword({ email })
     
      expect(result).toBeTruthy()
    } catch (e) {
      throw new Error(e.message)
    }
    
  })
  
  it('should not send when email does not exist', async () => {
    const param = {
      email: 'jla@rsolve.cos',
      subject: 'Sample Subject',
    }
    try {
      await forgotPassword(param)
    } catch (e) {
      expect(e.message).toBe('User does not exist')
    }
  })

  it('User does not exist', async () => {
    const param = {
      email: 'aac3@email.com',
      subject: 'Sample Subject'
    }
    try {
      await forgotPassword(param)
    } catch (e) {
      expect(e.message).toBe('Unable to properly process the request')
    }
  })
})
