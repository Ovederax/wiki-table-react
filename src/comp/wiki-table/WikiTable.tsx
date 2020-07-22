import React, { createRef, RefObject } from 'react';
import './WikiTable.scss';
import {createWikiItem, getNormalDate, WikiItem} from '../../entity/WikiItem';
import {SearchInfo} from '../../store/actions/search';
import {AppStore} from '../../store/configureStore';
import {Pagination} from '../pagination/Pagination';
import {makeHandler} from '../../utils';

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

    reloadData = (page: number) => {
        this.refreshValidation();
        const search = this.props.store.search;
        this.numberOfLineToEdit = 0;

        this.props.searchAction({
            searchText: search.lastSearchedText,
            useWikipedia: search.useWiki,
            page: page,
            pageSize: search.pageSize
        });
    };

    onClickLeft = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        let page = this.props.store.wiki.page-1;
        if (page < 0) {
            return; // no request - no render
        }
        this.reloadData(page);
    };

    onClickRight = (event: React.MouseEvent<HTMLElement>) => {
        event.preventDefault();
        let page = this.props.store.wiki.page+1;
        if (page >= this.props.store.wiki.totalPages) {
            return; // no request - no render
        }
        this.reloadData(page);
    };

    onClickDelete = (event: React.MouseEvent<HTMLElement>, id: number) => {
        if(this.props.store.search.useWiki) {
            alert('Wikipedia no support this operation');
            return;
        }
        this.numberOfLineToEdit = 0;
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
        this.refreshValidation();
        this.numberOfLineToEdit = 0;
        this.props.createAction(createWikiItem(0, name, snippet, ''));
    };

    // Begin edit Article
    onClickEdit = (event: React.MouseEvent<HTMLElement>, id: number) => {
        this.numberOfLineToEdit = id;
        this.refreshValidation();
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
        this.numberOfLineToEdit = 0;
        this.props.editAction(createWikiItem(it.pageid, name, snippet, it.timestamp));
    };

    handleGoToPage = (event: React.MouseEvent<HTMLElement>, page: number) => {
        event.preventDefault();
        if (this.props.store.wiki.page === page) {
            return;
        }
        this.reloadData(page);
    };

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
                    <textarea className={inputSnippetClasses.join(' ')}
                              ref={this.editSnippetRef}
                              defaultValue={it.snippet} />
                </td>
                <td className='wiki_table__timestamp'>{getNormalDate(it)}</td>
                <td>
                    <div className='mb-2'>
                        <button
                            className='btn btn-outline-danger w-100'
                            onClick={makeHandler(it, this.onClickUpdateItem)}>
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
                            onClick={makeHandler(it.pageid, this.onClickDelete)}>
                            Удалить
                        </button>
                    </div>
                    <button
                        className='btn btn-outline-warning w-100'
                        onClick={makeHandler(it.pageid, this.onClickEdit)}>
                        Изменить
                    </button>
                </td>
            </tr>
        );
    }

    render() {
        const wiki = this.props.store.wiki;
        let wikiTable: React.ReactElement[];
        let pagination: React.ReactElement = <Pagination
            handleGoToPage={this.handleGoToPage}
            onClickLeft={this.onClickLeft}
            onClickRight={this.onClickRight}
            page={this.props.store.wiki.page} totalPages={this.props.store.wiki.totalPages}/>;


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
                            onClick={this.onClickCreate}>
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
