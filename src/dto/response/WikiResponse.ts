import {WikiItem} from "../../entity/WikiItem";

export interface WikiResponse {
  page: number,
  allPageCount: number,
  search: WikiItem[];
}
