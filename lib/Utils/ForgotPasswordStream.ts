
import DataStream from './DataStream'

type PutRecordPayload = {
  subject: string
  templateName: string
  to: string
  dynamicTemplateData: {
    fullName: string
    expireMinutes: number
    devEmail: string
    otp: string
  }
}

export default class ForgotPasswordStream {

  dataStream: DataStream

  constructor() {
    this.dataStream = new DataStream({
      streamName: 'forgot-password-stream',
    })
  }

  public async putRecord(payload: PutRecordPayload) {
    const response = await this.dataStream.putRecord({
      partitionKey: 'user-otp',
      payload,
    })
    return response
  }
}
