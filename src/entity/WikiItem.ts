export class WikiItem {
  pageid: number;
  title: string;
  snippet: string;
  timestamp: string;

  constructor(pageid: number, title: string, snippet: string, timestamp: string) {
    this.pageid = pageid;
    this.title = title;
    this.snippet = snippet;
    this.timestamp = timestamp;
  }
}
