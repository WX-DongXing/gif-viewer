import { Extension } from './types'
import { EXTENSION_TYPE } from './constant'
import { decimalToBinary } from './utils'

/**
 * 图形控制扩展解码器
 * @param arrayBuffer
 */
function graphicsControlExtensionDecoder (arrayBuffer: ArrayBuffer): Extension {
  const dataView: DataView = new DataView(arrayBuffer)

  // 扩展标志（1字节） + 扩展类型标志（1字节）+ 字节数量（1字节） + 结尾标识（1字节）
  const byteLength = dataView.getUint8(2) + 4

  // 打包字段
  const packedField: number = dataView.getUint8(3)

  // 解析打包字段
  const fieldBinary: number[] = decimalToBinary(packedField)

  // 保留字段
  const reserved: number = parseInt(fieldBinary.slice(0, 3).join(''))

  // 处置方法
  const disposalMethod: number = parseInt(fieldBinary.slice(3, 6).join(''))

  // 用户输入标识
  const userInputFlag: number = fieldBinary[6]

  // 透明颜色标识
  const transparentColorFlag: number = fieldBinary[7]

  // 延时时间
  const delayTime: number = dataView.getUint16(4)

  // 透明颜色索引
  const transparentColorIndex: number = dataView.getUint8(6)

  return {
    name: 'graphics control extension',
    type: EXTENSION_TYPE.graphics_control,
    byteLength,
    packedField: {
      reserved,
      disposalMethod,
      userInputFlag,
      transparentColorFlag
    },
    delayTime,
    transparentColorIndex
  }
}

/**
 * 注释扩展解码器
 * @param arrayBuffer
 */
function commentExtensionDecoder (arrayBuffer: ArrayBuffer): Extension {

  const dataView: DataView = new DataView(arrayBuffer)

  // 注释数据字节长度
  let byteLength: number = dataView.getUint8(2)

  // 注释数据
  const commentBuffer: ArrayBuffer = arrayBuffer.slice(3, byteLength + 3)

  // 创建 ASCII 解码器
  const ASCIIDecoder: TextDecoder = new TextDecoder('utf8')

  // 注释内容
  const comment = ASCIIDecoder.decode(commentBuffer)

  // 扩展标志（1字节） + 扩展类型标志（1字节）+ 字节数量（1字节） + 结尾标识（1字节）
  byteLength += 4

  return {
    name: 'comment extension',
    type: EXTENSION_TYPE.comment,
    byteLength,
    comment
  }
}

export {
  graphicsControlExtensionDecoder,
  commentExtensionDecoder
}
