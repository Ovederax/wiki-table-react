export default interface WikipediaResponse {
    batchcomplete: string | undefined;

    continue: {
        sroffset: number,
        continue: string
    } | undefined;

    query: {
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
    } | undefined;
}
