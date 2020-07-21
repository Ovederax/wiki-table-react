import React, {createRef, RefObject} from 'react';
import {AppStore} from '../../store/configureStore';
import {SearchInfo} from '../../store/actions/search';
import './Header.scss'

interface HeaderProps {
    store: AppStore,
    searchAction: (searchInfo: SearchInfo) => unknown
}

export class Header extends React.Component<HeaderProps, unknown> {
    useWiki: boolean = false;
    inputRef: RefObject<HTMLInputElement>;
    lastSearchedText: string = '';

    constructor(props: HeaderProps) {
        super(props);

        this.inputRef = createRef();
    }

    onClickCheckboxUseWiki = (event: React.MouseEvent<HTMLInputElement>) => {
        this.useWiki = event.currentTarget.checked;
    };

    onSearch = (event?: React.MouseEvent<HTMLElement>) => {
        if (this.inputRef && this.inputRef.current) {
            const text: string = this.inputRef.current.value;
            this.lastSearchedText = text;
            this.props.searchAction({
                searchText: text,
                useWikipedia: this.useWiki,
                page: 0,
                pageSize: 4
            });
        }
    };

    onKeyDownInSearchInput = (event: React.KeyboardEvent) => {
        // press enter
        if(event.keyCode === 13) {
            this.onSearch();
        }
    };

    render() {
        return (
            <header className='header'>
                <div className="container">
                    <div className="header__inner">
                        <div className="header__up">
                            <div className="header__logo">
                                WikiFront
                            </div>
                            <div className='wiki_search'>
                                <input type='text'
                                       ref={this.inputRef}
                                       onKeyDown={this.onKeyDownInSearchInput} />
                                <button className='btn btn-outline-primary' onClick={this.onSearch}>
                                    Искать
                                </button>
                            </div>
                        </div>
                        <div className="header__down">
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

