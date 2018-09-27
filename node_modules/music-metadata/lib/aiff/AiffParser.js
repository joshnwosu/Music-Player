"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Token = require("token-types");
const stream_1 = require("stream");
const initDebug = require("debug");
const type_1 = require("strtok3/lib/type");
const strtok3 = require("strtok3/lib/core");
const ID3v2Parser_1 = require("../id3v2/ID3v2Parser");
const FourCC_1 = require("../common/FourCC");
const BasicParser_1 = require("../common/BasicParser");
const Chunk = require("./Chunk");
const debug = initDebug('music-metadata:parser:aiff');
/**
 * AIFF - Audio Interchange File Format
 *
 * Ref:
 *  http://www.onicos.com/staff/iz/formats/aiff.html
 *  http://muratnkonar.com/aiff/index.html
 *  http://www-mmsp.ece.mcgill.ca/Documents/AudioFormats/AIFF/AIFF.html
 */
class AIFFParser extends BasicParser_1.BasicParser {
    parse() {
        return this.tokenizer.readToken(Chunk.Header)
            .then(header => {
            if (header.chunkID !== 'FORM')
                throw new Error("Invalid Chunk-ID, expected 'FORM'"); // Not AIFF format
            return this.tokenizer.readToken(FourCC_1.FourCcToken).then(type => {
                switch (type) {
                    case 'AIFF':
                        this.metadata.setFormat('dataformat', type);
                        this.isCompressed = false;
                        break;
                    case 'AIFC':
                        this.metadata.setFormat('dataformat', 'AIFF-C');
                        this.isCompressed = true;
                        break;
                    default:
                        throw Error('Unsupported AIFF type: ' + type);
                }
                this.metadata.setFormat('lossless', !this.isCompressed);
            }).then(() => {
                return this.readChunk();
            });
        });
    }
    readChunk() {
        return this.tokenizer.readToken(Chunk.Header)
            .then(header => {
            debug(`Chunk id=${header.chunkID}`);
            const nextChunk = 2 * Math.round(header.size / 2);
            return this.readData(header).then(bytesread => {
                return this.tokenizer.ignore(nextChunk - bytesread);
            });
        })
            .then(() => this.readChunk())
            .catch(err => {
            if (err.message !== type_1.endOfFile) {
                throw err;
            }
        });
    }
    readData(header) {
        switch (header.chunkID) {
            case 'COMM': // The Common Chunk
                return this.tokenizer.readToken(new Chunk.Common(header, this.isCompressed))
                    .then(common => {
                    this.metadata.setFormat('bitsPerSample', common.sampleSize);
                    this.metadata.setFormat('sampleRate', common.sampleRate);
                    this.metadata.setFormat('numberOfChannels', common.numChannels);
                    this.metadata.setFormat('numberOfSamples', common.numSampleFrames);
                    this.metadata.setFormat('duration', common.numSampleFrames / common.sampleRate);
                    this.metadata.setFormat('encoder', common.compressionName);
                    return header.size;
                });
            case 'ID3 ': // ID3-meta-data
                return this.tokenizer.readToken(new Token.BufferType(header.size))
                    .then(id3_data => {
                    const id3stream = new ID3Stream(id3_data);
                    const rst = strtok3.fromStream(id3stream);
                    return ID3v2Parser_1.ID3v2Parser.getInstance().parse(this.metadata, rst, this.options).then(() => header.size);
                });
            case 'SSND': // Sound Data Chunk
                if (this.metadata.format.duration) {
                    this.metadata.setFormat('bitrate', 8 * header.size / this.metadata.format.duration);
                }
                return Promise.resolve(0);
            default:
                return Promise.resolve(0);
        }
    }
}
exports.AIFFParser = AIFFParser;
class ID3Stream extends stream_1.Readable {
    constructor(buf) {
        super();
        this.buf = buf;
    }
    _read() {
        this.push(this.buf);
        this.push(null); // push the EOF-signaling `null` chunk
    }
}
