import {ResponseStatus} from '../dto/response/ResponseStatus';
import PageResponse from '../dto/response/PageResponse';
import {WikiItem} from '../entity/WikiItem';

class Client {
    request(url: string, method: string, obj?: object) : Promise<unknown> {
        let json;
        if(obj) {
            try {
                json = JSON.stringify(obj);
            } catch (error) {
                console.log(error);
                return Promise.reject("Fail to make json");
            }
        }

        const requestInit: RequestInit = {
            body: json,
            headers: {
                'Content-Type': 'application/json'
            },
            method: method
        };
        const request = fetch(url, requestInit);
        return request
            .then(response => {
                    if (response.ok) {
                        const contentType: string | null = response.headers.get('Content-Type');
                        if (contentType != null && contentType.includes('application/json')) {
                            return response.json();
                        }
                        return response.text();
                    }
                    return Promise.reject( "Response status is no ok");
                }
            )
            .catch((error) => {
                    console.log(error);
                    return Promise.reject(error.message);
                }
            );
    }

    get(url: string, obj?: object) : Promise<PageResponse<WikiItem>> {
        return this.request(url, "GET", obj) as Promise<PageResponse<WikiItem>>;
    }

    post(url: string, obj?: object) : Promise<ResponseStatus> {
        return this.request(url, 'POST', obj) as Promise<ResponseStatus>;
    }

    delete(url: string, obj?: object) : Promise<ResponseStatus> {
        return this.request(url, 'DELETE', obj) as Promise<ResponseStatus>;
    }

    put(url: string, obj?: object) : Promise<ResponseStatus> {
        return this.request(url, 'PUT', obj) as Promise<ResponseStatus>;
    }
}

export default Client;
