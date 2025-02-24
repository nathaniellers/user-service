
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

export default class ResendForgotPasswordStream {

  dataStream: DataStream

  constructor() {
    this.dataStream = new DataStream({
      streamName: 'resend-forgot-password-stream',
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
