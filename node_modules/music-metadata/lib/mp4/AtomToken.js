"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Token = require("token-types");
const FourCC_1 = require("../common/FourCC");
const initDebug = require("debug");
const debug = initDebug('music-metadata:parser:MP4:atom');
exports.Header = {
    len: 8,
    get: (buf, off) => {
        const length = Token.UINT32_BE.get(buf, off);
        if (length < 0)
            throw new Error("Invalid atom header length");
        return {
            length,
            name: FourCC_1.FourCcToken.get(buf, off + 4)
        };
    },
    put: (buf, off, hdr) => {
        Token.UINT32_BE.put(buf, off, hdr.length);
        return FourCC_1.FourCcToken.put(buf, off + 4, hdr.name);
    }
};
/**
 * Ref: https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap1/qtff1.html#//apple_ref/doc/uid/TP40000939-CH203-38190
 */
exports.ExtendedSize = Token.UINT64_BE;
exports.ftyp = {
    len: 4,
    get: (buf, off) => {
        return {
            type: new Token.StringType(4, "ascii").get(buf, off)
        };
    }
};
/**
 * Token: Movie Header Atom
 */
exports.mhdr = {
    len: 8,
    get: (buf, off) => {
        return {
            version: Token.UINT8.get(buf, off + 0),
            flags: Token.UINT24_BE.get(buf, off + 1),
            nextItemID: Token.UINT32_BE.get(buf, off + 4)
        };
    }
};
/**
 * Base class for 'fixed' length atoms.
 * In some cases these atoms are longer then the sum of the described fields.
 * Issue: https://github.com/Borewit/music-metadata/issues/120
 */
class FixedLengthAtom {
    /**
     *
     * @param {number} len Length as specified in the size field
     * @param {number} expLen Total length of sum of specified fields in the standard
     */
    constructor(len, expLen, atomId) {
        this.len = len;
        if (len < expLen) {
            throw new Error(`Atom ${atomId} expected to be ${expLen}, but specifies ${len} bytes long.`);
        }
        else if (len > expLen) {
            debug(`Warning: atom ${atomId} expected to be ${expLen}, but was actually ${len} bytes long.`);
        }
    }
}
exports.FixedLengthAtom = FixedLengthAtom;
/**
 * Token: Media Header Atom
 * Ref:
 *   https://developer.apple.com/library/archive/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-SW34
 *   https://wiki.multimedia.cx/index.php/QuickTime_container#mdhd
 */
class MdhdAtom extends FixedLengthAtom {
    constructor(len) {
        super(len, 24, 'mdhd');
        this.len = len;
    }
    get(buf, off) {
        return {
            version: Token.UINT8.get(buf, off + 0),
            flags: Token.UINT24_BE.get(buf, off + 1),
            creationTime: Token.UINT32_BE.get(buf, off + 4),
            modificationTime: Token.UINT32_BE.get(buf, off + 8),
            timeScale: Token.UINT32_BE.get(buf, off + 12),
            duration: Token.UINT32_BE.get(buf, off + 16),
            language: Token.UINT16_BE.get(buf, off + 20),
            quality: Token.UINT16_BE.get(buf, off + 22)
        };
    }
}
exports.MdhdAtom = MdhdAtom;
/**
 * Token: Movie Header Atom
 */
class MvhdAtom extends FixedLengthAtom {
    constructor(len) {
        super(len, 100, 'mvhd');
        this.len = len;
    }
    get(buf, off) {
        return {
            version: Token.UINT8.get(buf, off + 0),
            flags: Token.UINT24_BE.get(buf, off + 1),
            creationTime: Token.UINT32_BE.get(buf, off + 4),
            modificationTime: Token.UINT32_BE.get(buf, off + 8),
            timeScale: Token.UINT32_BE.get(buf, off + 12),
            duration: Token.UINT32_BE.get(buf, off + 16),
            preferredRate: Token.UINT32_BE.get(buf, off + 20),
            preferredVolume: Token.UINT16_BE.get(buf, off + 24),
            // ignore reserver: 10 bytes
            // ignore matrix structure: 36 bytes
            previewTime: Token.UINT32_BE.get(buf, off + 72),
            previewDuration: Token.UINT32_BE.get(buf, off + 76),
            posterTime: Token.UINT32_BE.get(buf, off + 80),
            selectionTime: Token.UINT32_BE.get(buf, off + 84),
            selectionDuration: Token.UINT32_BE.get(buf, off + 88),
            currentTime: Token.UINT32_BE.get(buf, off + 92),
            nextTrackID: Token.UINT32_BE.get(buf, off + 96)
        };
    }
}
exports.MvhdAtom = MvhdAtom;
/**
 * Data Atom Structure
 */
class DataAtom {
    constructor(len) {
        this.len = len;
    }
    get(buf, off) {
        return {
            type: {
                set: Token.UINT8.get(buf, off + 0),
                type: Token.UINT24_BE.get(buf, off + 1)
            },
            locale: Token.UINT24_BE.get(buf, off + 4),
            value: new Token.BufferType(this.len - 8).get(buf, off + 8)
        };
    }
}
exports.DataAtom = DataAtom;
/**
 * Data Atom Structure
 * Ref: https://developer.apple.com/library/content/documentation/QuickTime/QTFF/Metadata/Metadata.html#//apple_ref/doc/uid/TP40000939-CH1-SW31
 */
class NameAtom {
    constructor(len) {
        this.len = len;
    }
    get(buf, off) {
        return {
            version: Token.UINT8.get(buf, off),
            flags: Token.UINT24_BE.get(buf, off + 1),
            name: new Token.StringType(this.len - 4, "utf-8").get(buf, off + 4)
        };
    }
}
exports.NameAtom = NameAtom;
/**
 * Track Header Atoms structure
 * Ref: https://developer.apple.com/library/content/documentation/QuickTime/QTFF/QTFFChap2/qtff2.html#//apple_ref/doc/uid/TP40000939-CH204-25550
 */
class TrackHeaderAtom {
    constructor(len) {
        this.len = len;
    }
    get(buf, off) {
        return {
            version: Token.UINT8.get(buf, off),
            flags: Token.UINT24_BE.get(buf, off + 1),
            creationTime: Token.UINT32_BE.get(buf, off + 4),
            modificationTime: Token.UINT32_BE.get(buf, off + 8),
            trackId: Token.UINT32_BE.get(buf, off + 12),
            // reserved 4 bytes
            duration: Token.UINT32_BE.get(buf, off + 20),
            layer: Token.UINT16_BE.get(buf, off + 24),
            alternateGroup: Token.UINT16_BE.get(buf, off + 26),
            volume: Token.UINT16_BE.get(buf, off + 28) // ToDo: fixed point
            // ToDo: add remaining fields
        };
    }
}
exports.TrackHeaderAtom = TrackHeaderAtom;
