import Client from "./Client";
import {WikiItem} from "../entity/WikiItem";
import {WikiResponse} from "../response/WikiResponse";

export default class API {
    private client: Client;
    private url: string;

    constructor( useWikipedia: boolean) {
        this.client = new Client();

        if(useWikipedia) {
            this.url = 'http://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srsearch=';
        } else {
            this.url = 'https://127.0.0.1:5001/api/wiki/';
        }
    }

    search(text: string, callback: (obj: WikiItem[])=>void) {
        if ( text === undefined || text.trim() === '' ) {
            callback([]);
            return;
        }

        this.client.get(this.url + text, function (data: WikiResponse) {
            // @ts-ignore
            const out: WikiItem[] = data.query.search.map((it => {
                return new WikiItem(it.pageid, it.title, it.snippet, it.timestamp);
            }));
            callback(out);
        }, undefined);
    }
}
