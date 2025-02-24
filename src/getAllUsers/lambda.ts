import Handler, { EventParam } from '../../lib/Lambda/Handler'
import Result from '../../lib/Response/Result'

import getAllUsers, { ParamSchema } from '.'
import StatusCode from '../../lib/Http/StatusCode'

export const handler = Handler(async ({ event }: EventParam) => {
  const { queryStringParameters } = event
  const { keyword, limit, nextKey } = queryStringParameters

  const query = parserQueryParams({
    keyword,
    limit,
    nextKey,
  })
  const param = ParamSchema.validateSync(query)!
  
  let result: any
  
  try {
    result = await getAllUsers(param)
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

function parserQueryParams(queryStringParameters: any) {
  if (!queryStringParameters) {
    return {}
  }
  
  if (queryStringParameters && queryStringParameters.nextKey) {
    return {
      ...queryStringParameters,
      nextKey: JSON.parse(decodeURIComponent(queryStringParameters.nextKey)),
    }
  }

  return queryStringParameters
}
