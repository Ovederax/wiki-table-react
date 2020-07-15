import React, {createRef, RefObject} from 'react';
import './WikiTable.scss';
import API from '../service/API';
import {WikiItem} from '../entity/WikiItem';

class WikiTableState {
    data: WikiItem[];

    constructor(data: WikiItem[]) {
        this.data = data;
    }

}

class WikiTable extends React.Component<any, WikiTableState>{
    page = 1;
    allPageCount = 1;
    lengthOfPage = 3;
    numberOfLineToEdit = 0; // if (0) -> no edit line
    lastSearchedText: string = "";

    inputRef : RefObject<HTMLInputElement>;

    nameRef : RefObject<HTMLInputElement>;
    snippetRef : RefObject<HTMLInputElement>;

    editNameRef : RefObject<HTMLInputElement>;
    editSnippetRef : RefObject<HTMLInputElement>;

    useWiki: boolean = false;

    constructor(props: any) {
        super(props);
        this.inputRef = createRef();

        this.nameRef = createRef();
        this.snippetRef = createRef();

        this.editNameRef = createRef();
        this.editSnippetRef = createRef();

        this.state = new WikiTableState([]);
    }

    reloadData = (text: string) => {
        let self = this;
        this.numberOfLineToEdit = 0;
        let useWikipedia = this.useWiki;
        new API(useWikipedia).search(text, function (out: WikiItem[]) {
            console.log(out);

            if (out.length > 0) {
                self.allPageCount = Math.ceil(out.length / self.lengthOfPage);
            }
            self.setState({
                data: out
            });
        });
    };

    onSearch = (event: React.MouseEvent<HTMLElement>) => {
        if(this.inputRef && this.inputRef.current ) {
            let text:string = this.inputRef.current.value;
            this.lastSearchedText = text;
            this.page = 1;
            this.reloadData(text);
        }
    };

