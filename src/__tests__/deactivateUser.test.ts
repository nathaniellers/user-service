import deactivateUser, { DeactivateUserParamShape } from '../deactivateUser'

describe('deactivateUser', () => {

  test('Deactivating the user', async () => {
    
    const email = 'activated@rsolve.co'
    const param = DeactivateUserParamShape.validateSync({ email })
    const result = await deactivateUser(param)

    expect(result).toBeTruthy()
  }) 

  it('should not deactivate if the User cannot find', async () => {
    const email = 'deactivated@rsolve.com'
    let result: any
    try {
      result = await deactivateUser(DeactivateUserParamShape.validateSync({ email }))
      expect(result).toBeFalsy()
    } catch (e) {
      expect(e.message).toBe('Unable to properly process the request')
    }
  })

  it('should not deactivate an already deactivated User', async () => {
    const email = 'deactivated@rsolve.co'
    let result: any
    try {
      result = await deactivateUser(DeactivateUserParamShape.validateSync({ email }))
      expect(result).toBeFalsy()
    } catch (e) {
      expect(e.message).toBe('Unable to properly process the request')
    }
  })
})
