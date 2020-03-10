import {Component, App} from 'vue';

function addComponents(app: App, components: any) {
    for (const [name, component] of Object.entries(components)) {
        app.component(name, component as Component);
    }
}

export {
    addComponents
}