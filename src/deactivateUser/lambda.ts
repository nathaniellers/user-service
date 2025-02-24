import Handler, { EventParam } from '../../lib/Lambda/Handler'
import Result from '../../lib/Response/Result'
import deactivateUser from '.'
import StatusCode from '../../lib/Http/StatusCode'

export const handler = Handler(async ({ event }: EventParam) => {
  const { queryStringParameters } = event
  let result: any
  
  try {
    result = await deactivateUser(queryStringParameters)
  } catch (e) {
    return new Result({
      statusCode: StatusCode.BadRequest,
      success: false,
      message: e.message,
    })
  }

  return new Result({
    success: true,
    data: null,
  })
})
