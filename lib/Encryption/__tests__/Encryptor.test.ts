import Encryptor from '../Encryptor'

describe('Encryptor', () => {
  
  const encryptor = new Encryptor()
  const message = 'this is a sample message'

  it('should be able to encrypt the message', async () => {

    const result = await encryptor.encrypt(message)

    expect(result).toBeTruthy()
  })

  it('should be able to decrypt the message', async () => {

    const encryptedMessage = await encryptor.encrypt(message)
    const decryptedMessage = await encryptor.decrypt(encryptedMessage)

    expect(decryptedMessage).toStrictEqual(message)
  })

  it('should be able to decipher encrypted tests', async () => {

    const encryptedMessage = `Xa1hte14azIFq+eqLd1I3GIc8RYgFsHN4DNJXefAGiBTdw86Nx992eMByc5S8uc6eHiG0fm1xuNfLXkxtwzySREdHmvuMzOpaiwgA8GNJBQjcQ9Q2Kj1XIqBneGLy/nrpKXT9dMxcRZj2dRsS/tJPdNLjnErBgILcEgY0+uAysMrXXAZrGaHoOsIlvfg5rYS2omvb/4UlJo+gDlG7LfitJjLzIRzmpxNWrDE6Ub/PHL3Y+uvJaPlR/VDwqIAA/J9EhUJTGjiXnD2g57RkQZZ1lYu1EFArNf22BiF/ejn85sVyLg8NKZFz8MqPv4/vH20aqHVDaUJriFEBL8i0ID3qw==`
    const decryptedMessage = await encryptor.decrypt(encryptedMessage)
    
    expect(decryptedMessage).toStrictEqual('test123')
  })
})