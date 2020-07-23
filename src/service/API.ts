import Client from './Client';
import {createWikiItem, WikiItem} from '../entity/WikiItem';
import PageResponse from '../dto/response/PageResponse';
import WikiItemEditRequest from '../dto/request/WikiItemEditRequest';
import WikiItemCreateRequest from '../dto/request/WikiItemCreateRequest';
import WikipediaResponse from '../dto/response/WikipediaResponse';
import {ResponseStatus} from '../dto/response/ResponseStatus';

const wikipedia_url = 'http://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srsearch=';
const my_wiki_url = 'https://127.0.0.1:5001/api/wiki/';

export default class API {
    private static getURL(useWikipedia: boolean) {
        if(useWikipedia) {
            return wikipedia_url;
        } else {
            return my_wiki_url;
        }
    }

    static search(text: string, page:number, pageSize:number, useWikipedia: boolean) : Promise<PageResponse<WikiItem>> {
        const url = API.getURL(useWikipedia);
        if ( text === undefined || (useWikipedia && text.trim() === '')) {
            return new Promise<PageResponse<WikiItem>>((resolve)=>{
                resolve({page:0, content: [], pageSize:0, totalItems:0, totalPages:0});
            });
        }
        if(useWikipedia) {
            return this.searchOnWikipedia(text, page, pageSize);
        } else {
            return API.searchOnServer(text, page, pageSize);
        }
    }

    private static searchOnWikipedia(text: string, page:number, limit:number) : Promise<PageResponse<WikiItem>> {
        const promise = Client.get(wikipedia_url + text);
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

    private static searchOnServer(text: string, page:number, pageSize:number) : Promise<PageResponse<WikiItem>> {
        const params = `?page=${page}&pageSize=${pageSize}`;
        return Client.get(my_wiki_url + text + params, undefined);
    }

    static addWikiItem(it: WikiItem, useWikipedia: boolean) : Promise<ResponseStatus> {
        if(useWikipedia) {
            return Promise.reject('Wikipedia no support this operation');
        }
        const requestBody: WikiItemCreateRequest = {title: it.title, snippet: it.snippet};
        return Client.post(my_wiki_url, requestBody);
    }

    static editWikiItem(it: WikiItem, useWikipedia: boolean) : Promise<ResponseStatus> {
        if(useWikipedia) {
            return Promise.reject('Wikipedia no support this operation');
        }
        const requestBody: WikiItemEditRequest = {
            pageid: it.pageid,
            title: it.title,
            snippet: it.snippet
        };
        return Client.put(my_wiki_url, requestBody);
    }

    static deleteWikiItemById(id: number, useWikipedia: boolean) : Promise<ResponseStatus> {
        if(useWikipedia) {
            return Promise.reject('Wikipedia no support this operation');
        }
        return Client.delete(my_wiki_url + id,undefined);
    }
}
