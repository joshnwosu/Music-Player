"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Token = require("token-types");
const _debug = require("debug");
const Vorbis = require("./Vorbis");
const debug = _debug('music-metadata:parser:ogg:vorbis1');
/**
 * Vorbis 1 Parser.
 * Used by OggParser
 */
class VorbisParser {
    constructor(metadata, options) {
        this.metadata = metadata;
        this.options = options;
        this.codecName = 'Vorbis I';
        this.pageSegments = [];
    }
    /**
     * Vorbis 1 parser
     * @param header Ogg Page Header
     * @param pageData Page data
     */
    parsePage(header, pageData) {
        if (header.headerType.firstPage) {
            this.parseFirstPage(header, pageData);
        }
        else {
            if (header.headerType.continued) {
                if (this.pageSegments.length === 0) {
                    throw new Error("Cannot continue on previous page");
                }
                this.pageSegments.push(pageData);
            }
            if (header.headerType.lastPage || !header.headerType.continued) {
                // Flush page segments
                if (this.pageSegments.length > 0) {
                    const fullPage = Buffer.concat(this.pageSegments);
                    this.parseFullPage(fullPage);
                }
                // Reset page segments
                this.pageSegments = header.headerType.lastPage ? [] : [pageData];
            }
        }
        if (header.headerType.lastPage) {
            this.calculateDuration(header);
        }
    }
    flush() {
        this.parseFullPage(Buffer.concat(this.pageSegments));
    }
    /**
     * Parse first Ogg/Vorbis page
     * @param {IPageHeader} header
     * @param {Buffer} pageData
     */
    parseFirstPage(header, pageData) {
        debug("Parse first page");
        // Parse  Vorbis common header
        const commonHeader = Vorbis.CommonHeader.get(pageData, 0);
        if (commonHeader.vorbis !== 'vorbis')
            throw new Error('Metadata does not look like Vorbis');
        if (commonHeader.packetType === 1) {
            const idHeader = Vorbis.IdentificationHeader.get(pageData, Vorbis.CommonHeader.len);
            this.metadata.setFormat('sampleRate', idHeader.sampleRate);
            this.metadata.setFormat('bitrate', idHeader.bitrateNominal);
            this.metadata.setFormat('numberOfChannels', idHeader.channelMode);
            debug("sample-rate=%s[hz], bitrate=%s[b/s], channel-mode=%s", idHeader.sampleRate, idHeader.bitrateNominal, idHeader.channelMode);
        }
        else
            throw new Error('First Ogg page should be type 1: the identification header');
    }
    parseFullPage(pageData) {
        // New page
        const commonHeader = Vorbis.CommonHeader.get(pageData, 0);
        debug("Parse full page: type=%s, byteLength=%s", commonHeader.packetType, pageData.byteLength);
        switch (commonHeader.packetType) {
            case 3: //  type 3: comment header
                return this.parseUserCommentList(pageData, Vorbis.CommonHeader.len);
            case 1: // type 1: the identification header
            case 5: // type 5: setup header type
                break; // ignore
        }
    }
    calculateDuration(header) {
        if (this.metadata.format.sampleRate && header.absoluteGranulePosition >= 0) {
            // Calculate duration
            this.metadata.setFormat('numberOfSamples', header.absoluteGranulePosition);
            this.metadata.setFormat('duration', this.metadata.format.numberOfSamples / this.metadata.format.sampleRate);
        }
    }
    /**
     * Ref: https://xiph.org/vorbis/doc/Vorbis_I_spec.html#x1-840005.2
     * @returns {Promise<number>}
     */
    parseUserCommentList(pageData, offset) {
        const strLen = Token.UINT32_LE.get(pageData, offset);
        offset += 4;
        const vendorString = new Token.StringType(strLen, 'utf-8').get(pageData, offset);
        offset += strLen;
        let userCommentListLength = Token.UINT32_LE.get(pageData, offset);
        offset += 4;
        while (userCommentListLength-- > 0) {
            offset += this.parseUserComment(pageData, offset);
        }
    }
    parseUserComment(pageData, offset) {
        const strLen = Token.UINT32_LE.get(pageData, offset);
        const v = new Token.StringType(strLen, 'utf-8').get(pageData, offset + 4);
        const idx = v.indexOf('=');
        const key = v.slice(0, idx).toUpperCase();
        let value = v.slice(idx + 1);
        if (key === 'METADATA_BLOCK_PICTURE') {
            value = this.options.skipCovers ? null : Vorbis.VorbisPictureToken.fromBase64(value);
        }
        if (value !== null) {
            debug("Push tag: id=%s, value=%s", key, value);
            this.metadata.addTag('vorbis', key, value);
        }
        return Token.UINT32_LE.len + strLen;
    }
}
exports.VorbisParser = VorbisParser;
