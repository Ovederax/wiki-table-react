import Client from './Client';
import {WikiItem} from '../entity/WikiItem';
import {WikiResponse} from '../dto/response/WikiResponse';
import WikiItemEditRequest from '../dto/request/WikiItemEditRequest';
import WikiItemCreateRequest from '../dto/request/WikiItemCreateRequest';
import WikipediaResponse from "../dto/response/WikipediaResponse";

export default class API {
    private client: Client;
    private url: string;
    private useWikipedia: boolean;

    constructor( useWikipedia: boolean) {
        this.client = new Client();
        this.useWikipedia = useWikipedia;

        if(useWikipedia) {
            this.url = 'http://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srsearch=';
        } else {
            this.url = 'https://127.0.0.1:5001/api/wiki/';
        }
    }

    search(text: string, page:number, limit:number, lastPage:boolean, callback: (obj: WikiResponse)=>void) {
        if ( text === undefined || (this.useWikipedia && text.trim() === "")) {
            callback({page:0, search: [], allPageCount:0});
            return;
        }
        if(this.useWikipedia) {
            this.searchOnWikipedia(text, page, limit, lastPage, callback);
        } else {
            this.searchOnServer(text, page, limit, lastPage, callback);
        }
    }
    /* Код методов выглядит одинаково, но в дальнейшем его потребуется изменять еще */
    private searchOnWikipedia(text: string, page:number, limit:number, lastPage:boolean, callback: (obj: WikiResponse)=>void) {
        this.client.get(this.url + text, function (data: WikipediaResponse) {
            if(!data || !data.query) {
                return;
            }

            const out: WikiItem[] = data.query.search.map((it => {
                return new WikiItem(it.pageid, it.title, it.snippet, it.timestamp);
            }));
            callback({page:0, search: out, allPageCount:1});
        }, undefined);
    }

    private  searchOnServer(text: string, page:number, limit:number, lastPage:boolean, callback: (obj: WikiResponse)=>void) {
        let params = `?page=${page}&limit=${limit}&last=${lastPage}`;

        this.client.get(this.url + text + params, function (data: WikiResponse) {
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
