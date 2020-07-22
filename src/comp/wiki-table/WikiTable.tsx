import React, { createRef, RefObject } from 'react';
import './WikiTable.scss';
import {createWikiItem, getNormalDate, WikiItem} from '../../entity/WikiItem';
import {SearchInfo} from '../../store/actions/search';
import {AppStore} from '../../store/configureStore';

const INT32_MAX = 2147483647;
const LAST_PAGE = INT32_MAX;

interface WikiTableProps {
    store: AppStore,
    searchAction:   (searchInfo: SearchInfo) => unknown,
    createAction:   (item: WikiItem) => unknown,
    editAction:     (item: WikiItem) => unknown,
    deleteAction:   (id: number) => unknown
}

interface CreateForm {
    name: boolean,
    snippet: boolean
}

interface EditForm {
    name: boolean,
    snippet: boolean
}

interface WikiTableState {
    validateCreate: CreateForm,
    validateEdit: EditForm
}

class WikiTable extends React.Component<WikiTableProps, WikiTableState> {
    page = 1;
    allPageCount = 0;
    numberOfLineToEdit = 0; // if (0) -> no edit line

    nameRef: RefObject<HTMLInputElement>;
    snippetRef: RefObject<HTMLInputElement>;

    editNameRef: RefObject<HTMLInputElement>;
    editSnippetRef: RefObject<HTMLTextAreaElement>;

    constructor(props: WikiTableProps) {
        super(props);

        this.nameRef = createRef();
        this.snippetRef = createRef();

        this.editNameRef = createRef();
        this.editSnippetRef = createRef();

        this.page = this.props.store.wiki.page+1;
        this.allPageCount = this.props.store.wiki.totalPages;

        this.state = {
            validateCreate: {
                name: true,
                snippet: true
            },
            validateEdit: {
                name: true,
                snippet: true
            }
        };
    }

    refreshValidation = () => {
        console.log('refreshValidation');
        this.setState({
            validateCreate: {
                name: true,
                snippet: true
            },
            validateEdit: {
                name: true,
                snippet: true
            }
        });
    };

    shouldComponentUpdate(nextProps: Readonly<WikiTableProps>,
                nextState: Readonly<unknown>, nextContext: any): boolean {
        console.log('shouldComponentUpdate');
        this.page = nextProps.store.wiki.page+1;
        this.allPageCount = nextProps.store.wiki.totalPages;
        return true;
    }

    componentDidUpdate(prevProps: Readonly<WikiTableProps>, prevState: Readonly<unknown>, snapshot?: any): void {
        console.log('componentDidUpdate');
        if(this.props.store.needUpdateTable) {
            this.reloadData();
        }
    }

    reloadData = (lastPage: boolean = false) => {
        this.refreshValidation();
        const search = this.props.store.search;
        this.numberOfLineToEdit = 0;
        let page = this.page - 1;
        if(lastPage) {
            page = LAST_PAGE;
        }
        this.props.searchAction({
            searchText: search.lastSearchedText,
            useWikipedia: search.useWiki,
            page: page,
            pageSize: search.pageSize
        });
    };

