import React, {createRef, RefObject} from 'react';
import './WikiTable.scss';
import API from "../service/API";
import {WikiResponse} from "../response/WikiResponse";
import {WikiItem} from "../entity/WikiItem";

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

    inputRef : RefObject<HTMLInputElement>;
    apiRef : RefObject<HTMLInputElement>;

    constructor(props: any) {
        super(props);
        this.inputRef = createRef();
        this.apiRef = createRef();

        this.state = new WikiTableState([
            new WikiItem(1, 'Test title', '<div></div>', '2010-10-10T10:10Z')
        ]);
    }


    onSearch = (event: React.MouseEvent<HTMLElement>) => {
        let self = this;
        if(this.inputRef && this.inputRef.current &&
            this.apiRef && this.apiRef.current ) {
            let useWikipedia = this.apiRef.current.checked;
            let text:string = this.inputRef.current.value;
            new API(useWikipedia).search(text, function (out: WikiItem[]) {
                console.log(out);

                if (out.length > 0) {
                    self.page = 1;
                    self.allPageCount = Math.ceil(out.length / self.lengthOfPage);
                }
                self.setState({
                    data: out
                });

            })
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
    render(): any {
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
            let disableLeft = this.page === 1? " disabled": "";
            let disableRight = this.page === this.allPageCount? " disabled": "";
            pagination = (
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
                </ul>);
            wikiTable = this.state.data
                .slice((this.page-1)*this.lengthOfPage, this.page*this.lengthOfPage)
                .map(function (it) {
                return (
                    <tr>
                        <td scope="row">{it.pageid}</td>
                        <td>{it.title}</td>
                        <td>{it.snippet}</td>
                        <td>{it.timestamp}</td>
                    </tr>
                )
            })
        }

        return (
            <div className="container">
                <div className="content">
                    <div className="wiki__options">
                        <div className="wiki__options__item">
                            <div><input type="checkbox" ref={this.apiRef}/></div>
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
