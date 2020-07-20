import React, { createRef, RefObject } from 'react';
import './WikiTable.scss';
import API from '../service/API';
import { createWikiItem, getNormalDate, WikiItem } from '../entity/WikiItem';
import PageResponse from '../dto/response/PageResponse';

const INT32_MAX = 2147483647;
const LAST_PAGE = INT32_MAX;

interface WikiTableState {
    data: WikiItem[];
}

class WikiTable extends React.Component<object, WikiTableState> {
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

    constructor(props: object) {
        super(props);
        this.inputRef = createRef();

        this.nameRef = createRef();
        this.snippetRef = createRef();

        this.editNameRef = createRef();
        this.editSnippetRef = createRef();

        this.state = {data: []};
    }

    reloadData = (text: string, lastPage = false) => {
        this.numberOfLineToEdit = 0;
        const useWikipedia = this.useWiki;
        let page = this.page - 1;
        if(lastPage) {
            page = LAST_PAGE;
        }

        new API(useWikipedia).search(text, page, this.lengthOfPage)
            .then((value: PageResponse<WikiItem>) => {
                const out = value as PageResponse<WikiItem>;
                this.allPageCount = out.totalPages;
                this.page = out.page + 1;
                let items: WikiItem[] = out.content.map((it) =>
                    createWikiItem(it.pageid, it.title, it.snippet, it.timestamp)
                );
                if (this.nameRef?.current && this.snippetRef?.current) {
                    this.nameRef.current.value = "";
                    this.snippetRef.current.value = "";
                }
                this.setState({
                    data: items,
                });
            })
            .catch(reason => { alert(reason) });
    };

    onSearch = (event: React.MouseEvent<HTMLElement>) => {
        if (this.inputRef && this.inputRef.current) {
            const text: string = this.inputRef.current.value;
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
        const promise = new API(this.useWiki).deleteById(id);
        promise.then((value) => {
            this.reloadData(this.lastSearchedText);
        }).catch(reason => { alert(reason) });
    };

    onClickCreate = (event: React.MouseEvent<HTMLElement>) => {
        if (!this.nameRef || !this.nameRef.current || !this.snippetRef || !this.snippetRef.current) {
            return;
        }
        const name: string = this.nameRef.current.value;
        const snippet: string = this.snippetRef.current.value;

        const promise = new API(this.useWiki).addWikiItem(createWikiItem(0, name, snippet, ''));
        promise.then((value) =>  {
            this.reloadData(this.lastSearchedText, true);
        }).catch(reason => { alert(reason) });
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

    makeHandler<T,R>(data: T, callback: (event: React.MouseEvent<HTMLElement>, arg: T) => R) {
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
        const name: string = this.editNameRef.current.value;
        const snipper: string = this.editSnippetRef.current.value;

        new API(this.useWiki).editWikiItem(createWikiItem(it.pageid, name, snipper, it.timestamp))
            .then((value) => {
                this.reloadData(this.lastSearchedText);
            })
            .catch(reason => { alert(reason) });
    };

    returnLayoutForEditItem = (it: WikiItem) => {
        return (
            <tr>
                <td scope='row'>{it.pageid}</td>
                <td>
                    <input className='w-100' type='text' ref={this.editNameRef} defaultValue={it.title} />
                </td>
                <td>
                    <textarea className='w-100' ref={this.editSnippetRef} defaultValue={it.snippet} />
                </td>
                <td className='wiki_table__timestamp'>{getNormalDate(it)}</td>
                <td>
                    <div className='mb-2'>
                        <button
                            className='btn btn-outline-danger w-100'
                            onClick={this.makeHandler(it, this.onClickUpdateItem)}>
                            Изменить
                        </button>
                    </div>
                    <button
                        className='btn btn-outline-warning w-100'
                        onClick={() => {
                            this.numberOfLineToEdit = 0;
                            this.setState({});
                        }}>
                        Отменить
                    </button>
                </td>
            </tr>
        );
    };

    returnLayoutForItemOfTable(it: WikiItem) {
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
                            onClick={this.makeHandler(it.pageid, this.onClickDelete)}>
                            Удалить
                        </button>
                    </div>
                    <button
                        className='btn btn-outline-warning w-100'
                        onClick={this.makeHandler(it.pageid, this.onClickEdit)}>
                        Изменить
                    </button>
                </td>
            </tr>
        );
    }

    returnLayoutForPagination = (pages: React.ReactElement[]) => {
        const disableLeft = this.page === 1 ? ' disabled' : '';
        const disableRight = this.page === this.allPageCount || this.allPageCount === 0 ? ' disabled' : '';
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

    render() {
        let wikiTable: React.ReactElement[];
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

        const pagination: React.ReactElement = this.returnLayoutForPagination(pages);

        wikiTable = this.state.data.map((it: WikiItem, id: number) => {
            if (it.pageid === this.numberOfLineToEdit) {
                return this.returnLayoutForEditItem(it);
            }
            return this.returnLayoutForItemOfTable(it);
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
                            onClick={this.makeHandler(undefined, this.onClickCreate)}>
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
