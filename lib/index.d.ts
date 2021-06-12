import { Gif, GifHandler, Header, ImageData, ImageDescriptor, LogicalScreenDescriptor, RGB, RGBA, SubImage } from './types';
declare class GifViewer implements GifHandler {
    gif: Gif;
    constructor();
    /**
     * 解码头部信息，判断是否为GIF格式
     * @param arrayBuffer
     */
    decodeHeader(arrayBuffer: ArrayBuffer): Header | void;
    /**
     * 解码逻辑屏幕描述符
     * @param arrayBuffer
     */
    decodeLogicalScreenDescriptor(arrayBuffer: ArrayBuffer): LogicalScreenDescriptor;
    /**
     * 解码图像描述符
     * @param arrayBuffer
     */
    decodeImageDescriptor(arrayBuffer: ArrayBuffer): ImageDescriptor;
    /**
     * 解码图像数据
     * @param bufferArray 图像数据
     * @param minCodeSize 最小代码尺度
     * @param colorTable 本地或全局色彩表
     * @param transparentColorIndex 透明颜色索引
     */
    decodeImageDataBuffer(bufferArray: Uint8Array, minCodeSize: number, colorTable: RGB[], transparentColorIndex: number): RGBA[];
    /**
     * 解码图像数据
     * @param arraybuffer
     * @param colorTable
     * @param transparentColorIndex
     */
    decodeImageData(arraybuffer: ArrayBuffer, colorTable: RGB[], transparentColorIndex: number): ImageData;
    /**
     * 解析子图像组数据
     * @param subImageBuffer
     */
    decodeSubImages(subImageBuffer: ArrayBuffer): SubImage;
    /**
     * 解码GIF
     * @param file
     */
    decode(file: Blob | ArrayBuffer | File): Promise<Gif | void>;
}
export default GifViewer;
