import { InferType, object, string } from 'yup'
import DDBUser from '../../lib/DB/DDBUser'
import JWT from '../../lib/Encryption/Jwt'
import TOTP, { verifyTotpParamSchema }  from '../../lib/Utils/TOTPGenerator'

export const verifyTotpSchema = object({
	jwtToken: string().required(),	
	token: string().required(),	
})

export default async function verifyTotp(param: InferType<typeof verifyTotpSchema>) {
	const totp = new TOTP()
	const { jwtToken, token } = param
	const ddb = new DDBUser()
	const jwt = new JWT()
	
	//decode jwt
	const decodedJWT = await jwt.decodeJWT(jwtToken)
	const { email } = decodedJWT.user
	const [user] = (await ddb.query({
    email,
  })).Items!
	
	const params = {
		token: token,
		secret: user.secret,
	}

	try {
		const isVerified = await totp.verifyTotp(verifyTotpParamSchema.validateSync(params))
		if (isVerified == true) {
			return await ddb.updateTotp({email})
		}
		throw new Error('unable to verify totp')

	} catch (e) {
		throw new Error(e.message)
	}
}