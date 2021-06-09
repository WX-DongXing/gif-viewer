import { Gif } from './types';
/**
 * 解码器
 * @param file 图像数据
 */
declare function decoder(file: Blob | ArrayBuffer | File): Promise<Gif | void>;
declare const _default: {
    decoder: typeof decoder;
    Gif: typeof Gif;
};
export default _default;
