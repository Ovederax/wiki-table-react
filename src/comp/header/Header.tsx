import React, {createRef, RefObject} from 'react';
import {AppStore} from '../../store/configureStore';
import {SearchInfo} from '../../store/actions/search';
import './Header.scss'

interface HeaderProps {
    store: AppStore,
    searchAction: (searchInfo: SearchInfo) => unknown
    refreshUseWiki: (useWiki: boolean) => unknown
}

export class Header extends React.Component<HeaderProps, unknown> {
    inputRef: RefObject<HTMLInputElement>;
    lastSearchedText: string = '';
    pageSizeValidation: boolean;

    constructor(props: HeaderProps) {
        super(props);
        this.pageSizeValidation = true;
        this.inputRef = createRef();
    }

    onClickCheckboxUseWiki = (event: React.MouseEvent<HTMLInputElement>) => {
        // TODO кажется, что теперь прийдется весь state перенести в store
        // если свойство нужно для action в другом компоненте, то здесь нужно делать action
        // на предварительное обновление свойства
        // чем то похоже на использование глобальных переменных в обычных языках
        // this.useWiki = event.currentTarget.checked;
        this.props.refreshUseWiki(event.currentTarget.checked);
    };

    onSearch = (event?: React.MouseEvent<HTMLElement>, newPageSize?: number) => {
        let pageSize = this.props.store.search.pageSize;
        if(newPageSize) {
            pageSize = newPageSize;
        }
        if (this.inputRef && this.inputRef.current) {
            const text: string = this.inputRef.current.value;
            this.lastSearchedText = text;
            this.props.searchAction({
                searchText: text,
                useWikipedia: this.props.store.search.useWiki,
                page: 0,
                pageSize: pageSize
            });
        }
    };

    onKeyDownInSearchInput = (event: React.KeyboardEvent) => {
        // press enter
        if(event.keyCode === 13) {
            this.onSearch();
        }
    };

    onChangePageSize = (event: React.ChangeEvent<HTMLInputElement>) => {
        const pageSize = Number(event.currentTarget.value).valueOf();
        if(pageSize > 0 && isFinite(pageSize)) {
            this.pageSizeValidation = true;
            this.setState({});
            this.onSearch(undefined, pageSize);
        } else {
            this.pageSizeValidation = false;
            this.setState({});
        }
    }

    render() {
        const pageSizeClasses = ['form-control'];
        if(!this.pageSizeValidation) {
            pageSizeClasses.push('border-danger');
        }
        return (
            <header className='header'>
                <div className='container'>
                    <div className='header__inner'>
                        <div className='header__up'>
                            <div className='header__logo'>
                                WikiFront
                            </div>
                            <div className='wiki_search'>
                                <div className='input-group input-grout-pagesize'>
                                    <div className='input-group-prepend'>
                                            <span className='input-group-text'>
                                                Отобразить
                                            </span>
                                    </div>
                                    <input type='text'
                                           defaultValue={this.props.store.search.pageSize}
                                           className={pageSizeClasses.join(' ')}
                                           onChange={this.onChangePageSize}/>
                                </div>

                                <div className='input-group'>
                                    <input className='form-control'
                                           type='text'
                                           ref={this.inputRef}
                                           onKeyDown={this.onKeyDownInSearchInput} />
                                    <div className='input-group-append'>
                                        <button className='btn btn-outline-primary' onClick={this.onSearch}>
                                            Искать
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className='header__down'>
                            <div className='wiki__options'>
                                <div className='wiki__options__item'>
                                    <div>
                                        <input type='checkbox' onClick={this.onClickCheckboxUseWiki} />
                                    </div>
                                    <div>Использовать api wikipedia?</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        );
    }
}

