import { string, date, boolean, object, number } from 'yup'
import { v4 as uuidv4 } from 'uuid'
import PasswordGenerator from '../Encryption/PasswordGenerator'

export const UserSchema = object()
  .shape({
    dataset: string().default(() => 'user'), // partition key
    sort: string(), // sort key
    id: string().uuid().default(() => uuidv4()), // GSI - dataset (PK) + id
    email: string().email().required(),
    fullName: string().required(),
    password: string().default(() => PasswordGenerator.generateStrongPassword()),
    profileImage: object().nullable().shape({
      s3Bucket: string(),
      s3Key: string(),
    }),
    salt: string().required().default(() => uuidv4()),
    resetPasswordToken: string().default(''),
    resetPasswordTokenExpDate: date(),
    loginAttempts: number().default(()=>0),
    lastLogin: string(),
    isLockedOut: boolean().default(()=>false),
    roleId: string(),
    roleName: string(),
    isActive: boolean().required().default(()=>true),
    isNewUser: boolean().required().default(()=>true),
    isPasswordReset: boolean().required().default(()=>false),
    hasTOTP: boolean().required().default(()=>false),
    secret: string(),
    lockedAt: string(),
    isEmailVerified: boolean().default(()=>false),
    createdAt: string().default(() => String(new Date())),
    updatedAt: string().default(() => String(new Date())),
  })
  .noUnknown(true)

export default UserSchema
