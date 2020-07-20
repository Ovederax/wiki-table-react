export default interface PageResponse<T> {
    page: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    content: T[];
}
