import JWT, { Algo } from '../Jwt'

describe('JWT', () => {

  const jwt = new JWT()

  it('should be able to generate JWT token', async () => {
    const token = await jwt.sign({
      header: {
        alg: Algo.RS256,
        typ: 'JWT',
      },
      payload: {
        "password": "2483ad949039c4f863ce3e74d304cee7a373d6e5b043d8f512b5edf7b437ff4e46e9d1f406833037c92ccb64cbebf82db86b53dc97510547918e995e531aa3f4",
        "email": "bd8f@email.com",
        "id": "ad569399-f9e6-440a-a93a-afd4e0671862",
        "loginAttempts": 1,
        "salt": "sample-key"
      },
    })

    expect(typeof token).toStrictEqual('string')
  })

  it('should be able to verify using the public key', async () => {
    const token = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXNzd29yZCI6IjI0ODNhZDk0OTAzOWM0Zjg2M2NlM2U3NGQzMDRjZWU3YTM3M2Q2ZTViMDQzZDhmNTEyYjVlZGY3YjQzN2ZmNGU0NmU5ZDFmNDA2ODMzMDM3YzkyY2NiNjRjYmViZjgyZGI4NmI1M2RjOTc1MTA1NDc5MThlOTk1ZTUzMWFhM2Y0IiwiZW1haWwiOiJiZDhmQGVtYWlsLmNvbSIsImlkIjoiYWQ1NjkzOTktZjllNi00NDBhLWE5M2EtYWZkNGUwNjcxODYyIiwibG9naW5BdHRlbXB0cyI6MSwic2FsdCI6InNhbXBsZS1rZXkifQ==.u7tGiMX0YPuE72j6NiBkpSI0pfWAfOFzhF3AEb2E8mCLJ_3WTXDC2IXevFqlI1kl5E5YVfZiRfe3oyKYFRJNqD8QFOszZq-HYI1Ilpkli52dMs2GtgElSMdeAqdT86VUuDjrFvLRIB8FOAStKe6KqxWFXYXi696RVLCFCl97VQeDp9hKSQVAX0BEsYYa_PRYHtYK8p_JZ_EwytPghob0Jc-FoSUJZNaom8_H8eyobwGXnRXrI0jVEez1oj_jwJRHl4a7mko-BcxJA9DLk-hQH7dagBQtsu3_l6d-HEDcFkPnK6rlKotGAF1k6mzBwIQ2VGTvGRcGntK4_75B4P16BQ'
    const result = await jwt.verify(token)

    expect(result).toBe(true)
  })

  it('should be able to verify false', async () => {
    const token = 'eyJhbGciOiJ33SUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXNzd29yZCI6IjI0ODNhZDk0OTAzOWM0Zjg2M2NlM2U3NGQzMDRjZWU3YTM3M2Q2ZTViMDQzZDhmNTEyYjVlZGY3YjQzN2ZmNGU0NmU5ZDFmNDA2ODMzMDM3YzkyY2NiNjRjYmViZjgyZGI4NmI1M2RjOTc1MTA1NDc5MThlOTk1ZTUzMWFhM2Y0IiwiZW1haWwiOiJiZDhmQGVtYWlsLmNvbSIsImlkIjoiYWQ1NjkzOTktZjllNi00NDBhLWE5M2EtYWZkNGUwNjcxODYyIiwibG9naW5BdHRlbXB0cyI6MSwic2FsdCI6InNhbXBsZS1rZXkifQ==.u7tGiMX0YPuE72j6NiBkpSI0pfWAfOFzhF3AEb2E8mCLJ_3WTXDC2IXevFqlI1kl5E5YVfZiRfe3oyKYFRJNqD8QFOszZq-HYI1Ilpkli52dMs2GtgElSMdeAqdT86VUuDjrFvLRIB8FOAStKe6KqxWFXYXi696RVLCFCl97VQeDp9hKSQVAX0BEsYYa_PRYHtYK8p_JZ_EwytPghob0Jc-FoSUJZNaom8_H8eyobwGXnRXrI0jVEez1oj_jwJRHl4a7mko-BcxJA9DLk-hQH7dagBQtsu3_l6d-HEDcFkPnK6rlKotGAF1k6mzBwIQ2VGTvGRcGntK4_75B4P16BQ'
    const result = await jwt.verify(token)

    expect(result).toBe(false)
  })
})