import Handler, { EventParam } from '../../lib/Lambda/Handler'
import Result from '../../lib/Response/Result'

import StatusCode from '../../lib/Http/StatusCode'
import verifyTotp, { verifyTotpSchema } from '.'

export const handler = Handler(async ({ event }: EventParam) => {
  const { body } = event
  const { Authorization } = event.headers
  const [, jwt] = Authorization.split("Bearer ")
  const param = verifyTotpSchema.validateSync({
    jwtToken: jwt,
    token: body.token,
  })
  
  let result: any
  
  try {
    result = await verifyTotp(param)
  } catch (e) {
    return new Result({
      statusCode: StatusCode.BadRequest,
      success: false,
      message: e.message,
    })
  }

  return new Result({
    statusCode: StatusCode.OK,
    success: true,
    data: result,
  })
})

