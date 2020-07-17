

class Client {
    request(url: string, call: (obj: any) => void, obj: any, method: string) {
        let json;
        if(obj) {
            try {
                json = JSON.stringify(obj);
            } catch (error) {
                console.log(error);
                return;
            }
        }

        let requestInit: RequestInit = {
            body: json,
            headers: {
                'Content-Type': 'application/json'
            },
            method: method
        };
        let request = fetch(url, requestInit);
        request
            .then(response => {
                    if (response.ok) {
                        const contentType: string | null = response.headers.get('Content-Type');
                        if (contentType != null && contentType.includes('application/json')) {
                            return response.json();
                        }
                        return response.text();
                    }
                    return Promise.reject({status: response.status, obj});
                }
            )
            .then(obj => call(obj))
            .catch(error => console.log(error));
    }

    get(url: string, call: (obj: any) => void, obj: any) {
        this.request(url, call, obj, "GET");
    }

    post(url: string, call: (obj: any) => void, obj: any) {
        this.request(url, call, obj, 'POST');
    }

    delete(url: string, call: (obj: any) => void, obj: any) {
        this.request(url, call, obj, 'DELETE');
    }

    put(url: string, call: (obj: any) => void, obj: any) {
        this.request(url, call, obj, 'PUT');
    }
}

export default Client;
