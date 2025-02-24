import Handler, { EventParam } from '../../lib/Lambda/Handler'
import Result from '../../lib/Response/Result'
import setProfileImage from '.'
import StatusCode from '../../lib/Http/StatusCode'

export const handler = Handler(async ({ event }: EventParam) => {
  const { queryStringParameters, headers, body } = event
  const { email } = queryStringParameters
  const contentType = headers['content-type']

  let result: any
  
  try {
    result = await setProfileImage({
      email,
      contentType,
      image: body,
    })
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
