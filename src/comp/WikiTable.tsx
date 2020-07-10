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

    constructor(props: any) {
        super(props);
        this.inputRef = createRef();

        this.state = new WikiTableState([
            new WikiItem(1, '1', '1', '1')
        ]);
    }


    onSearch = (event: React.MouseEvent<HTMLElement>) => {
        let self = this;
        if(this.inputRef && this.inputRef.current) {
            let text:string = this.inputRef.current.value;
            new API().search(text, function (data: WikiResponse) {
                console.log(data);
                // @ts-ignore
                const out: WikiItem[] = data.query.search.map((it => {
                    return new WikiItem(it.pageid, it.title, it.snippet, it.timestamp);
                }));
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
        }
        this.setState({});
    };

    onClickRight = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        this.page++;
        if (this.page > this.allPageCount) {
            this.page = this.allPageCount;
        }
        this.setState({});
    };

    render(): any {
        let wikiTable: React.ReactElement[] = [];
        let pagination: React.ReactElement = (<div/>);
        if(this.state.data.length) {
            let pagination_page = "Страница " + this.page + " из " + this.allPageCount;
            pagination = (
                <div className="pagination">
                    <a className="btn left_pagination" onClick={this.onClickLeft}>
                        Назад
                    </a>
                    <div className="pagination__page">
                        {pagination_page}
                    </div>
                    <a className="btn right_pagination" onClick={this.onClickRight}>
                        Далее
                    </a>
                </div>);
            wikiTable = this.state.data
                .slice((this.page-1)*this.lengthOfPage, this.page*this.lengthOfPage)
                .map(function (it) {
                return (
                    <tr>
                        <td>{it.pageid}</td>
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
                    <div className="wiki_search">
                        <input type="text" ref={this.inputRef} />
                        <button className="btn" onClick={this.onSearch}>Искать</button>
                    </div>

                    <table className="wiki_table">
                        <thead>
                        <tr>
                            <td>Номер страницы</td>
                            <td>Заголовок</td>
                            <td>Превью</td>
                            <td>Время</td>
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
