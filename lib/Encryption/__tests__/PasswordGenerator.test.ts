import PasswordGenerator from '../PasswordGenerator'

describe('PasswordGenerator', () => {

  it('should be able to generate a strong password', async () => {
    const password = PasswordGenerator.generateStrongPassword()

    expect(typeof password).toStrictEqual('string')
  })
})
