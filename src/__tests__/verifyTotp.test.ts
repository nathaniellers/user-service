import Encryptor from "../../lib/Encryption/Encryptor";
import { verifyTotpParamSchema } from "../../lib/Utils/TOTPGenerator"
import authenticate from "../authenticate";
import verifyTotp from "../verifyTotp"
const request = require('request')

describe('verifyToTp', () => {
	jest.setTimeout(30000)

	const encryptor = new Encryptor()
	
	it('should be able to verify the totp code', async () => {
		let token = '';
		const response = await authenticate({
			email: 'seichi@rsolve.co',
			password: await encryptor.encrypt('P@ssw0rd'),
		});
		
		token = response.jwtToken;
		
		const payload = {
			jwtToken: token!,
			token: '293666',
		}

		try {
			return await verifyTotp(payload)
		} catch (e) {
			throw new Error(e.message)		
		}
	})
})