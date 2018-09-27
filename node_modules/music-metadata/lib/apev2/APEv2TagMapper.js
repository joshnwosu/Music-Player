"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GenericTagMapper_1 = require("../common/GenericTagMapper");
/**
 * ID3v2.2 tag mappings
 */
const apev2TagMap = {
    Title: 'title',
    Artist: 'artist',
    Artists: 'artists',
    'Album Artist': 'albumartist',
    Album: 'album',
    Year: 'date',
    Originalyear: 'originalyear',
    Originaldate: 'originaldate',
    Comment: 'comment',
    Track: 'track',
    Disc: 'disk',
    DISCNUMBER: 'disk',
    Genre: 'genre',
    'Cover Art (Front)': 'picture',
    'Cover Art (Back)': 'picture',
    Composer: 'composer',
    Lyrics: 'lyrics',
    ALBUMSORT: 'albumsort',
    TITLESORT: 'titlesort',
    WORK: 'work',
    ARTISTSORT: 'artistsort',
    ALBUMARTISTSORT: 'albumartistsort',
    COMPOSERSORT: 'composersort',
    Lyricist: 'lyricist',
    Writer: 'writer',
    Conductor: 'conductor',
    // 'Performer=artist (instrument)': 'performer:instrument',
    MixArtist: 'remixer',
    Arranger: 'arranger',
    Engineer: 'engineer',
    Producer: 'producer',
    DJMixer: 'djmixer',
    Mixer: 'mixer',
    Label: 'label',
    Grouping: 'grouping',
    Subtitle: 'subtitle',
    DiscSubtitle: 'discsubtitle',
    Compilation: 'compilation',
    BPM: 'bpm',
    Mood: 'mood',
    Media: 'media',
    CatalogNumber: 'catalognumber',
    MUSICBRAINZ_ALBUMSTATUS: 'releasestatus',
    MUSICBRAINZ_ALBUMTYPE: 'releasetype',
    RELEASECOUNTRY: 'releasecountry',
    Script: 'script',
    Language: 'language',
    Copyright: 'copyright',
    LICENSE: 'license',
    EncodedBy: 'encodedby',
    EncoderSettings: 'encodersettings',
    Barcode: 'barcode',
    ISRC: 'isrc',
    ASIN: 'asin',
    musicbrainz_trackid: 'musicbrainz_recordingid',
    musicbrainz_releasetrackid: 'musicbrainz_trackid',
    MUSICBRAINZ_ALBUMID: 'musicbrainz_albumid',
    MUSICBRAINZ_ARTISTID: 'musicbrainz_artistid',
    MUSICBRAINZ_ALBUMARTISTID: 'musicbrainz_albumartistid',
    MUSICBRAINZ_RELEASEGROUPID: 'musicbrainz_releasegroupid',
    MUSICBRAINZ_WORKID: 'musicbrainz_workid',
    MUSICBRAINZ_TRMID: 'musicbrainz_trmid',
    MUSICBRAINZ_DISCID: 'musicbrainz_discid',
    Acoustid_Id: 'acoustid_id',
    ACOUSTID_FINGERPRINT: 'acoustid_fingerprint',
    MUSICIP_PUID: 'musicip_puid',
    Weblink: 'website'
};
class APEv2TagMapper extends GenericTagMapper_1.CommonTagMapper {
    constructor() {
        const upperCaseMap = {};
        for (const tag in apev2TagMap) {
            upperCaseMap[tag.toUpperCase()] = apev2TagMap[tag];
        }
        super(['APEv2'], upperCaseMap);
    }
    /**
     * @tag  Native header tag
     * @return common tag name (alias)
     */
    getCommonName(tag) {
        return this.tagMap[tag.toUpperCase()];
    }
}
exports.APEv2TagMapper = APEv2TagMapper;
