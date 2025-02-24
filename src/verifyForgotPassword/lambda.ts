import Handler, { EventParam } from '../../lib/Lambda/Handler'
import Result from '../../lib/Response/Result'
import verifyForgotPassword, { VerifyForgotPWParamShape } from '.'
import StatusCode from '../../lib/Http/StatusCode'

export const handler = Handler(async ({ event }: EventParam) => {
  const { queryStringParameters, body } = event
  const { email } = queryStringParameters
  const param = VerifyForgotPWParamShape.validateSync({
    email,
    ...body,
  })!
  
  let result: any
  
  try {
    result = await verifyForgotPassword(param)
  } catch (e) {
    return new Result({
      statusCode: StatusCode.BadRequest,
      success: false,
      message: e.message,
    })
  }

  return new Result({
    success: true,
    data: result,
  })
})
