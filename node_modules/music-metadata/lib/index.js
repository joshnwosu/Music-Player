"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Path = require("path");
const strtok3 = require("strtok3");
const Core = require("./core");
const MetadataCollector_1 = require("./common/MetadataCollector");
const ParserFactory_1 = require("./ParserFactory");
/**
 * Parse audio from Node Stream.Readable
 * @param {Stream.Readable} Stream to read the audio track from
 * @param {string} mimeType Content specification MIME-type, e.g.: 'audio/mpeg'
 * @param {IOptions} options Parsing options
 * @returns {Promise<IAudioMetadata>}
 */
function parseStream(stream, mimeType, options = {}) {
    return strtok3.fromStream(stream).then(tokenizer => {
        return Core.parseFromTokenizer(tokenizer, mimeType, options);
    });
}
exports.parseStream = parseStream;
/**
 * Parse audio from Node Buffer
 * @param {Stream.Readable} stream Audio input stream
 * @param {string} mimeType <string> Content specification MIME-type, e.g.: 'audio/mpeg'
 * @param {IOptions} options Parsing options
 * @returns {Promise<IAudioMetadata>}
 * Ref: https://github.com/Borewit/strtok3/blob/e6938c81ff685074d5eb3064a11c0b03ca934c1d/src/index.ts#L15
 */
exports.parseBuffer = Core.parseBuffer;
/**
 * Parse audio from Node file
 * @param {string} filePath Media file to read meta-data from
 * @param {IOptions} options Parsing options
 * @returns {Promise<IAudioMetadata>}
 */
function parseFile(filePath, options = {}) {
    return strtok3.fromFile(filePath).then(fileTokenizer => {
        const parserName = ParserFactory_1.ParserFactory.getParserIdForExtension(filePath);
        if (parserName) {
            return ParserFactory_1.ParserFactory.loadParser(parserName, options).then(parser => {
                const metadata = new MetadataCollector_1.MetadataCollector(options);
                return parser.init(metadata, fileTokenizer, options).parse().then(() => {
                    return fileTokenizer.close().then(() => {
                        return metadata.toCommonMetadata();
                    });
                }).catch(err => {
                    return fileTokenizer.close().then(() => {
                        throw err;
                    });
                });
            });
        }
        else {
            throw new Error('No parser found for extension: ' + Path.extname(filePath));
        }
    });
}
exports.parseFile = parseFile;
/**
 * Create a dictionary ordered by their tag id (key)
 * @param {ITag[]} nativeTags list of tags
 * @returns {INativeTagDict} Tags indexed by id
 */
exports.orderTags = Core.orderTags;
/**
 * Convert rating to 1-5 star rating
 * @param {number} rating Normalized rating [0..1] (common.rating[n].rating)
 * @returns {number} Number of stars: 1, 2, 3, 4 or 5 stars
 */
exports.ratingToStars = Core.ratingToStars;
