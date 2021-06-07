import {
  GRAPHICS_CONTROL_EXTENSION_FLAG, PLAIN_TEXT_EXTENSION_FLAG, APPLICATION_EXTENSION_FLAG,
  COMMENT_EXTENSION_FLAG
} from './constant'

import { graphicsControlExtensionDecoder, commentExtensionDecoder } from './extensions'

/**
 * 扩展工厂函数
 */
class ExtensionFactory {
  static create(extensionFlag: number) {
    switch (extensionFlag) {
      case GRAPHICS_CONTROL_EXTENSION_FLAG:
        return graphicsControlExtensionDecoder
      case PLAIN_TEXT_EXTENSION_FLAG:
        return
      case APPLICATION_EXTENSION_FLAG:
        return
      case COMMENT_EXTENSION_FLAG:
        return commentExtensionDecoder
      default:
        break
    }
  }
}

export {
  ExtensionFactory
}
