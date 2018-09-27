import { IOptions, IAudioMetadata, ParserType } from "./type";
import { ITokenizer } from "strtok3/lib/type";
import { INativeMetadataCollector } from "./common/MetadataCollector";
export interface ITokenParser {
    /**
     * Initialize parser with output (metadata), input (tokenizer) & parsing options (options).
     * @param {INativeMetadataCollector} metadata Output
     * @param {ITokenizer} tokenizer Input
     * @param {IOptions} options Parsing options
     */
    init(metadata: INativeMetadataCollector, tokenizer: ITokenizer, options: IOptions): ITokenParser;
    /**
     * Parse audio track.
     * Called after init(...).
     * @returns {Promise<void>}
     */
    parse(): Promise<void>;
}
export declare class ParserFactory {
    /**
     *  Parse metadata from tokenizer
     * @param {ITokenizer} tokenizer
     * @param {string} contentType
     * @param {IOptions} opts
     * @returns {Promise<INativeAudioMetadata>}
     */
    static parse(tokenizer: ITokenizer, contentType: string, opts: any): Promise<IAudioMetadata>;
    /**
     * @param filePath Path, filename or extension to audio file
     * @return Parser sub-module name
     */
    static getParserIdForExtension(filePath: string): ParserType;
    static loadParser(moduleName: ParserType, options: IOptions): Promise<ITokenParser>;
    private static _parse;
    private static getExtension;
    /**
     * @param {string} mimeType MIME-Type, extension, path or filename
     * @returns {string} Parser sub-module name
     */
    private static getParserIdForMimeType;
    private warning;
}
