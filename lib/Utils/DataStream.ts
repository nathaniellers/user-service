import { Kinesis } from 'aws-sdk'
import Config from '../Constants/Config'

type DataStreamConstruct = {
  region?: string
  streamName: string
}

type PutRecordPayload = {
  partitionKey: string,
  payload: any
}

export default class DataStream {

  kinesis: Kinesis
  streamName: string

  constructor(config: DataStreamConstruct) {
    const { region, streamName } = config || {}
    const kinesisConfig = {
      apiVersion: '2013-12-02',
      region: region || Config.REGION
    }
    this.streamName = streamName || ''
    this.kinesis = new Kinesis(kinesisConfig)
  }

  public async putRecord(payload: PutRecordPayload) {
    const { streamName: StreamName } = this
    const { partitionKey: PartitionKey, payload: Data } = payload
    var params = {
      Data: JSON.stringify(Data),
      PartitionKey,
      StreamName,
    };
    
    const response = await this.kinesis.putRecord(params).promise()

    return response
  }
}
