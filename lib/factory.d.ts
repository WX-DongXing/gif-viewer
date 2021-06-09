import { graphicsControlExtensionDecoder } from './extensions';
/**
 * 扩展工厂函数
 */
declare class ExtensionFactory {
    static create(extensionFlag: number): typeof graphicsControlExtensionDecoder;
}
export { ExtensionFactory };
