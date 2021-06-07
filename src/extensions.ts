import { Extension } from './types'
import {APPLICATION_END_FLAG, APPLICATION_NETSCAPE, EXTENSION_TYPE, PLAIN_TEXT_END_FLAG} from './constant'
import { decimalToBinary } from './utils'

/**
 * 图形控制扩展解码器
 * @param arrayBuffer
 * @param offset
 */
function graphicsControlExtensionDecoder (arrayBuffer: ArrayBuffer, offset: number): Extension {
  // 创建数据视图
  const dataView: DataView = new DataView(arrayBuffer, offset)

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
 * 应用扩展解码器
 * @param arrayBuffer
 * @param offset
 */
function applicationExtensionDecoder (arrayBuffer: ArrayBuffer, offset: number): Extension {
  let byteLength = 2

  // 创建数据视图
  const dataView: DataView = new DataView(arrayBuffer, offset)

  // 应用数据固定字节长度
  const applicationFixedByteLength = dataView.getUint8(byteLength)

  // 创建 ASCII 解码器
  const ASCIIDecoder: TextDecoder = new TextDecoder('utf8')

  // 应用扩展类型
  const version = ASCIIDecoder.decode(arrayBuffer.slice(offset + byteLength + 1, offset + byteLength + 1 + applicationFixedByteLength))

  const application = { version, data: [] }

  byteLength += applicationFixedByteLength

  while (byteLength < arrayBuffer.byteLength) {
    // 应用数据长度
    const applicationByteLength: number = dataView.getUint8(byteLength += 1)

    if (applicationByteLength === APPLICATION_END_FLAG) break

    // 如果为 Netscape 2.0 应用扩展，三个字节
    if (version === APPLICATION_NETSCAPE) {

      // 第一个字节为1
      const from = dataView.getUint8(byteLength += 1)

      // 后两个字节为循环次数，0 为无限循环
      const to = dataView.getUint16(byteLength += 1, true)

      byteLength += 1

      Object.assign(application, { from, to })
    } else {
      application.data.push(arrayBuffer.slice(offset + byteLength, offset + (byteLength += applicationByteLength)))
    }
  }

  // 结束标识 （1字节）
  byteLength += 1

  return {
    name: 'application extension',
    type: EXTENSION_TYPE.application,
    byteLength,
    application
  }
}

/**
 * 文本扩展解码器
 * @param arrayBuffer
 * @param offset
 */
function plainTextExtensionDecoder (arrayBuffer: ArrayBuffer, offset: number): Extension {
  let byteLength = 1

  // 创建数据视图
  const dataView: DataView = new DataView(arrayBuffer, offset)

  while (byteLength < arrayBuffer.byteLength) {
    // 文本数据字节长度
    const textBufferLength: number = dataView.getUint8(byteLength += 1)

    if (textBufferLength === PLAIN_TEXT_END_FLAG) break
    byteLength += textBufferLength
  }

  // 结束标识（1字节）
  byteLength += 1

  return {
    name: 'comment extension',
    type: EXTENSION_TYPE.plain_text,
    byteLength
  }
}

/**
 * 注释扩展解码器
 * @param arrayBuffer
 * @param offset
 */
function commentExtensionDecoder (arrayBuffer: ArrayBuffer, offset: number): Extension {
  // 创建数据视图
  const dataView: DataView = new DataView(arrayBuffer, offset)

  // 注释数据字节长度
  let byteLength: number = dataView.getUint8(2)

  // 注释数据
  const commentBuffer: ArrayBuffer = arrayBuffer.slice(offset + 3, byteLength + offset + 3)

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
  applicationExtensionDecoder,
  plainTextExtensionDecoder,
  commentExtensionDecoder
}
