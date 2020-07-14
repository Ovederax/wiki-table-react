export default class WikiItemEditRequest {
    public pageid: number;
    public title: string;
    public snippet: string;

    constructor(pageid:number, title: string, snippet: string) {
        this.pageid = pageid;
        this.title = title;
        this.snippet = snippet;
    }
}
