import Handler, { EventParam } from '../../lib/Lambda/Handler'
import Result from '../../lib/Response/Result'
import StatusCode from '../../lib/Http/StatusCode'
import regenerateTOTP, { ParamSchema } from '.'

export const handler = Handler(async ({ event }: EventParam) => {
  const { queryStringParameters } = event
  const param = ParamSchema.validateSync(queryStringParameters)
  let result: any
  
  try {
    result = await regenerateTOTP(param)
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

