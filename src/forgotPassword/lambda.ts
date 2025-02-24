import Handler, { EventParam } from '../../lib/Lambda/Handler'
import Result from '../../lib/Response/Result'
import forgotPassword from '.'
import StatusCode from '../../lib/Http/StatusCode'

export const handler = Handler(async ({ event }: EventParam) => {
  const { queryStringParameters } = event
  const { email } = queryStringParameters
  
  let result: any
  
  try {
    result = await forgotPassword({ email })
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