    onClickLeft = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        this.page--;
        if (this.page < 1) {
            this.page = 1;
            return; // no render
        }
        this.setState({});
    };

    onClickRight = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        this.page++;
        if (this.page > this.allPageCount) {
            this.page = this.allPageCount;
            return; // no render
        }
        this.setState({});
    };

    onClickDelete = (event: React.MouseEvent<HTMLElement>, id: number) => {
        let self = this;
        new API(this.useWiki).deleteById(id, function () {
            self.reloadData(self.lastSearchedText);
        });
    };

    onClickCreate = (event: React.MouseEvent<HTMLElement>) => {
        if(!this.nameRef || !this.nameRef.current || !this.snippetRef || !this.snippetRef.current) {
            return;
        }
        let self = this;
        let name:string = this.nameRef.current.value;
        let snipper:string = this.snippetRef.current.value;
        new API(this.useWiki).addWikiItem(new WikiItem(0, name, snipper, ""), function () {
            self.reloadData(self.lastSearchedText);
        });
    };

    onClickEdit = (event: React.MouseEvent<HTMLElement>, id: number) => {
        this.numberOfLineToEdit = id;
        this.setState({});
    };

    handleGoToPage = (event: React.MouseEvent<HTMLElement>, page: number) => {
        event.preventDefault();
        if(this.page === page) {
            return;
        }
        this.page = page;
        this.setState({});
    };

    makeHandler(data: any, callback: (event: React.MouseEvent<HTMLElement>, arg:any)=>any) {
        return function (event: React.MouseEvent<HTMLElement>) {
            callback(event, data);
        }
    }

    onClickCheckboxUseWiki = (event: React.MouseEvent<HTMLInputElement>) => {
        this.useWiki = event.currentTarget.checked;
    };

    onClickUpdateItem = (event: React.MouseEvent<HTMLElement>, it: WikiItem) => {
        if(!this.editNameRef || !this.editNameRef.current || !this.editSnippetRef || !this.editSnippetRef.current) {
            return;
        }
        let self = this;
        let name:string = this.editNameRef.current.value;
        let snipper:string = this.editSnippetRef.current.value;

        new API(this.useWiki).editWikiItem(new WikiItem(it.pageid, name, snipper, it.timestamp), function () {
            self.reloadData(self.lastSearchedText);
        })
    };

    returnLayoutForEditItem = (it: WikiItem) => {
        let self = this;
        return (<tr>
            <td scope="row">{it.pageid}</td>
            <td><input className="w-100" type="text" ref={self.editNameRef}/></td>
            <td><input className="w-100" type="text" ref={self.editSnippetRef}/></td>
            <td>{it.timestamp}</td>
            <td>
                <div className="mb-2">
                    <button className="btn btn-outline-danger w-100"
                            onClick={self.makeHandler(it, self.onClickUpdateItem )}>
                        Изменить
                    </button>
                </div>
                <button className="btn btn-outline-warning w-100"
                        onClick={() => {self.numberOfLineToEdit=0; self.setState({})}}>
                    Отменить
                </button>
            </td>
        </tr>);
    };

    returnLayoutForItemOfTable(it: WikiItem) {
        let self = this;
        return (
            <tr>
                <td scope="row">{it.pageid}</td>
                <td>{it.title}</td>
                <td>{it.snippet}</td>
                <td>{it.timestamp}</td>
                <td>
                    <div className="mb-2">
                        <button className="btn btn-outline-danger w-100"
                                onClick={self.makeHandler(it.pageid, self.onClickDelete )}>
                            Удалить
                        </button>
                    </div>
                    <button className="btn btn-outline-warning w-100"
                            onClick={self.makeHandler(it.pageid, self.onClickEdit )}>
                        Изменить
                    </button>
                </td>
            </tr>
        )
    }

    returnLayoutForPagination= (pages:React.ReactElement[]) => {
        let disableLeft = this.page === 1? " disabled": "";
        let disableRight = this.page === this.allPageCount? " disabled": "";
        return (
            <ul  className="pagination">
                <li className={"page-item"+ disableLeft}>
                    <a href="#" className="page-link" onClick={this.onClickLeft}>
                        Назад
                    </a>
                </li>
                {pages}
                <li className={"page-item" + disableRight}>
                    <a href="#" className="page-link" onClick={this.onClickRight}>
                        Далее
                    </a>
                </li>
            </ul>
        );
    };

    render(): any {
        let self = this;
        let wikiTable: React.ReactElement[] = [];
        let pagination: React.ReactElement = (<div/>);
        if(this.state.data.length) {
            let pages:React.ReactElement[] = [];
            for(let i=0; i<this.allPageCount; ++i) {
                let isDisabled:boolean = i+1 === this.page;
                pages.push(
                    <li className={isDisabled? "page-item disabled" : "page-item"}>
                        <a href="#" className="page-link"
                           onClick={this.makeHandler(i+1, this.handleGoToPage)}>
                            {i+1}
                        </a>
                    </li>
                );
            }

            pagination = self.returnLayoutForPagination(pages);

            wikiTable = this.state.data
                .slice((this.page-1)*this.lengthOfPage, this.page*this.lengthOfPage)
                .map(function (it, id) {
                    if(it.pageid === self.numberOfLineToEdit) {
                        return self.returnLayoutForEditItem(it);
                    }
                    return self.returnLayoutForItemOfTable(it);
            });

            wikiTable.push(<tr>
                <td scope="row">Новая статья:</td>
                <td><input className="w-100" type="text" ref={this.nameRef}/></td>
                <td><input className="w-100" type="text" ref={this.snippetRef}/></td>
                <td>-</td>
                <td>
                    <div className="mb-2">
                        <button className="btn btn-outline-primary w-100"
                                onClick={self.makeHandler(undefined, self.onClickCreate )}>
                            Создать
                        </button>
                    </div>
                </td>
            </tr>)
        }

        return (
            <div className="container">
                <div className="content">
                    <div className="wiki__options">
                        <div className="wiki__options__item">
                            <div><input type="checkbox" onClick={this.onClickCheckboxUseWiki} /></div>
                            <div>Использовать api wikipedia?</div>
                        </div>
                    </div>
                    <div className="wiki_search">
                        <input type="text" ref={this.inputRef} />
                        <button className="btn btn-outline-primary" onClick={this.onSearch}>Искать</button>
                    </div>

                    <table className="table table-bordered table-striped wiki_table">
                        <thead>
                        <tr>
                            <td scope="col" >Номер страницы</td>
                            <td scope="col" >Заголовок</td>
                            <td scope="col" >Превью</td>
                            <td scope="col" >Время</td>
                            <td scope="col" >Опции</td>
                        </tr>
                        </thead>
                        <tbody>
                            {wikiTable}
                        </tbody>
                    </table>
                    {pagination}
                </div>
            </div>

        );
    }
}

export default WikiTable;
