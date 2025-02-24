
enum StatusCode {
  // success
  OK = 200,
  Created = 201,
  Accepted = 202,
  NoContent = 204,
  ResetContent = 205,
  PartialContent = 206,
  
  // failed
  BadRequest = 400,
  Unauthorized = 401,
  PaymentRequired = 402,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  NotAcceptable = 406,

  // server error
  InternalServerError = 500,
  NotImplemented = 501,
  BadGateway = 502,
  ServerUnavailable = 503,
  GatewayTimeout = 504,
  HttpVersionNotSupported = 505,
  VariantAlsoNegotiates = 506,
  InsufficientStorage = 507,
  LoopDetected = 508,
  NotExtended = 510,
  NetworkAuthenticationRequired = 511,
}

export default StatusCode
