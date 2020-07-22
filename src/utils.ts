import React from 'react';

export const INT32_MAX = 2147483647;

export function makeHandler<T,R>(data: T, callback: (event: React.MouseEvent<HTMLElement>, arg: T) => R) {
    return function (event: React.MouseEvent<HTMLElement>) {
        callback(event, data);
    };
}
