import { APIGatewayProxyHandler, APIGatewayEvent, Context } from 'aws-lambda';
import StatusCode from '../Http/StatusCode'
import ApiResponse from '../Response/ApiResponse'
import Result from '../Response/Result'

export type EventParam = { event: APIGatewayEvent, context: Context }
export type FnHandler = (event: EventParam) => Promise<Result>

export default function Handler(fnHandler: FnHandler): APIGatewayProxyHandler {
  return async (event: APIGatewayEvent, context: Context) => {
    console.log(`Event: ${JSON.stringify(event)}`)
    console.log(`Context: ${JSON.stringify(context)}`)
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    }
    const statusCode = StatusCode.OK

    try {
      const result = await fnHandler({ event: eventParser(event), context })
      console.log({ result }, null, 2)

      return new ApiResponse({
        headers,
        statusCode: result.statusCode || statusCode,
        body: JSON.stringify(result),
      })
    } catch (e) {
      console.log(`[exception] Exception: ${e.message || e}`)
      console.log({ exception: e }, null, 2)

      return new ApiResponse({
        headers,
        statusCode: StatusCode.InternalServerError,
        body: JSON.stringify(new Result({
          success: false,
          message: e.message,
        })),
      })
    }
  }
}

function eventParser(event: APIGatewayEvent) {
  try {
    if (event && event.body) {
      return {
        ...event,
        body: JSON.parse(event.body)
      }
    }
  } catch (e) {
    // ignore for now
  }
  return event
}