import { object, string, InferType } from 'yup'
import Handler, { EventParam } from '../../lib/Lambda/Handler'
import Result from '../../lib/Response/Result'
import StatusCode from '../../lib/Http/StatusCode'
import resendForgotPassword from '.'

export const resendPasswordParam = object().shape({
  email: string().email().required(),
  subject: string().required()
}).noUnknown(true)

export const handler = Handler(async ({ event }: EventParam) => {
  const { queryStringParameters } = event
  const { email } = queryStringParameters
  const subject = { subject: 'Resend Forgot Password'}
  const _param = resendPasswordParam.validateSync({
    email,
    ...subject
  })
  
  let result: any
  
  try {
    result = await resendForgotPassword(_param)
  } catch (e) {
    return new Result({
      statusCode: StatusCode.BadRequest,
      success: false,
      message: e.message,
    })
  }

  return new Result({
    success: true,
    data: null
  })
})
