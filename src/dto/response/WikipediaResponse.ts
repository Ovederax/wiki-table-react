export default interface WikipediaResponse {
    batchcomplete?: string;

    continue?: {
        sroffset: number,
        continue: string
    };

    query?: {
        searchinfo: {
            totalhits: number;
        };
        search: [{
            ns: number;
            title: string;
            pageid: number;
            size: number;
            wordcount: number;
            snippet: string;
            timestamp: string;
        }];
    };
}
