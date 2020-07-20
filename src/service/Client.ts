class Client {
    request(url: string, obj: any, method: string) : Promise<any> {
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

    get(url: string, obj: any) : Promise<any> {
        return this.request(url, obj, "GET");
    }

    post(url: string, obj: any) : Promise<any> {
        return this.request(url, obj, 'POST');
    }

    delete(url: string, obj: any) : Promise<any> {
        return this.request(url, obj, 'DELETE');
    }

    put(url: string, obj: any) : Promise<any> {
        return this.request(url, obj, 'PUT');
    }
}

export default Client;
