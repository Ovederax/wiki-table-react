import Client from './Client';
import {createWikiItem, WikiItem} from '../entity/WikiItem';
import PageResponse from '../dto/response/PageResponse';
import WikiItemEditRequest from '../dto/request/WikiItemEditRequest';
import WikiItemCreateRequest from '../dto/request/WikiItemCreateRequest';
import WikipediaResponse from '../dto/response/WikipediaResponse';
import {ResponseStatus} from '../dto/response/ResponseStatus';


export default class API {
    private client: Client;
    private url: string;
    private useWikipedia: boolean;

    constructor(useWikipedia: boolean, client: Client = new Client()) {
        this.client = client;
        this.useWikipedia = useWikipedia;

        if(useWikipedia) {
            this.url = 'http://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srsearch=';
        } else {
            this.url = 'https://127.0.0.1:5001/api/wiki/';
        }
    }

    search(text: string, page:number, pageSize:number) : Promise<PageResponse<WikiItem>> {
        if ( text === undefined || (this.useWikipedia && text.trim() === '')) {
            return new Promise<PageResponse<WikiItem>>((resolve)=>{
                resolve({page:0, content: [], pageSize:0, totalItems:0, totalPages:0});
            });
        }
        if(this.useWikipedia) {
            return this.searchOnWikipedia(text, page, pageSize);
        } else {
            return this.searchOnServer(text, page, pageSize);
        }
    }

    private searchOnWikipedia(text: string, page:number, limit:number) : Promise<PageResponse<WikiItem>> {
        const promise = this.client.get(this.url + text);
        return promise.then(value => {
            const data: WikipediaResponse = value as WikipediaResponse;
            if (!data?.query) {
                return Promise.reject('Bad response from wikipedia');
            }
            const output: WikiItem[] = data.query.search.map((it => {
                return createWikiItem(it.pageid, it.title, it.snippet, it.timestamp);
            }));
            return {page: 0, content: output, pageSize: 1, totalPages: 1, totalItems: output.length} as PageResponse<WikiItem>;
        });
    }

    private  searchOnServer(text: string, page:number, pageSize:number) : Promise<PageResponse<WikiItem>> {
        const params = `?page=${page}&pageSize=${pageSize}`;
        return this.client.get(this.url + text + params, undefined);
    }

    addWikiItem(it: WikiItem) : Promise<ResponseStatus> {
        if(this.useWikipedia) {
            return Promise.reject('Wikipedia no support this operation');
        }
        const requestBody: WikiItemCreateRequest = {title: it.title, snippet: it.snippet};
        return this.client.post(this.url, requestBody);
    }

    editWikiItem(it: WikiItem) : Promise<ResponseStatus> {
        if(this.useWikipedia) {
            return Promise.reject('Wikipedia no support this operation');
        }
        const requestBody: WikiItemEditRequest = {
            pageid: it.pageid,
            title: it.title,
            snippet: it.snippet
        };
        return this.client.put(this.url, requestBody);
    }

    deleteWikiItemById(id: number) : Promise<ResponseStatus> {
        if(this.useWikipedia) {
            return Promise.reject('Wikipedia no support this operation');
        }
        return this.client.delete(this.url + id,undefined);
    }
}
