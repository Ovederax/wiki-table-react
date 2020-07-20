import React, { createRef, RefObject } from 'react';
import './WikiTable.scss';
import API from '../service/API';
import { createWikiItem, getNormalDate, WikiItem } from '../entity/WikiItem';
import PageResponse from '../dto/response/PageResponse';

const INT32_MAX = 2147483647;
const LAST_PAGE = INT32_MAX;

class WikiTableState {
    data: WikiItem[];

    constructor(data: WikiItem[]) {
        this.data = data;
    }
}

class WikiTable extends React.Component<any, WikiTableState> {
    page = 1;
    allPageCount = 1;
    lengthOfPage = 4;
    numberOfLineToEdit = 0; // if (0) -> no edit line
    lastSearchedText: string = '';

    inputRef: RefObject<HTMLInputElement>;

    nameRef: RefObject<HTMLInputElement>;
    snippetRef: RefObject<HTMLInputElement>;

    editNameRef: RefObject<HTMLInputElement>;
    editSnippetRef: RefObject<HTMLTextAreaElement>;

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

    reloadData = (text: string, lastPage = false) => {
        let self = this;
        this.numberOfLineToEdit = 0;
        let useWikipedia = this.useWiki;
        let page = self.page - 1;
        if(lastPage) {
            page = LAST_PAGE;
        }

        new API(useWikipedia).search(text, page, self.lengthOfPage, function (out: PageResponse<WikiItem>) {
            self.allPageCount = out.totalPages;
            self.page = out.page + 1;
            let items: WikiItem[] = out.content.map((it) =>
                createWikiItem(it.pageid, it.title, it.snippet, it.timestamp)
            );
            if (self.nameRef?.current && self.snippetRef?.current) {
                self.nameRef.current.value = "";
                self.snippetRef.current.value = "";
            }
            self.setState({
                data: items,
            });
        });
    };

    onSearch = (event: React.MouseEvent<HTMLElement>) => {
        if (this.inputRef && this.inputRef.current) {
            let text: string = this.inputRef.current.value;
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
        this.reloadData(this.lastSearchedText);
    };

    onClickRight = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        this.page++;
        if (this.page > this.allPageCount) {
            this.page = this.allPageCount;
            return; // no render
        }
        this.reloadData(this.lastSearchedText);
    };

    onClickDelete = (event: React.MouseEvent<HTMLElement>, id: number) => {
        let self = this;
        new API(this.useWiki).deleteById(id, function () {
            self.reloadData(self.lastSearchedText);
        });
    };

    onClickCreate = (event: React.MouseEvent<HTMLElement>) => {
        if (!this.nameRef || !this.nameRef.current || !this.snippetRef || !this.snippetRef.current) {
            return;
        }
        let self = this;
        let name: string = this.nameRef.current.value;
        let snippet: string = this.snippetRef.current.value;

        new API(this.useWiki).addWikiItem(createWikiItem(0, name, snippet, ''), function () {
            self.reloadData(self.lastSearchedText, true);
        });
    };

    onClickEdit = (event: React.MouseEvent<HTMLElement>, id: number) => {
        this.numberOfLineToEdit = id;
        this.setState({});
    };

    handleGoToPage = (event: React.MouseEvent<HTMLElement>, page: number) => {
        event.preventDefault();
        if (this.page === page) {
            return;
        }
        this.page = page;
        this.reloadData(this.lastSearchedText);
    };

    makeHandler(data: any, callback: (event: React.MouseEvent<HTMLElement>, arg: any) => any) {
        return function (event: React.MouseEvent<HTMLElement>) {
            callback(event, data);
        };
    }

    onClickCheckboxUseWiki = (event: React.MouseEvent<HTMLInputElement>) => {
        this.useWiki = event.currentTarget.checked;
    };

    onClickUpdateItem = (event: React.MouseEvent<HTMLElement>, it: WikiItem) => {
        if (!this.editNameRef || !this.editNameRef.current || !this.editSnippetRef || !this.editSnippetRef.current) {
            return;
        }
        let self = this;
        let name: string = this.editNameRef.current.value;
        let snipper: string = this.editSnippetRef.current.value;

        new API(this.useWiki).editWikiItem(createWikiItem(it.pageid, name, snipper, it.timestamp), function () {
            self.reloadData(self.lastSearchedText);
        });
    };

