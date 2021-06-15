import {Application, Extension} from './types'
import {
  EXTENSION_TYPE,
  APPLICATION_END_FLAG,
  APPLICATION_NETSCAPE,
  PLAIN_TEXT_END_FLAG
} from './constant'
import { decimalToBinary } from './utils'

/**
 * 图形控制扩展解码器
 * @param buffer
 * @param offset
 */
function graphicsControlExtensionDecoder (buffer: ArrayBuffer, offset: number): Extension {
  // 创建数据视图
  const dataView: DataView = new DataView(buffer, offset)

  // 扩展标志（1字节） + 扩展类型标志（1字节）+ 字节数量（1字节） + 结尾标识（1字节）
  const byteLength = dataView.getUint8(2) + 4

  // 打包字段
  const packedField: number = dataView.getUint8(3)

  // 解析打包字段
  const fieldBinary: number[] = decimalToBinary(packedField)

  // 保留字段
  const reserved: number = parseInt(fieldBinary.slice(0, 3).join(''), 2)

  // 处置方法
  const disposalMethod: number = parseInt(fieldBinary.slice(3, 6).join(''), 2)

  // 用户输入标识
  const userInputFlag: number = fieldBinary[6]

  // 透明颜色标识
  const transparentColorFlag: number = fieldBinary[7]

  // 延时时间
  const delayTime: number = dataView.getUint16(4, true)

  // 透明颜色索引
  const transparentColorIndex: number = dataView.getUint8(6)

  // 图形控制扩展数据
  const arrayBuffer: ArrayBuffer = buffer.slice(offset, offset + byteLength)

  return {
    name: 'graphics control extension',
    type: EXTENSION_TYPE.graphics_control,
    byteLength,
    arrayBuffer,
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
 * 应用扩展解码器
 * @param buffer
 * @param offset
 */
function applicationExtensionDecoder (buffer: ArrayBuffer, offset: number): Extension {
  let byteLength = 2

  // 创建数据视图
  const dataView: DataView = new DataView(buffer, offset)

  // 应用数据固定字节长度
  const applicationFixedByteLength = dataView.getUint8(byteLength)

  // 创建 ASCII 解码器
  const ASCIIDecoder: TextDecoder = new TextDecoder('utf8')

  // 应用扩展类型 3, 3 + 11
  const version = ASCIIDecoder.decode(buffer.slice(offset + (byteLength += 1), offset + (byteLength += applicationFixedByteLength)))

  // 应用程序标识
  const identifier = version.substring(0, 8)

  // 应用程序鉴别码
  const authentication = version.substring(8, 11)

  const application: Application = { version, data: [], identifier, authentication }

  // 应用数据
  let byte: number = dataView.getUint8(byteLength)

  while (byte !== APPLICATION_END_FLAG) {

    // 如果为 Netscape 2.0 应用扩展，三个字节
    if (version === APPLICATION_NETSCAPE) {

      // 第一个字节为1
      const from = dataView.getUint8(byteLength += 1)

      // 后两个字节为循环次数，0 为无限循环
      const to = dataView.getUint16(byteLength += 1, true)

      // 两个字节合并（1字节）+ 结尾字节（1字节）
      byteLength += 2

      Object.assign(application, { from, to })

    } else {
      application.data.push(buffer.slice(offset + (byteLength += 1), offset + (byteLength += byte)))
    }

    byte = dataView.getUint8(byteLength)
  }

  // real byteLength = index + 1 （1字节）
  byteLength += 1

  // 应用扩展数据
  const arrayBuffer: ArrayBuffer = buffer.slice(offset, offset + byteLength)

  return {
    name: 'application extension',
    type: EXTENSION_TYPE.application,
    byteLength,
    arrayBuffer,
    application
  }
}

/**
 * 文本扩展解码器
 * @param buffer
 * @param offset
 */
function plainTextExtensionDecoder (buffer: ArrayBuffer, offset: number): Extension {
  let byteLength = 2

  // 创建数据视图
  const dataView: DataView = new DataView(buffer, offset)

  // 文本数据字节长度
  let textBufferLength: number = dataView.getUint8(byteLength)

  while (textBufferLength !== PLAIN_TEXT_END_FLAG) {
    textBufferLength = dataView.getUint8(byteLength += textBufferLength + 1)
  }

  // real byteLength = index + 1 （1字节）
  byteLength += 1

  // 文本扩展数据
  const arrayBuffer: ArrayBuffer = buffer.slice(offset, offset + byteLength)

  return {
    name: 'comment extension',
    type: EXTENSION_TYPE.plain_text,
    byteLength,
    arrayBuffer
  }
}

/**
 * 注释扩展解码器
 * @param buffer
 * @param offset
 */
function commentExtensionDecoder (buffer: ArrayBuffer, offset: number): Extension {
  // 创建数据视图
  const dataView: DataView = new DataView(buffer, offset)

  // 注释数据字节长度
  let byteLength: number = dataView.getUint8(2)

  // 注释数据
  const commentBuffer: ArrayBuffer = buffer.slice(offset + 3, offset + (byteLength += 3))

  // 创建 ASCII 解码器
  const ASCIIDecoder: TextDecoder = new TextDecoder('utf8')

  // 注释内容
  const comment = ASCIIDecoder.decode(commentBuffer)

  // real byteLength = index + 1 （1字节）
  byteLength += 1

  // 注释扩展数据
  const arrayBuffer: ArrayBuffer = buffer.slice(offset, offset + byteLength)

  return {
    name: 'comment extension',
    type: EXTENSION_TYPE.comment,
    byteLength,
    arrayBuffer,
    comment
  }
}

export {
  graphicsControlExtensionDecoder,
  applicationExtensionDecoder,
  plainTextExtensionDecoder,
  commentExtensionDecoder
}
