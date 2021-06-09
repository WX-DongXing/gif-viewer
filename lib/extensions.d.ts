import { Extension } from './types';
/**
 * 图形控制扩展解码器
 * @param buffer
 * @param offset
 */
declare function graphicsControlExtensionDecoder(buffer: ArrayBuffer, offset: number): Extension;
/**
 * 应用扩展解码器
 * @param buffer
 * @param offset
 */
declare function applicationExtensionDecoder(buffer: ArrayBuffer, offset: number): Extension;
/**
 * 文本扩展解码器
 * @param buffer
 * @param offset
 */
declare function plainTextExtensionDecoder(buffer: ArrayBuffer, offset: number): Extension;
/**
 * 注释扩展解码器
 * @param buffer
 * @param offset
 */
declare function commentExtensionDecoder(buffer: ArrayBuffer, offset: number): Extension;
export { graphicsControlExtensionDecoder, applicationExtensionDecoder, plainTextExtensionDecoder, commentExtensionDecoder };