    returnLayoutForEditItem = (it: WikiItem) => {
        let self = this;
        return (
            <tr>
                <td scope='row'>{it.pageid}</td>
                <td>
                    <input className='w-100' type='text' ref={self.editNameRef} defaultValue={it.title} />
                </td>
                <td>
                    <textarea className='w-100' ref={self.editSnippetRef} defaultValue={it.snippet} />
                </td>
                <td className='wiki_table__timestamp'>{getNormalDate(it)}</td>
                <td>
                    <div className='mb-2'>
                        <button
                            className='btn btn-outline-danger w-100'
                            onClick={self.makeHandler(it, self.onClickUpdateItem)}>
                            Изменить
                        </button>
                    </div>
                    <button
                        className='btn btn-outline-warning w-100'
                        onClick={() => {
                            self.numberOfLineToEdit = 0;
                            self.setState({});
                        }}>
                        Отменить
                    </button>
                </td>
            </tr>
        );
    };

    returnLayoutForItemOfTable(it: WikiItem) {
        let self = this;
        return (
            <tr>
                <td scope='row'>{it.pageid}</td>
                <td>{it.title}</td>
                <td>{it.snippet}</td>
                <td className='wiki_table__timestamp'>{getNormalDate(it)}</td>
                <td>
                    <div className='mb-2'>
                        <button
                            className='btn btn-outline-danger w-100'
                            onClick={self.makeHandler(it.pageid, self.onClickDelete)}>
                            Удалить
                        </button>
                    </div>
                    <button
                        className='btn btn-outline-warning w-100'
                        onClick={self.makeHandler(it.pageid, self.onClickEdit)}>
                        Изменить
                    </button>
                </td>
            </tr>
        );
    }

    returnLayoutForPagination = (pages: React.ReactElement[]) => {
        let disableLeft = this.page === 1 ? ' disabled' : '';
        let disableRight = this.page === this.allPageCount || this.allPageCount === 0 ? ' disabled' : '';
        return (
            <ul className='pagination'>
                <li className={'page-item' + disableLeft}>
                    <a href='#' className='page-link' onClick={this.onClickLeft}>
                        Назад
                    </a>
                </li>
                {pages}
                <li className={'page-item' + disableRight}>
                    <a href='#' className='page-link' onClick={this.onClickRight}>
                        Далее
                    </a>
                </li>
            </ul>
        );
    };

    render(): any {
        let self = this;
        let wikiTable: React.ReactElement[];
        let pagination: React.ReactElement;

        let pages: React.ReactElement[] = [];
        for (let i = 0; i < this.allPageCount; ++i) {
            let isDisabled: boolean = i + 1 === this.page;
            pages.push(
                <li className={isDisabled ? 'page-item disabled' : 'page-item'}>
                    <a href='#' className='page-link' onClick={this.makeHandler(i + 1, this.handleGoToPage)}>
                        {i + 1}
                    </a>
                </li>
            );
        }

        pagination = self.returnLayoutForPagination(pages);

        wikiTable = this.state.data.map(function (it: WikiItem, id: number) {
            if (it.pageid === self.numberOfLineToEdit) {
                return self.returnLayoutForEditItem(it);
            }
            return self.returnLayoutForItemOfTable(it);
        });

        wikiTable.push(
            <tr>
                <td scope='row'>Новая статья:</td>
                <td>
                    <input className='w-100' type='text' ref={this.nameRef} />
                </td>
                <td>
                    <input className='w-100' type='text' ref={this.snippetRef} />
                </td>
                <td>-</td>
                <td>
                    <div className='mb-2'>
                        <button
                            className='btn btn-outline-primary w-100'
                            onClick={self.makeHandler(undefined, self.onClickCreate)}>
                            Создать
                        </button>
                    </div>
                </td>
            </tr>
        );

        return (
            <div className='container'>
                <div className='content'>
                    <div className='wiki__options'>
                        <div className='wiki__options__item'>
                            <div>
                                <input type='checkbox' onClick={this.onClickCheckboxUseWiki} />
                            </div>
                            <div>Использовать api wikipedia?</div>
                        </div>
                    </div>
                    <div className='wiki_search'>
                        <input type='text' ref={this.inputRef} />
                        <button className='btn btn-outline-primary' onClick={this.onSearch}>
                            Искать
                        </button>
                    </div>

                    <table className='table table-bordered table-striped wiki_table'>
                        <thead>
                            <tr>
                                <td scope='col'>Номер страницы</td>
                                <td scope='col'>Заголовок</td>
                                <td scope='col'>Превью</td>
                                <td scope='col'>Время</td>
                                <td scope='col'>Опции</td>
                            </tr>
                        </thead>
                        <tbody>{wikiTable}</tbody>
                    </table>
                    {pagination}
                </div>
            </div>
        );
    }
}

export default WikiTable;
