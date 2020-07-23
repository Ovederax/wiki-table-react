import {Action, applyMiddleware, createStore, Store} from 'redux';
import logger from 'redux-logger'
import thunk from 'redux-thunk'
import {
    REQUEST_FAIL, REQUEST_SUCCESS,
    SEARCH_BAD_REQUEST,
    SEARCH_PAGE_REQUEST,
    SEARCH_PAGE_RESPONSE, SearchInfo,
    SEND_REQUEST, SetUseWikiAction, USE_WIKI
} from './actions/search';
import {WikiItem} from '../entity/WikiItem';
import PageResponse from '../dto/response/PageResponse';

export interface IAction extends Action<string> {
    type: string,
    payload?: unknown
}

interface SearchStore {
    lastSearchedText: string,
    useWiki: boolean,
    pageSize: number
}

interface WikiTableStore {
    page: number,
    totalPages: number,
    totalItems: number,
    data: WikiItem[]
}

interface ApiError {
    reason: string
}

export interface AppStore {
    search: SearchStore,
    wiki: WikiTableStore,
    error: ApiError,
    isFetching: boolean,
}

const initialState: AppStore =  {
    search: {
        lastSearchedText: '',
        useWiki: false,
        pageSize: 4
    },
    wiki: {
        page: 0,
        totalPages: 0,
        totalItems: 0,
        data: []
    },
    error: {
        reason: ''
    },
    isFetching: false,
};

export function rootReducer(store: AppStore = initialState, action: IAction) : AppStore {
    switch (action.type) {
        case SEARCH_PAGE_REQUEST:
            const searchStore: SearchStore = {
                ...store.search,
                lastSearchedText: (action.payload as SearchInfo).searchText
            };
            return {...store, search:searchStore, isFetching: true};
        case SEARCH_PAGE_RESPONSE:
            const result = action.payload as PageResponse<WikiItem>;
            const wiki: WikiTableStore = {
                data: result.content,
                page: result.page,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
            };
            let search: SearchStore = {
                ...store.search,
                pageSize: result.pageSize
            };
            return {...store, wiki: wiki, search: search, isFetching: false};
        case SEARCH_BAD_REQUEST:
            return {...store, isFetching: false, error: {reason: action.payload as string}};

        case USE_WIKI:
            const useWiki = (action as SetUseWikiAction).payload;
            return {...store, search: {...store.search, useWiki: useWiki}};

        case SEND_REQUEST:
            return {...store, isFetching: true};
        case REQUEST_SUCCESS:
            return {...store, isFetching: false};
        case REQUEST_FAIL:
            return {...store, isFetching: false};

        default:
            return store;

    }
}

// export const rootReducer = combineReducers({
//     search: searchReducer,
//     wiki: wikiReducer
// });

export const store: Store<AppStore, IAction> = createStore<AppStore, IAction, any, any> (
    rootReducer,
    applyMiddleware<any, any>(thunk, logger)
);
