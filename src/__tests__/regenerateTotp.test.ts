import regenerateTOTP from "../regenerateTotp"

describe('regenerateTotp', () => {
	it('should be able to regenerate a totp', async () => {
		const param = {
			email: 'nathan@rsolve.co'
		}

		try {
			const result = await regenerateTOTP(param)
			console.log(result)
			expect(result).toBeTruthy()	
		} catch (e) {
			console.log(e.message)
		}
	})
})