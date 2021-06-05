// GIF 版本
enum GIF_VERSION {
  GIF87a = 'GIF87a',
  GIF89a = 'GIF89a'
}

// 头部字节长度
const HEADER_BYTE_LENGTH = 6

// 屏幕逻辑描述符字节长度
const LOGICAL_SCREEN_DESCRIPTOR_BYTE_LENGTH = 13

export {
  GIF_VERSION,
  HEADER_BYTE_LENGTH,
  LOGICAL_SCREEN_DESCRIPTOR_BYTE_LENGTH
}
