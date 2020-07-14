import {WikiItem} from "../entity/WikiItem";

class Client {
    xhttp: XMLHttpRequest;

    constructor() {
        this.xhttp = new XMLHttpRequest();
    }

    makeUrl(url: string) {
        return "http://localhost:8080" + url;
    }

    request(url: string, call: (obj: any) => void, obj: any, method: string) {
        let xhttp = this.xhttp;
        let header = "application/json";
        xhttp.open(method, url, true);
        xhttp.setRequestHeader('Content-Type', header);
        //xhttp.withCredentials = true;

        xhttp.onload = function () {
            let obj = JSON.parse(xhttp.responseText);
            if(obj.errors) {
                console.log(xhttp.responseText);
            }
            call( obj )
        };

        if(obj !== undefined) {
            xhttp.send(JSON.stringify(obj));
        } else {
            xhttp.send();
        }
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
