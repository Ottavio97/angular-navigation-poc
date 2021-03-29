export enum ComponentType {
    First = 'first',
    Second = 'second',
    Third = 'third',
}

export interface Context {
    type: ComponentType;

    // per salvare nel session storage il contesto
    toSessionStorage(): any;

    // per ricostruire al session storage il contesto
    fromSessionStorage(storedData: any): any;

    // dato il parametro ne inizializza il valore in base a logiche custom
    fillParameterValue(parameter: any, functionParam: any): boolean;
}

export class RouteEntry {
    id?: number;
    url: string;
    params: { [p: string]: any };

    constructor(url: string, params: { [p: string]: any }, id?: number) {
        this.id = id;
        this.url = url;
        this.params = params;
    }

    get componentId(): string {
        return this.params && this.params.id ? this.params.id : null;
    }
}

export class NamedRouterOutlet {
    name: string;
    history: RouteEntry[];
    currentIndex: number;

    constructor(name: string, history = [], currentIndex = 0) {
        this.name = name;
        this.history = history;
        this.currentIndex = currentIndex;
    }

    pushEntry(routeEntry: RouteEntry): void {
        this.currentIndex = this.history[this.currentIndex] ? this.currentIndex + 1 : this.currentIndex;
        this.history[this.currentIndex] = routeEntry;
    }

    popEntry(): RouteEntry {
        this.currentIndex = this.currentIndex >= 1 ? this.currentIndex - 1 : 0;
        return this.history[this.currentIndex] as RouteEntry;
    }

    getCurrentRouteEntryParams(): any {
        if (this.history[this.currentIndex]) {
            return this.history[this.currentIndex].params ? this.history[this.currentIndex].params : null;
        }
        return null;
    }
}

export class RouteUtility {
    private static contextMap: Map<string, Context> = new Map();

    static initialize(): void {
        RouteUtility.contextMap.set(ComponentType.First, new FirstContext());
        RouteUtility.contextMap.set(ComponentType.Second, new SecondContext());
        RouteUtility.contextMap.set(ComponentType.Third, new ThirdContext());
    }

    static fromSessionStorage(componentData: any): Context {
        if (RouteUtility.contextMap.size === 0) {
            RouteUtility.initialize();
        }
        const contextClass = RouteUtility.contextMap.get(componentData.type);
        if (contextClass) {
            return contextClass.fromSessionStorage(componentData);
        }
        throw new Error('Implementazione della contextClass non implementata o non correttamente configurata');
    }
}

/**
 * Classi di contesto specifiche per i vari componenti
 */
export class FirstContext implements Context {
    type = ComponentType.First;
    data: any;

    constructor(data?: any) {
        this.data = data;
    }

    toSessionStorage(): any {
        return {
            type: this.type,
            data: this.data
        };
    }

    fromSessionStorage(storedData: any): FirstContext {
        this.data = storedData.data;
        return this;
    }

    fillParameterValue(parameter: any, functionParam: any): boolean {
        if (this.data && this.data[parameter.name]) {
            functionParam.value = this.data[parameter.name];
            return true;
        }
        return false;
    }
}

export class SecondContext implements Context {
    type = ComponentType.Second;
    data: any;

    constructor(data?: any) {
        this.data = data;
    }

    toSessionStorage(): any {
        return {
            type: this.type,
            data: this.data
        };
    }

    fromSessionStorage(storedData: any): SecondContext {
        this.data = storedData.data;
        return this;
    }

    fillParameterValue(parameter: any, functionParam: any): boolean {
        if (this.data && this.data[parameter.name]) {
            functionParam.value = this.data[parameter.name];
            return true;
        }
        return false;
    }
}

export class ThirdContext implements Context {
    type = ComponentType.Third;
    data: any;

    constructor(data?: any) {
        this.data = data;
    }

    toSessionStorage(): any {
        return {
            type: this.type,
            data: this.data
        };
    }

    fromSessionStorage(storedData: any): ThirdContext {
        this.data = storedData.data;
        return this;
    }

    fillParameterValue(parameter: any, functionParam: any): boolean {
        if (this.data && this.data[parameter.name]) {
            functionParam.value = this.data[parameter.name];
            return true;
        }
        return false;
    }
}

export abstract class Routable {

    saveContext(): void { }
}
