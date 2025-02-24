import { S3 } from 'aws-sdk'

type File = {
  bucket: string
  key: string
  body: Buffer,
  contentType: string
  // contentEncoding: string
}

type FileDir = {
  bucket: string
  key: string
}

export default class FileManager {

  s3: S3
  
  constructor() {
    this.s3 = new S3()
  }

  public async addFile(file: File) {
    const {
      body: Body,
      bucket: Bucket,
      key: Key,
      contentType: ContentType,
      // contentEncoding: ContentEncoding,
    } = file
   
    return this.s3.putObject({
      Bucket,
      Key,
      Body,
      ContentType,
      // ContentEncoding,
    }).promise()
  }

  public async getFile(dir: FileDir) {
    const {
      bucket: Bucket,
      key: Key,
    } = dir
    
    const { $response } = await this.s3.getObject({
      Bucket,
      Key,
    }).promise()
    
    return $response.data
  }
}