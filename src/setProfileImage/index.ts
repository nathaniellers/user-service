import Config from '../../lib/Constants/Config'
import DDBUser from '../../lib/DB/DDBUser'
import FileManager from '../../lib/Utils/FileManager'

type UserProfileImage = {
  email: string
  contentType: string
  image: any
}

export default async function setProfileImage(user: UserProfileImage) {
  const { email, contentType, image } = user
  const fm = new FileManager()
  const [, fileExtension] = contentType.split('/')
  const bucket = Config.SENDWELL_PROFILE_IMAGES
  const key = `${email}.${fileExtension}`

  const addFileResult = await fm.addFile({
    bucket,
    key,
    body: Buffer.from(image, 'base64'),
    contentType,
  })
  const ddbUser = new DDBUser()
  const setUserProfileResult = await ddbUser.setUserProfileImg({
    email,
    s3Bucket: bucket,
    s3Key: key,
  })

  return {
    addFileResult,
    setUserProfileResult,
  }
}
