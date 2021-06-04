import { isGif } from './utils'
import { Gif, LogicalScreenDescriptor } from './types';

function getLogicalScreen (arrayBuffer: ArrayBuffer): LogicalScreenDescriptor | void {
  const dataView = new DataView(arrayBuffer)

  console.log(new Uint8Array(arrayBuffer))
  const width: number = dataView.getUint16(1)
  const height: number = dataView.getUint16(2)

  return {
    width,
    height
  }
}

async function decoder (blob: Blob): Promise<Gif | void> {

  const arrayBuffer: ArrayBuffer = await blob.arrayBuffer()

  // 文件类型 6 个字节
  const headerBuffer: ArrayBuffer = arrayBuffer.slice(0, 6)

  const decoder: TextDecoder = new TextDecoder('utf8')

  // gif version
  const version = decoder.decode(headerBuffer)

  if (!isGif(version)) {
    return console.error('Not Gif!')
  }

  // 逻辑屏幕描述数据 7 个字节
  const logicalScreenBuffer = arrayBuffer.slice(6, 13)

  const logicalScreeDescriptor = getLogicalScreen(logicalScreenBuffer)

  console.log(logicalScreeDescriptor)
}

export default { decoder }
