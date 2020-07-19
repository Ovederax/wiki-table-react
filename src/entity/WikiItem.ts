export interface WikiItem {
    pageid: number;
    title: string;
    snippet: string;
    timestamp: string;
}

export function createWikiItem(pageid: number, title: string, snippet: string, timestamp: string): WikiItem {
    return {
        pageid: pageid,
        title: title,
        snippet: snippet,
        timestamp: timestamp,
    };
}

export function getNormalDate(it: WikiItem) {
    // Format: yyyy-MM-ddThh:mm:ssZ
    let time = it.timestamp;

    let year = time.slice(0, 4);
    let month = time.slice(5, 7);
    let day = time.slice(8, 10);

    let hour = time.slice(11, 13);
    let minute = time.slice(14, 16);
    // let second = time.slice(17, 19);

    return `${hour}:${minute} ${day}-${month}-${year}`;
}
