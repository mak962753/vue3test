import {Component, App} from 'vue';
import * as Components from './components'

function getPath() {
    const {hash} = window.location;
    return hash ? hash.replace('#', ''):'*';
}


let routes: any[] = [];

interface Route {
    name: string;
    component: Component;
    path: string;
}

function install(vue: App, options: {routes: Route[]}) {
    
    for (const [name, component] of Object.entries(Components)) {
        vue.component(name, (component as unknown) as Component);
    }
    
    routes = options.routes;
}

function useRoutes(): Route[] {
    return routes;
}

export default install;

export {
    Route, 
    useRoutes,
    getPath
}