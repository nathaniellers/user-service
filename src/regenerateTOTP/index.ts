import { InferType, object, string } from "yup";
import DDBUser from "../../lib/DB/DDBUser";
import TOTP, { generateTotpParamSchema } from "../../lib/Utils/TOTPGenerator";

export const ParamSchema = object({
	email: string().email().required()
})

export default async function regenerateTOTP(params: InferType<typeof ParamSchema>) {
	const ddb = new DDBUser()
	const totp = new TOTP()
	try {
		await ddb.regenerateTOTP(params)
		const regenerate = await totp.generateTOTP(generateTotpParamSchema.validateSync(params))
		const _param = {
			email: params.email,
			secret: regenerate.secret
		}
		const result = await ddb.updateSecret(_param)
		return result
	} catch (e) {
		throw new Error(e.message)
	}
}