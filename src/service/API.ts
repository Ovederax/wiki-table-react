import Client from "./Client";

export default class API {
    private client: Client;
    constructor() {
        this.client = new Client();
    }

    search(text: string, callback: (obj:any)=>void) {
        if ( text === undefined || text.trim() === '' ) {
            callback([]);
            return;
        }
        const url = 'http://en.wikipedia.org/w/api.php?action=query&list=search&format=json&origin=*&srsearch=';
        this.client.get(url + text, callback, undefined);
    }
}
