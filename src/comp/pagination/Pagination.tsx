import React from 'react';
import {makeHandler} from '../../utils';

interface PaginationProps {
    page: number,
    totalPages: number,

    onClickLeft: (event: React.MouseEvent<HTMLElement>) => void,
    onClickRight: (event: React.MouseEvent<HTMLElement>) => void,
    handleGoToPage: (event: React.MouseEvent<HTMLElement>, page: number) => void
}

export class Pagination extends React.Component<PaginationProps, unknown>{
    render() {
        const {page, totalPages} = this.props;
        let pages: React.ReactElement[] = [];

        for (let i = 0; i < totalPages; ++i) {
            let isDisabled: boolean = i === page;
            pages.push(
                <li className={isDisabled ? 'page-item disabled' : 'page-item'}>
                    <a href='#' className='page-link' onClick={makeHandler(i, this.props.handleGoToPage)}>
                        {i + 1}
                    </a>
                </li>
            );
        }

        const disableLeft = page === 0 ? ' disabled' : '';
        const disableRight = page >= totalPages-1 || totalPages === 0 ? ' disabled' : '';
        return (
            <ul className='pagination'>
                <li className={'page-item' + disableLeft}>
                    <a href='#' className='page-link' onClick={this.props.onClickLeft}>
                        Назад
                    </a>
                </li>
                {pages}
                <li className={'page-item' + disableRight}>
                    <a href='#' className='page-link' onClick={this.props.onClickRight}>
                        Далее
                    </a>
                </li>
            </ul>
        );
    }
}
