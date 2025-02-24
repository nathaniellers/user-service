
import DataStream from './DataStream'

type PutRecordPayload = {
  subject: string
  templateName: string
  to: string
  dynamicTemplateData: {
    fullName: string
    supportEmail: string
  }
}

export default class AddNewUserStream {

  dataStream: DataStream

  constructor() {
    this.dataStream = new DataStream({
      streamName: 'create-new-user-stream',
    })
  }

  public async putRecord(payload: PutRecordPayload) {
    const response = await this.dataStream.putRecord({
      partitionKey: 'user',
      payload,
    })
    return response
  }
}
