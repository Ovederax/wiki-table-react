import {WikiItem} from '../../entity/WikiItem';

export default interface WikiResponse {
    page: number;
    allPageCount: number;
    search: WikiItem[];
}
