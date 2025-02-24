import { createHmac } from 'crypto'
import { v1 as uuidv1 } from 'uuid'

export default class Salt {

  salt: string

  constructor(salt?: string) {
    this.salt = salt || uuidv1()
  }

  hash(orgVal: string) {
    const hash = createHmac('sha512', this.salt)
    hash.update(orgVal)
    const encVal = hash.digest('hex')

    return { 
      salt: this.salt,
      orgVal,
      encVal,
    }
  }
}
