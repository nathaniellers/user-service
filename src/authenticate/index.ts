import { string, object, InferType } from 'yup'
import UserSchema from '../../lib/Schema/UserSchema'
import DDBUser from '../../lib/DB/DDBUser'
import Salt from '../../lib/Encryption/Salt'
import Jwt, { Algo } from '../../lib/Encryption/Jwt'
import RoleService, { RoleIdParam } from '../../lib/Utils/RoleService'
import Encryptor from '../../lib/Encryption/Encryptor'

const roleService = new RoleService()

export const ParamSchema = object({
  email: string().email().required(),
  password: string().required(),
})

export default async function authenticate(params: InferType<typeof ParamSchema>) {
  const encryptor = new Encryptor()
  const { email, password } = params
  const ddb = new DDBUser()
  const result = await ddb.query({
    email,
    projection: [
      'id',
      'email',
      'password',
      'salt',
      'fullName',
      'roleId',
      'roleName',
      'loginAttempts',
      'isActive',
      'isLockedOut',
      'isNewUser',
      'hasTOTP',
      'secret',
      'isEmailVerified',
      'isPasswordReset',
      'profileImage',
    ],
  })
  
  if (!result || !result.Count || result.Count > 1) {
    throw new Error('Cannot authenticate')
  }

  const [user] = <[InferType<typeof UserSchema>]>result.Items!
  const { password: userPasswordHash, salt: userSalt, loginAttempts, isLockedOut, isActive } = user
  // check if user is locked out
  if (isLockedOut) {
    throw new Error('Locked out') // throw locked out error
  }

  if (!isActive) {
    throw new Error('Disabled') // throw locked out error
  }
  
  const salt = new Salt(userSalt)
  const pass = await encryptor.decrypt(password)

  // check if the password matches using the user's salt hash
  if (salt.hash(pass).encVal !== userPasswordHash) {
    
    // if the password does not match, execute this block...
    
    // if the user already has 3 or more than 3 login attempts
    // lock the user
    if (loginAttempts >= 3) {
      await ddb.lockUser({ email })
      throw new Error('Account locked')
    }

    // else increase the number of invalid login attempts
    await ddb.increaseLoginAttempts({ email })
    throw new Error('Cannot authenticate')
  }

  // if password is successful and there were previously
  // invalid login attempts
  if (loginAttempts) {
    await ddb.resetLoginAttempts({ email })
  }

  // if the password matches, increment the last login date of the user
  await ddb.updateLastLogin({ email })

  const param = RoleIdParam.validateSync({
    id: user.roleId,
  })
  const role = await roleService.getRoleInfo(param)

  const payload = {
    user,
    role,
  }

  const jwtToken = await (new Jwt().sign({
    header: {
      alg: Algo.RS256,
      typ: 'JWT',
    },
    payload,
  }))
  
  return {
    jwtToken,
    user: {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roleId: user.roleId,
      roleName: user.roleName,
      isEmailVerified: user.isEmailVerified,
      isNewUser: user.isNewUser,
      profileImage: user.profileImage,
      secret: (user.secret ? user.secret : null),
      hasTOTP: (user.hasTOTP ? user.hasTOTP : false)
    },
    modulesPermission: {
      role,
    },
  }
}
