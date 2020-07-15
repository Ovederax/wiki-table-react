

class Client {
    request(url: string, call: (obj: any) => void, obj: any, method: string) {
        let json = undefined;
        if(obj) {
            json = JSON.stringify(obj);
        }
        let requestInit: RequestInit = {
            body: json,
            credentials: undefined,
            headers: {
                "Content-Type": 'application/json'
            },
            method: method
        };
        let promise = fetch(url, requestInit);
        promise
            .then(response => response.json().then( obj => {
                    if (response.ok) {
                        return obj;
                    } else {
                        return Promise.reject({status: response.status, obj});
                    }
                }
            ))
            .then(obj => call(obj))
            .catch(error => console.log('error:', error));
    }

    get(url: string, call: (obj: any) => void, obj: any) {
        this.request(url, call, obj, "GET");
    }

    post(url: string, call: (obj: any) => void, obj: any) {
        this.request(url, call, obj, "POST");
    }

    delete(url: string, call: (obj: any) => void, obj: any) {
        this.request(url, call, obj, "DELETE");
    }

    put(url: string, call: (obj: any) => void, obj: any) {
        this.request(url, call, obj, "PUT");
    }
}

export default Client;
