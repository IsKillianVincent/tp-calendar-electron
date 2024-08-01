declare module 'ical.js' {
    export class Component {
        constructor(data: any);
        getAllProperties(name: string): Property[];
    }

    export class Property {
        getFirstPropertyValue(name: string): string;
    }

    export function parse(data: string): any;
}