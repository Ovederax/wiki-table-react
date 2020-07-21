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

function appendLeadingZeroes(n: number){
    if(n <= 9){
        return "0" + n;
    }
    return n
}

export function getNormalDate(it: WikiItem) {
    // from api get data in format: yyyy-MM-ddThh:mm:ssZ
    const date = new Date(it.timestamp);
    return `${appendLeadingZeroes(date.getHours())}:`+
        `${appendLeadingZeroes(date.getMinutes())} `+
        `${appendLeadingZeroes(date.getDate())}-`+
        `${appendLeadingZeroes(date.getMonth()+1)}-`+
        `${date.getFullYear()}`;
}
