import generateTotp from "../../../src/generateTotp";

describe('GenerateTotp', () => {
	jest.setTimeout(30000)
	
	it('should be able to generate a totp', async () => {
		try {
			const result = await generateTotp({
				email:'nathan@rsolve.co',
			})
			console.log(result)
			expect(result).toBeTruthy()
		} catch (e) {
			console.log(e.message)
		}
	})

	it('should not be able to generate a totp', async () => {
		try {
			await generateTotp({
				email: 'seichi@rsolve.co',
			})
		} catch (e) {
			expect(e.message).toBe('user cannot generate QR')		
		}
	})
})