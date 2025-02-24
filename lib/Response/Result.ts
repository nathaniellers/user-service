import StatusCode from '../Http/StatusCode'

export default class Result<Data = any> {
  success: boolean
  message?: string
  data?: Data
  statusCode?: StatusCode

  constructor(params: Result<Data>) {
    const { success, message, data, statusCode } = params
    this.success = success
    this.message = message || ''
    this.data = data
    this.statusCode = statusCode
  }
}
