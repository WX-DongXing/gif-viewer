import { GIF_VERSION } from './constant'
import { isGif } from './utils'

async function decoder (blob: Blob) {

  const arrayBuffer: ArrayBuffer = await blob.arrayBuffer()

  // 获取前6个字节判断文件类型
  const headerBuffer: ArrayBuffer = arrayBuffer.slice(0, 6)

  const decoder: TextDecoder = new TextDecoder('utf8')

  const fileType = decoder.decode(headerBuffer)

  if (!isGif(fileType)) {
    return console.error('Not Gif!')
  }
  console.log(fileType, GIF_VERSION.GIF89a === fileType)
}

export default { decoder }
