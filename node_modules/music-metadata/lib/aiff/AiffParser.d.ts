import { BasicParser } from "../common/BasicParser";
import * as Chunk from "./Chunk";
/**
 * AIFF - Audio Interchange File Format
 *
 * Ref:
 *  http://www.onicos.com/staff/iz/formats/aiff.html
 *  http://muratnkonar.com/aiff/index.html
 *  http://www-mmsp.ece.mcgill.ca/Documents/AudioFormats/AIFF/AIFF.html
 */
export declare class AIFFParser extends BasicParser {
    private isCompressed;
    parse(): Promise<void>;
    readChunk(): Promise<void>;
    readData(header: Chunk.IChunkHeader): Promise<number>;
}
