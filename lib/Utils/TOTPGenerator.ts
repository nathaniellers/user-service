import * as speakeasy from 'speakeasy'
import * as qrcode from 'qrcode'
import { InferType, object, string } from 'yup'

export const verifyTotpParamSchema = object({
	token: string().required(),
	secret: string().required(),
}) 

export const generateTotpParamSchema = object({
	email: string().email().required()
})

export default class TOTP {
	async generateTOTP(user: InferType<typeof generateTotpParamSchema>) {
		const secret = await speakeasy.generateSecret({
			name:'sendwell-totp',
			length: 20,
			issuer: 'sendwell',
		})
		const qr = await qrcode.toDataURL(secret.otpauth_url!)	
		const token = speakeasy.totp({
			secret:secret.base32,
			encoding: 'base32',
			time: 30,
		})	
		const result = {
			secret: secret.base32,
			encoding: 'base32',
			token,
			qr,
		}
		return result
	}

	async verifyTotp(data: InferType<typeof verifyTotpParamSchema>) {
		return await speakeasy.totp.verify({
			secret: data.secret,
			encoding: 'base32',
			token: data.token,
		})
	}
}
