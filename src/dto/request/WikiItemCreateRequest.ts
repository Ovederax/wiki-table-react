export default class WikiItemCreateRequest {
    public title: string;
    public snippet: string;

    constructor(title: string, snippet: string) {
        this.title = title;
        this.snippet = snippet;
    }
}
