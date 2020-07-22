import {AppStore, IAction} from '../configureStore';
import API from '../../service/API';
import PageResponse from '../../dto/response/PageResponse';
import {WikiItem} from '../../entity/WikiItem';
import {INT32_MAX} from '../../utils';

export const SEARCH_PAGE_REQUEST    = 'SEARCH_PAGE_REQUEST';
export const SEARCH_PAGE_RESPONSE   = 'SEARCH_PAGE_RESPONSE';
export const SEARCH_BAD_REQUEST     = 'SEARCH_BAD_REQUEST';

export const SEND_REQUEST   = 'SEND_REQUEST';
export const REQUEST_SUCCESS   = 'REQUEST_SUCCESS';
export const REQUEST_FAIL   = 'REQUEST_FAIL';

const LAST_PAGE = INT32_MAX;

export interface SearchInfo {
    searchText: string,
    useWikipedia: boolean,
    page: number,
    pageSize: number
}

export function searchWikiItems(info: SearchInfo) {
    return function (dispatch: (action: unknown) => unknown) {
        dispatch({
            type: SEARCH_PAGE_REQUEST,
            payload: {
                searchText: info.searchText,
                useWikipedia: info.useWikipedia
            } as SearchInfo
        });
        new API(info.useWikipedia)
            .search(info.searchText, info.page, info.pageSize)
            .then((value: PageResponse<WikiItem>) => {
                dispatch({
                    type: SEARCH_PAGE_RESPONSE,
                    payload: value as PageResponse<WikiItem>
                });
            })
            .catch(reason => {
                alert(reason);
                dispatch({
                    type: SEARCH_BAD_REQUEST,
                    payload: reason as string
                });
            });
    };
}

function searchRequest(state: AppStore, dispatch: (action: unknown) => unknown, lastPage: boolean = false) {
    const info:SearchInfo = {
        searchText: state.search.lastSearchedText,
        useWikipedia: state.search.useWiki,
        page: lastPage? LAST_PAGE : state.wiki.page,
        pageSize: state.search.pageSize
    };
    dispatch(searchWikiItems(info));
}

export function createWikiItem(item: WikiItem) {
    return function (dispatch: (action: unknown) => unknown, getState: ()=>AppStore) {
        dispatch({
            type: SEND_REQUEST
        });
        new API(false)
            .addWikiItem(item)
            .then((value) =>  {
                dispatch({
                    type: REQUEST_SUCCESS
                });
                searchRequest(getState(), dispatch, true);
            })
            .catch(reason => {
                alert(reason);
                dispatch({
                    type: REQUEST_FAIL,
                    payload: reason as string
                });
            });
    };
}

export function editWikiItem(item: WikiItem) {
    return function (dispatch: (action: unknown) => unknown, getState: ()=>AppStore) {
        dispatch({
            type: SEND_REQUEST
        });
        new API(false)
            .editWikiItem(item)
            .then((value) =>  {
                dispatch({
                    type: REQUEST_SUCCESS
                });
                searchRequest(getState(), dispatch);
            })
            .catch(reason => {
                alert(reason);
                dispatch({
                    type: REQUEST_FAIL,
                    payload: reason as string
                });
            });
    };
}

export function deleteWikiItem(id: number) {
    return function (dispatch: (action: unknown) => unknown, getState: ()=>AppStore) {
        dispatch({
            type: SEND_REQUEST
        });
        new API(false)
            .deleteWikiItemById(id)
            .then((value) =>  {
                dispatch({
                    type: REQUEST_SUCCESS
                });
                searchRequest(getState(), dispatch);
            })
            .catch(reason => {
                alert(reason);
                dispatch({
                    type: REQUEST_FAIL,
                    payload: reason as string
                });
            });
    };
}
