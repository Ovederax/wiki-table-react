import React from 'react';
import './App.css';
import WikiTable from './wiki-table/WikiTable';

import { Switch, Route } from 'react-router-dom';
import {NotFound} from './NotFound';
import {AppStore, IAction} from '../store/configureStore';
import {connect, useDispatch} from 'react-redux';
import {Header} from './header/Header';
import {createWikiItem, deleteWikiItem, editWikiItem, SearchInfo, searchWikiItems} from '../store/actions/search';
import {WikiItem} from '../entity/WikiItem';
import {Spinner} from './spinner/Spinner';

interface AppPropsActions {
    searchAction: (info: SearchInfo) => unknown;
    createAction:   (item: WikiItem) => unknown;
    editAction:     (item: WikiItem) => unknown;
    deleteAction:   (id: number) => unknown;
}

interface AppProps extends AppPropsActions {
    store: AppStore;
}

class App extends React.Component<AppProps, unknown> {
    render() {
        const {store, searchAction, createAction, editAction, deleteAction} = this.props;
        return (
            <div className='App'>
                <Header
                    store={store}
                    searchAction={searchAction} />
                <Spinner hidden={!this.props.store.isFetching}/>
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
}

const mapStateToProps = (store: AppStore) => {
    return {
        store: store
    }
};

// TODO сложно понять как типизировать верно
const mapDispatchToProps = (dispatch: (action: any)=>any) => {
    const actions: AppPropsActions = {
        searchAction: (searchInfo: SearchInfo) => dispatch(searchWikiItems(searchInfo)),
        createAction: (item: WikiItem) => dispatch(createWikiItem(item)),
        editAction:   (item: WikiItem) => dispatch(editWikiItem(item)),
        deleteAction: (id: number) => dispatch(deleteWikiItem(id))
    };
    return actions;
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
