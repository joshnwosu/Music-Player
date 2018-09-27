"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class BasicParser {
    constructor() {
        this.warnings = []; // ToDo: make these part of the parsing result
    }
    /**
     * Initialize parser with output (metadata), input (tokenizer) & parsing options (options).
     * @param {INativeMetadataCollector} metadata Output
     * @param {ITokenizer} tokenizer Input
     * @param {IOptions} options Parsing options
     */
    init(metadata, tokenizer, options) {
        this.metadata = metadata;
        this.tokenizer = tokenizer;
        this.options = options;
        return this;
    }
}
exports.BasicParser = BasicParser;
