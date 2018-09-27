import { ITokenizer } from "strtok3/lib/type";
import * as AtomToken from "./AtomToken";
export declare type AtomDataHandler = (atom: Atom) => Promise<void>;
export declare class Atom {
    readonly header: AtomToken.IAtomHeader;
    extended: boolean;
    readonly parent: Atom;
    readonly children: Atom[];
    readonly atomPath: string;
    readonly dataLen: number;
    constructor(header: AtomToken.IAtomHeader, extended: boolean, parent: Atom);
    readAtoms(tokenizer: ITokenizer, dataHandler: AtomDataHandler, size: number): Promise<void>;
    private readAtom;
    private readData;
}
