import React from 'react';
import './App.css';
import WikiTable from './WikiTable';

class App extends React.Component<any, any> {
    render(): any {
        return (
            <div className='App'>
                <WikiTable />
            </div>
        );
    }
}

export default App;