    onClickLeft = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        this.page--;
        if (this.page < 1) {
            this.page = 1;
            return; // no render
        }
        this.reloadData();
    };

    onClickRight = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        this.page++;
        if (this.page > this.allPageCount) {
            this.page = this.allPageCount;
            return; // no render
        }
        this.reloadData();
    };

    onClickDelete = (event: React.MouseEvent<HTMLElement>, id: number) => {
        if(this.props.store.search.useWiki) {
            alert('Wikipedia no support this operation');
            return;
        }
        this.props.deleteAction(id);
    };

    onClickCreate = (event: React.MouseEvent<HTMLElement>) => {
        if (!this.nameRef || !this.nameRef.current || !this.snippetRef || !this.snippetRef.current) {
            return;
        }
        const name: string = this.nameRef.current.value;
        const snippet: string = this.snippetRef.current.value;
        if(this.props.store.search.useWiki) {
            alert('Wikipedia no support this operation');
            return;
        }
        // validation
        const createForm: CreateForm = {
            name: true,
            snippet: true
        };
        if(name.trim() === '') {
            createForm.name = false;
        }
        if(snippet.trim() === '') {
            createForm.snippet = false;
        }
        if(!createForm.name || !createForm.snippet) {
            this.setState({
                validateCreate: createForm
            });
            return; // no request action
        }
        this.refreshValidation(); // TODO при нажатии на search - тоже долен происходить сброс валидации
        this.props.createAction(createWikiItem(0, name, snippet, ''));
    };

    // Begin edit Article
    onClickEdit = (event: React.MouseEvent<HTMLElement>, id: number) => {
        this.numberOfLineToEdit = id;
        this.setState({});
    };

    // Flush item changes
    onClickUpdateItem = (event: React.MouseEvent<HTMLElement>, it: WikiItem) => {
        if(this.props.store.search.useWiki) {
            alert('Wikipedia no support this operation');
            return;
        }
        if (!this.editNameRef || !this.editNameRef.current || !this.editSnippetRef || !this.editSnippetRef.current) {
            return;
        }
        const name: string = this.editNameRef.current.value;
        const snippet: string = this.editSnippetRef.current.value;
        // validation
        const editForm: EditForm = {
            name: true,
            snippet: true
        };
        if(name.trim() === '') {
            editForm.name = false;
        }
        if(snippet.trim() === '') {
            editForm.snippet = false;
        }
        if(!editForm.name || !editForm.snippet) {
            this.setState({
                validateEdit: editForm
            });
            return; // no request action
        }
        this.refreshValidation();
        this.props.editAction(createWikiItem(it.pageid, name, snippet, it.timestamp));
    };

    handleGoToPage = (event: React.MouseEvent<HTMLElement>, page: number) => {
        event.preventDefault();
        if (this.page === page) {
            return;
        }
        this.page = page;
        this.reloadData();
    };

    makeHandler<T,R>(data: T, callback: (event: React.MouseEvent<HTMLElement>, arg: T) => R) {
        return function (event: React.MouseEvent<HTMLElement>) {
            callback(event, data);
        };
    }

    returnLayoutForEditItem = (it: WikiItem) => {
        const inputNameClasses = ['w-100'];
        if(!this.state.validateEdit.name) {
            inputNameClasses.push('border-danger');
        }

        const inputSnippetClasses = ['w-100'];
        if(!this.state.validateEdit.snippet) {
            inputSnippetClasses.push('border-danger');
        }

        return (
            <tr>
                <td scope='row'>{it.pageid}</td>
                <td>
                    <input className={inputNameClasses.join(' ')}
                           type='text' ref={this.editNameRef}
                           defaultValue={it.title} />
                </td>
                <td>
                    <textarea className={inputNameClasses.join(' ')}
                              ref={this.editSnippetRef}
                              defaultValue={it.snippet} />
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

    addTagsInText(snippet: string, text:string): React.ReactElement[] {
        if(text.trim() === '') {
            return ([<div>{snippet}</div>])
        }
        const result: React.ReactElement[] = [];
        const words: string[] = snippet.toLowerCase().split(text.toLowerCase());

        result.push(<span>{words[0]}</span>);
        for(let i=1; i<words.length; ++i) {
            result.push(<b>{text}</b>);
            result.push(<span>{words[i].toLowerCase()}</span>);
        }
        return result;
    }

    returnLayoutForItemOfTable(it: WikiItem) {
        return (
            <tr>
                <td scope='row'>{it.pageid}</td>
                <td>{it.title}</td>
                <td>{this.addTagsInText(it.snippet, this.props.store.search.lastSearchedText)}</td>
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

        wikiTable = this.props.store.wiki.data.map((it: WikiItem, id: number) => {
            if (it.pageid === this.numberOfLineToEdit) {
                return this.returnLayoutForEditItem(it);
            }
            return this.returnLayoutForItemOfTable(it);
        });

        const inputNameClasses = ['w-100'];
        if(!this.state.validateCreate.name) {
            inputNameClasses.push('border-danger');
        }

        const inputSnippetClasses = ['w-100'];
        if(!this.state.validateCreate.snippet) {
            inputSnippetClasses.push('border-danger');
        }

        wikiTable.push(
            <tr>
                <td scope='row'>Новая статья:</td>
                <td>
                    <input className={inputNameClasses.join(' ')} type='text' ref={this.nameRef}/>
                </td>
                <td>
                    <input className={inputSnippetClasses.join(' ')} type='text' ref={this.snippetRef}/>
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
