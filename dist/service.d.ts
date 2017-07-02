import { Application, AppProvider } from './app';
import { Connection } from 'typeorm';
/**
 * Decorator to make an injectable class
 * @return {((target: Function) => void)}
 */
export declare function Injectable(): (target: Function) => void;
/**
 * Check if class is injectable
 * @param  {Function} targetClass
 * @return {boolean}
 */
export declare function isInjectable(targetClass: Function): boolean;
/**
 * Context class
 */
export declare class Context {
    readonly app: Application;
    /**
     * Map of resolved instances
     * @type {Map<string, any>}
     */
    private resolvedInstances;
    /**
     * Context constructor
     * @param {Application} app
     */
    constructor(app: Application);
    /**
     * create instance via dependency injection and using this context
     * @param  {(new(...args: any[]) => U)} serviceClass
     * @return {U}
     */
    make<U extends Service>(serviceClass: new (...args: any[]) => U): U;
}
/**
 * ServiceClass interface
 */
export interface ServiceClass {
    new (...args: any[]): Service;
}
/**
 * ServiceClassResolver interface
 */
export interface ServiceClassResolver {
    (type?: any): ServiceClass;
}
/**
 * Provider service context
 * @return {AppProvider}
 */
export declare function provideServices(): AppProvider;
/**
 * Abstract Service class
 */
export declare abstract class Service {
    protected readonly context: Context;
    /**
     * Service constructor
     * @param {Context} context
     */
    constructor(context: Context);
}
/**
 * Abstract SQLService class
 */
export declare abstract class SQLService extends Service {
    /**
     * Gets registered connection with the given name.
     * If connection name is not given then it will get a default connection.
     * Throws exception if connection with the given name was not found.
     * @param  {string} name
     * @return {Connection}
     */
    connection(name?: string): Connection;
}
