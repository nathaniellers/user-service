
export default class PasswordGenerator {

  constructor() { }

  public static generateStrongPassword() {
    const chars = 'AaBbCcDdEeFfGgHhIiJjKkLlMmNnOoPpQqRrSsTtUuVvWwXxYyZz1234567890'
    const randomArray = Array.from(
      { length: 10 },
      () => chars[Math.floor(Math.random() * chars.length)]
    )
  
    const randomString = randomArray.join('')
    return randomString
  }
}
