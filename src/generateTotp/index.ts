import { InferType } from "yup";
import DDBUser from "../../lib/DB/DDBUser";
import TOTP, { generateTotpParamSchema } from "../../lib/Utils/TOTPGenerator";

export default async function generateTotp(param : InferType<typeof generateTotpParamSchema>) {
	const ddb = new DDBUser()
	const totp = new TOTP()
	const { email } = param
	try {
		const [user] = (await ddb.query({
			email,
		})).Items!

		if (!user) {
			throw new Error('user not exist')
		}

		if (user.hasTOTP) {
			throw new Error('user cannot generate QR')
		}
		const result = await totp.generateTOTP(param)

		const _param = {
			email,
			secret: result.secret
		}
		if (!user.hasTOTP) {
			await ddb.updateSecret(_param)
		}

		return result

	} catch (e) {
		throw new Error(e.message)
	}
}