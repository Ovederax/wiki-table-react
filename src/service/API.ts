import Client from './Client';
import {createWikiItem, WikiItem} from '../entity/WikiItem';
import PageResponse from '../dto/response/PageResponse';
import WikiItemEditRequest from '../dto/request/WikiItemEditRequest';
import WikiItemCreateRequest from '../dto/request/WikiItemCreateRequest';
import WikipediaResponse from '../dto/response/WikipediaResponse';


export default class API {
    private client: Client;
    private url: string;
    private useWikipedia: boolean;

    constructor(useWikipedia: boolean) {
        this.client = new Client();
        this.useWikipedia = useWikipedia;

        if(useWikipedia) {
            this.url = 'http://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srsearch=';
        } else {
            this.url = 'https://127.0.0.1:5001/api/wiki/';
        }
    }

    search(text: string, page:number, limit:number, callback: (obj: PageResponse<WikiItem>)=>void) {
        if ( text === undefined || (this.useWikipedia && text.trim() === "")) {
            callback({page:0, content: [], pageSize:0, totalItems:0, totalPages:0});
            return;
        }
        if(this.useWikipedia) {
            this.searchOnWikipedia(text, page, limit, callback);
        } else {
            this.searchOnServer(text, page, limit, callback);
        }
    }

    private searchOnWikipedia(text: string, page:number, limit:number, callback: (obj: PageResponse<WikiItem>) => void) {
        this.client.get(this.url + text, function (data: WikipediaResponse) {
            if(!data?.query) {
                return;
            }
            const out: WikiItem[] = data.query.search.map((it => {
                return createWikiItem(it.pageid, it.title, it.snippet, it.timestamp);
            }));
            callback({page:0, content: out, pageSize:1, totalPages:1, totalItems:out.length});
        }, undefined);
    }

    private  searchOnServer(text: string, page:number, pageSize:number, callback: (obj: PageResponse<WikiItem>)=>void) {
        let params = `?page=${page}&pageSize=${pageSize}`;

        this.client.get(this.url + text + params, function (data: PageResponse<WikiItem>) {
            callback(data);
        }, undefined);
    }

    addWikiItem(it: WikiItem, callback: ()=>void) {
        if(this.useWikipedia) {
            alert('Wikipedia no support this operation');
            return;
        }
        const requestBody: WikiItemCreateRequest = {title: it.title, snippet: it.snippet};
        this.client.post(this.url, callback, requestBody)
    }

    editWikiItem(it: WikiItem, callback: ()=>void) {
        if(this.useWikipedia) {
            alert('Wikipedia no support this operation');
            return;
        }
        const requestBody: WikiItemEditRequest = {
            pageid: it.pageid,
            title: it.title,
            snippet: it.snippet
        };
        this.client.put(this.url, callback, requestBody);
    }

    deleteById(id: number, callback: ()=>void) {
        if(this.useWikipedia) {
            alert('Wikipedia no support this operation');
            return;
        }
        this.client.delete(this.url + id, callback, undefined)
    }
}
