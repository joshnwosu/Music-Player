"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const initDebug = require("debug");
const Speex = require("./Speex");
const VorbisParser_1 = require("../vorbis/VorbisParser");
const debug = initDebug('music-metadata:parser:ogg:speex');
/**
 * Speex, RFC 5574
 * Ref:
 *   https://www.speex.org/docs/manual/speex-manual/
 *   https://tools.ietf.org/html/rfc5574
 */
class SpeexParser extends VorbisParser_1.VorbisParser {
    constructor(metadata, options, tokenizer) {
        super(metadata, options);
        this.tokenizer = tokenizer;
        this.codecName = 'Speex';
        this.lastPos = -1;
    }
    /**
     * Parse first Speex Ogg page
     * @param {IPageHeader} header
     * @param {Buffer} pageData
     */
    parseFirstPage(header, pageData) {
        debug('First Ogg/Speex page');
        let speexHeader = Speex.Header.get(pageData, 0);
        speexHeader = speexHeader;
        this.metadata.setFormat('numberOfChannels', speexHeader.nb_channels);
        this.metadata.setFormat('sampleRate', speexHeader.rate);
        this.metadata.setFormat('encoder', speexHeader.version);
        if (speexHeader.bitrate !== -1) {
            this.metadata.setFormat('bitrate', speexHeader.bitrate);
        }
    }
}
exports.SpeexParser = SpeexParser;
