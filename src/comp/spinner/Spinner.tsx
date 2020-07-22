import React from 'react';
import './Spinner.scss'

interface SpinnerProps {
    hidden: boolean;
}

export class Spinner extends React.Component<SpinnerProps, unknown> {
    render() {
        let hiddenClass = '';
        if(this.props.hidden) {
            hiddenClass = 'spinner-hide';
        }
        return (
            <div className={"absolute-center spinner-border " + hiddenClass} role="status">
                <span className="sr-only">Загрузка...</span>
            </div>
        );
    }
}
