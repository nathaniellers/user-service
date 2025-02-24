import resendForgotPassword from '../resendForgotPassword'

describe('resendForgotPassword', () => {

  it('should be able to run smoothly', async () => {
    
    const email = 'nathan@rsolve.co'
    const result = await resendForgotPassword({ email })
    
    expect(result).toBeTruthy()
  })
  
  it('should not send if User does not exist', async () => {
    const email = 'nathan@rsolve.com'

    try {
      await resendForgotPassword({ email })
    } catch (e) {
      expect(e.message).toBe('User does not exist')
    }
  })

  it('should not send if email invalid format', async () => {
    const email = 'nathan'

    try {
      await resendForgotPassword({ email })
    } catch (e) {      
      expect(e.message).toBe('User does not exist')
    }
  })
})
