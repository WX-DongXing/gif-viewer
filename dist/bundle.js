
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.gifViewer = factory());
}(this, (function () { 'use strict';

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __spreadArray(to, from) {
        for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
            to[j] = from[i];
        return to;
    }

    // GIF 版本
    var GIF_VERSION;
    (function (GIF_VERSION) {
        GIF_VERSION["GIF87a"] = "GIF87a";
        GIF_VERSION["GIF89a"] = "GIF89a";
    })(GIF_VERSION || (GIF_VERSION = {}));
    // 扩展类型
    var EXTENSION_TYPE;
    (function (EXTENSION_TYPE) {
        EXTENSION_TYPE[EXTENSION_TYPE["graphics_control"] = 0] = "graphics_control";
        EXTENSION_TYPE[EXTENSION_TYPE["plain_text"] = 1] = "plain_text";
        EXTENSION_TYPE[EXTENSION_TYPE["application"] = 2] = "application";
        EXTENSION_TYPE[EXTENSION_TYPE["comment"] = 3] = "comment";
    })(EXTENSION_TYPE || (EXTENSION_TYPE = {}));
    // 头部字节长度
    var HEADER_BYTE_LENGTH = 6;
    // 屏幕逻辑描述符字节长度
    var LOGICAL_SCREEN_DESCRIPTOR_BYTE_LENGTH = 13;
    // 扩展标识
    var EXTENSION_FLAG = 33;
    // 图像控制扩展标识
    var GRAPHICS_CONTROL_EXTENSION_FLAG = 249;
    // 文本扩展标识
    var PLAIN_TEXT_EXTENSION_FLAG = 1;
    // 应用扩展标识
    var APPLICATION_EXTENSION_FLAG = 255;
    // 注释扩展标识
    var COMMENT_EXTENSION_FLAG = 254;

    /**
     * 判断是否为 Gif 格式文件
     * @param version 文件头
     */
    function isGif(version) {
        return Object.keys(GIF_VERSION).includes(version);
    }
    /**
     * 十进制转八位二进制数组
     * @param value 十进制值
     */
    function decimalToBinary(value) {
        var binaryArray = value.toString(2).split('').map(function (bs) { return parseInt(bs); });
        return __spreadArray(__spreadArray([], new Array(8 - binaryArray.length).fill(0)), binaryArray);
    }
    /**
     * 格式化数据颜色
     * @param colorArray
     */
    function formatColors(colorArray) {
        return colorArray.reduce(function (acc, cur, index) {
            var i = index % 3;
            switch (i) {
                case 0:
                    acc.push({ r: cur, g: 0, b: 0 });
                    break;
                case 1:
                    Object.assign(acc[acc.length - 1], { g: cur });
                    break;
                case 2:
                    Object.assign(acc[acc.length - 1], { b: cur });
                    break;
            }
            return acc;
        }, []);
    }

    /**
     * 图形控制扩展解码器
     * @param buffer
     */
    function graphicsControlExtensionDecoder(buffer) {
        var dataView = new DataView(buffer);
        // 扩展标志（1字节） + 扩展类型标志（1字节）+ 字节数量（1字节） + 结尾标识（1字节）
        var byteLength = dataView.getUint8(2) + 4;
        // 打包字段
        var packedField = dataView.getUint8(3);
        // 解析打包字段
        var fieldBinary = decimalToBinary(packedField);
        // 保留字段
        var reserved = parseInt(fieldBinary.slice(0, 3).join(''));
        // 处置方法
        var disposalMethod = parseInt(fieldBinary.slice(3, 6).join(''));
        // 用户输入标识
        var userInputFlag = fieldBinary[6];
        // 透明颜色标识
        var transparentColorFlag = fieldBinary[7];
        // 延时时间
        var delayTime = dataView.getUint16(4);
        // 透明颜色索引
        var transparentColorIndex = dataView.getUint8(6);
        return {
            name: 'graphics control extension',
            type: EXTENSION_TYPE.graphics_control,
            byteLength: byteLength,
            packedField: {
                reserved: reserved,
                disposalMethod: disposalMethod,
                userInputFlag: userInputFlag,
                transparentColorFlag: transparentColorFlag
            },
            delayTime: delayTime,
            transparentColorIndex: transparentColorIndex
        };
    }

    /**
     * 扩展工厂函数
     */
    var ExtensionFactory = /** @class */ (function () {
        function ExtensionFactory() {
        }
        ExtensionFactory.create = function (extensionFlag) {
            switch (extensionFlag) {
                case GRAPHICS_CONTROL_EXTENSION_FLAG:
                    return graphicsControlExtensionDecoder;
                case PLAIN_TEXT_EXTENSION_FLAG:
                    return;
                case APPLICATION_EXTENSION_FLAG:
                    return;
                case COMMENT_EXTENSION_FLAG:
                    return;
            }
        };
        return ExtensionFactory;
    }());

    /**
     * 解析逻辑屏幕描述符
     * @param arrayBuffer
     */
    function decodeLogicalScreenDescriptor(arrayBuffer) {
        // 创建数据视图
        var dataView = new DataView(arrayBuffer);
        // 以低字节序读取两个字节为宽
        var width = dataView.getUint16(0, true);
        // 以低字节序读取两个字节为高
        var height = dataView.getUint16(2, true);
        // 获取打包字段
        var packedField = dataView.getUint8(4);
        // 解析打包字段
        var fieldBinary = decimalToBinary(packedField);
        // 全局颜色表标识
        var globalColorTableFlag = Boolean(fieldBinary[0]);
        // 颜色分辨率
        var colorResolution = parseInt(fieldBinary.slice(1, 4).join(''), 2);
        // 排序标志，可忽略这个标识
        var sortFlag = fieldBinary[4];
        // 全局颜色表大小
        var globalColorTableSize = parseInt(fieldBinary.slice(5, 8).join(''), 2) + 1;
        // 背景颜色索引
        var backgroundColorIndex = dataView.getUint8(5);
        // 像素宽高比
        var pixelAspectRatio = dataView.getUint8(6);
        return {
            width: width,
            height: height,
            packedField: {
                globalColorTableFlag: globalColorTableFlag,
                colorResolution: colorResolution,
                sortFlag: sortFlag,
                globalColorTableSize: globalColorTableSize
            },
            backgroundColorIndex: backgroundColorIndex,
            pixelAspectRatio: pixelAspectRatio
        };
    }
    /**
     * 解析子图像组数据
     * @param subImageBuffer
     */
    function decodeSubImages(subImageBuffer) {
        var subDataView = new DataView(subImageBuffer);
        // 读取第一个字节判断标识
        var flag = subDataView.getUint8(0);
        // 如果是描述符标识则解析描述符
        if (flag === EXTENSION_FLAG) {
            // 扩展标识后一个字节判断扩展类型
            var extensionFlag = subDataView.getUint8(1);
            var extensionDecoder = ExtensionFactory.create(extensionFlag);
            var extension = extensionDecoder(subImageBuffer);
            console.log(extension);
        }
    }
    /**
     * 解码器
     * @param blob 图像数据
     */
    function decoder(blob) {
        return __awaiter(this, void 0, void 0, function () {
            var arrayBuffer, headerBuffer, decoder, version, logicalScreenBuffer, logicalScreeDescriptor, _a, globalColorTableFlag, globalColorTableSize, parsedByteLength, globalColorTableLength, globalColorTableBuffer, subImageBuffer;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, blob.arrayBuffer()
                        // 文件类型 6 个字节
                    ];
                    case 1:
                        arrayBuffer = _b.sent();
                        headerBuffer = arrayBuffer.slice(0, HEADER_BYTE_LENGTH);
                        decoder = new TextDecoder('utf8');
                        version = decoder.decode(headerBuffer);
                        if (!isGif(version)) {
                            return [2 /*return*/, console.error('Not Gif!')];
                        }
                        logicalScreenBuffer = arrayBuffer.slice(HEADER_BYTE_LENGTH, LOGICAL_SCREEN_DESCRIPTOR_BYTE_LENGTH);
                        logicalScreeDescriptor = decodeLogicalScreenDescriptor(logicalScreenBuffer);
                        _a = logicalScreeDescriptor.packedField, globalColorTableFlag = _a.globalColorTableFlag, globalColorTableSize = _a.globalColorTableSize;
                        parsedByteLength = LOGICAL_SCREEN_DESCRIPTOR_BYTE_LENGTH;
                        // 如果存在全局色彩表则进行解析
                        if (globalColorTableFlag) {
                            globalColorTableLength = 3 * Math.pow(2, globalColorTableSize);
                            parsedByteLength = LOGICAL_SCREEN_DESCRIPTOR_BYTE_LENGTH + globalColorTableLength;
                            globalColorTableBuffer = arrayBuffer.slice(LOGICAL_SCREEN_DESCRIPTOR_BYTE_LENGTH, parsedByteLength);
                            formatColors(new Uint8Array(globalColorTableBuffer));
                        }
                        subImageBuffer = arrayBuffer.slice(parsedByteLength, arrayBuffer.byteLength - 1);
                        decodeSubImages(subImageBuffer);
                        return [2 /*return*/];
                }
            });
        });
    }
    var index = { decoder: decoder };

    return index;

})));
