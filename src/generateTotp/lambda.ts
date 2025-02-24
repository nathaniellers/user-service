import Handler, { EventParam } from '../../lib/Lambda/Handler'
import Result from '../../lib/Response/Result'

import StatusCode from '../../lib/Http/StatusCode'
import generateTotp from '.'
import { generateTotpParamSchema } from '../../lib/Utils/TOTPGenerator'

export const handler = Handler(async ({ event }: EventParam) => {
  const { body } = event
	let result: any
  
  try {
    result = await generateTotp(generateTotpParamSchema.validateSync(body))
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

