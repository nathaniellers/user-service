
import RoleService from '../RoleService'

describe('RoleService', () => {

  const roleService = new RoleService()

  it('should be able to get the role by id', async () => {
    const result = await roleService.getRoleInfo({ id: '35c57e1d-e099-4439-9369-3a771f00edbf' })

    expect(result).toBeTruthy()
  })
})
