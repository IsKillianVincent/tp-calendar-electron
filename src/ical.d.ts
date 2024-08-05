declare module 'ical.js' {
    export class Component {
        constructor(data: any);
        getAllSubcomponents(name: string): Component[];
        getFirstPropertyValue(name: string): string;
    }

    export function parse(data: string): any;
}
