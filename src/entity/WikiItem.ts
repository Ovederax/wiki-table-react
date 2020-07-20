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
    const time = it.timestamp;

    const year = time.slice(0, 4);
    const month = time.slice(5, 7);
    const day = time.slice(8, 10);

    const hour = time.slice(11, 13);
    const minute = time.slice(14, 16);
    // let second = time.slice(17, 19);

    return `${hour}:${minute} ${day}-${month}-${year}`;
}
