import Client from './Client';
import {WikiItem} from '../entity/WikiItem';
import {WikiResponse} from '../dto/response/WikiResponse';
import WikiItemEditRequest from '../dto/request/WikiItemEditRequest';
import WikiItemCreateRequest from '../dto/request/WikiItemCreateRequest';

export default class API {
    private client: Client;
    private url: string;
    private useWikipedia: boolean;

    constructor( useWikipedia: boolean) {
        this.client = new Client();
        this.useWikipedia = useWikipedia;

        if(useWikipedia) {
            this.url = "http://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srsearch=";
        } else {
            this.url = "https://127.0.0.1:5001/api/wiki/";
        }
    }

    search(text: string, callback: (obj: WikiItem[])=>void) {
        if ( text === undefined || (this.useWikipedia && text.trim() === "")) {
            callback([]);
            return;
        }

        this.client.get(this.url + text, function (data: WikiResponse) {
            if(!data || !data.query) {
                return;
            }
            const out: WikiItem[] = data.query.search.map((it => {
                return new WikiItem(it.pageid, it.title, it.snippet, it.timestamp);
            }));
            callback(out);
        }, undefined);
    }

    addWikiItem(it: WikiItem, callback: ()=>void) {
        if(this.useWikipedia) {
            alert("Wikipedia no support this operation");
            return;
        }

        this.client.post(this.url, callback, new WikiItemCreateRequest(it.title, it.snippet))
    }
    editWikiItem(it: WikiItem, callback: ()=>void) {
        if(this.useWikipedia) {
            alert("Wikipedia no support this operation");
            return;
        }
        this.client.put(this.url, callback, new WikiItemEditRequest(it.pageid, it.title, it.snippet));
    }

    deleteById(id: number, callback: ()=>void) {
        if(this.useWikipedia) {
            alert("Wikipedia no support this operation");
            return;
        }
        this.client.delete(this.url + id, callback, undefined)
    }
}
