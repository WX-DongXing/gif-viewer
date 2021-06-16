import { Extension, Gif, GifHandler, Header, ImageDescriptor, LogicalScreenDescriptor, RGB, SubImage, SubImageData } from './types';
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
     * @param imageDescriptor 图像描述符
     * @param graphicsControlExtension 图像控制扩展
     */
    decodeImageDataBuffer(bufferArray: Uint8Array, minCodeSize: number, colorTable: RGB[], imageDescriptor: ImageDescriptor, graphicsControlExtension?: Extension): ImageData;
    /**
     * 解码图像数据
     * @param arraybuffer
     * @param colorTable
     * @param imageDescriptor
     * @param graphicsControlExtension
     */
    decodeImageData(arraybuffer: ArrayBuffer, colorTable: RGB[], imageDescriptor: ImageDescriptor, graphicsControlExtension?: Extension): SubImageData;
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
