import React from 'react';
import './App.css';
import WikiTable from './wiki-table/WikiTable';
import { Switch, Route } from 'react-router-dom';
import {NotFound} from './NotFound';
import {AppStore, IAction} from '../store/configureStore';
import {connect} from 'react-redux';
import {Header} from './header/Header';
import {
    createWikiItem,
    deleteWikiItem,
    editWikiItem,
    SearchInfo,
    searchWikiItems,
    setUseWiki,
} from '../store/actions/search';
import {WikiItem} from '../entity/WikiItem';
import {Spinner} from './spinner/Spinner';
import { ThunkDispatch } from 'redux-thunk';

interface AppPropsActions {
    searchAction: (info: SearchInfo) => unknown;
    createAction:   (item: WikiItem) => unknown;
    editAction:     (item: WikiItem) => unknown;
    deleteAction:   (id: number) => unknown;
    refreshUseWikiAction: (useWiki: boolean) => unknown;
}

interface AppProps extends AppPropsActions {
    store: AppStore;
}

function App(props : AppProps) {
    const {store, searchAction, createAction, editAction, deleteAction, refreshUseWikiAction} = props;
    return (
        <div className='App'>
            <Header
                store={store}
                searchAction={searchAction}
                refreshUseWiki={refreshUseWikiAction}/>
            <Spinner hidden={!props.store.isFetching}/>
            <Switch>
                <Route exact path='/'
                    render={ (props =>
                        <WikiTable
                            {...props}
                            store={store}
                            searchAction={searchAction}
                            createAction={createAction}
                            editAction={editAction}
                            deleteAction={deleteAction}
                        />)
                    }/>
                <Route
                    component={NotFound}/>
            </Switch>
        </div>
    );
}

const mapStateToProps = (store: AppStore) => {
    return {
        store: store
    }
};

const mapDispatchToProps = (dispatch: ThunkDispatch<AppStore, unknown, IAction>) => {
    const actions: AppPropsActions = {
        searchAction: (searchInfo: SearchInfo) => dispatch(searchWikiItems(searchInfo)),
        createAction: (item: WikiItem) => dispatch(createWikiItem(item)),
        editAction:   (item: WikiItem) => dispatch(editWikiItem(item)),
        deleteAction: (id: number) => dispatch(deleteWikiItem(id)),
        refreshUseWikiAction: (useWiki: boolean) => dispatch(setUseWiki(useWiki))
    };
    return actions;
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
