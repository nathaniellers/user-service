import DDBUser from "../../lib/DB/DDBUser"
import UserSchema from "../../lib/Schema/UserSchema"
import updateUser from "../updateUser"

describe('updateUser', () => {

	it('should be able to update the user', async () => {
		const param = {
			"fullName":"Dev Admin",
			"email":"nathan@rsolve.co",
		}

		const result = await updateUser(UserSchema.validateSync(param))
		expect(result).toBeTruthy()
	})

	it('should not be able to update user if email does not exist', async () => {
		const param = {
			"fullName":"Dev Admin",
			"email":"sample@rsolve.co"
		}

		try {
			const result = await updateUser(UserSchema.validateSync(param))
			expect(result).toBeTruthy()
		} catch (e) {
			expect(e.message).toBe('No user')             
		}
	})
})