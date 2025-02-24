import DDBUser from '../../lib/DB/DDBUser'
import { handler as getAllUsersHandler } from '../getAllUsers/lambda'

describe('getAllUsersLambda', () => {

  it('should be able to paginate using a next key', async () => {
    
    const event = {
      "resource": "/get",
      "path": "/get",
      "httpMethod": "GET",
      "headers": {
          "Accept": "*/*",
          "Accept-Encoding": "gzip, deflate, br",
          "CloudFront-Forwarded-Proto": "https",
          "CloudFront-Is-Desktop-Viewer": "true",
          "CloudFront-Is-Mobile-Viewer": "false",
          "CloudFront-Is-SmartTV-Viewer": "false",
          "CloudFront-Is-Tablet-Viewer": "false",
          "CloudFront-Viewer-Country": "PH",
          "content-type": "application/json",
          "Host": "f1gepkbslh.execute-api.us-east-2.amazonaws.com",
          "User-Agent": "Thunder Client (https://www.thunderclient.com)",
          "Via": "1.1 bd2a712c8280f0f57859c608168ce9f2.cloudfront.net (CloudFront)",
          "X-Amz-Cf-Id": "uTJarqw3Dw2jeImtFDP45eEuR4BNbui1KqLnm-2op0RrOTY71enP9A==",
          "X-Amzn-Trace-Id": "Root=1-626eb8d2-4e1653ca1cc00ed804edbaea",
          "X-Forwarded-For": "122.2.96.196, 64.252.136.141",
          "X-Forwarded-Port": "443",
          "X-Forwarded-Proto": "https"
      },
      "queryStringParameters": {
          "limit": 10,
          "nextKey": encodeURIComponent(JSON.stringify({
            "dataset": {
              "S": "user"
            },
            "sort": {
              "S": "john.doe@rsolve.co"
            }
          }))
      },
      "pathParameters": null,
      "stageVariables": null,
      "isBase64Encoded": false
    }

    const result = await getAllUsersHandler(event)

    expect(result).toBeTruthy()
  })

  it('should not show any data if keyword does not exist', async () => {
    const ddb = new DDBUser()
    const params = {
      limit: 10,
      keyword: "asdqwdasd"
    }

    const result = await ddb.searchByFullName(params)
    expect(result).toBeUndefined()
    
  })
})
