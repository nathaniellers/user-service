
import StatusCode from '../Http/StatusCode'

export default class ApiResponse {

  statusCode?: number
  headers?: any
  body?: string

  constructor(params: ApiResponse) {
    const { statusCode, headers, body } = params
    this.statusCode = statusCode || statusCode
    this.headers = headers || {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
    }
    this.body = (() => {
      if (!body) {
        return ''
      }
      if (typeof body === 'string') {
        return body
      }
      return JSON.stringify(body)
    })()
  }
}
