import { EXTENSION_TYPE } from './constant';
interface Buffer {
    byteLength: number;
    arrayBuffer: ArrayBuffer;
}
interface Header extends Buffer {
    version: string;
}
interface LogicalPackedField {
    globalColorTableFlag: number;
    colorResolution: number;
    sortFlag: number;
    globalColorTableSize: number;
}
interface LogicalScreenDescriptor extends Buffer {
    width: number;
    height: number;
    packedField: LogicalPackedField;
    backgroundColorIndex: number;
    pixelAspectRatio: number;
}
interface RGB {
    r: number;
    g: number;
    b: number;
}
interface RGBA extends RGB {
    a: number;
}
interface ColorTable extends Buffer {
    colors: RGB[];
}
interface ExtensionPackedField {
    reserved?: number;
    disposalMethod?: number;
    userInputFlag?: number;
    transparentColorFlag?: number;
}
interface Application {
    version: string;
    from?: number;
    to?: number;
    data?: ArrayBuffer;
    identifier?: string;
    authentication?: string;
}
interface Extension extends Buffer {
    name: string;
    type: EXTENSION_TYPE;
    packedField?: ExtensionPackedField;
    delayTime?: number;
    transparentColorIndex?: number;
    comment?: string;
    application?: Application;
}
interface ImageData {
    byteLength: number;
    minCodeSize: number;
    ArrayBuffers: ArrayBuffer[];
    colors: RGBA[];
}
interface Image {
    graphicsControlExtension?: Extension;
    imageDescriptor?: ImageDescriptor;
    localColorTable?: ColorTable;
    imageData?: ImageData;
}
interface SubImage {
    byteLength: number;
    extensions?: Extension[];
    images?: Image[];
}
interface ImagePackedField {
    localColorTableFlag: number;
    interlaceFlag: number;
    sortFlag: number;
    reserved: number;
    localColorTableSize: number;
}
interface ImageDescriptor extends Buffer {
    left: number;
    top: number;
    width: number;
    height: number;
    packedField: ImagePackedField;
}
interface BufferConcat {
    buffer: Uint8Array;
    byteLength: number;
}
declare class Gif implements Buffer {
    byteLength: number;
    arrayBuffer: ArrayBuffer;
    header: Header | void;
    logicalScreenDescriptor: LogicalScreenDescriptor;
    globalColorTable: ColorTable;
    extensions?: Extension[];
    images: Image[];
    trailer: ArrayBuffer;
}
interface GifHandler {
    decode(file: Blob | ArrayBuffer | File): Promise<Gif | void>;
}
export { Gif, Header, GifHandler, LogicalScreenDescriptor, RGB, RGBA, ColorTable, Extension, SubImage, Image, Application, ImageDescriptor, ImageData, BufferConcat };
