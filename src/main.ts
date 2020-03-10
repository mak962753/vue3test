import {createApp } from 'vue' 

import App from './app.vue';
import Router from './router';
import routes from './routes'
import * as views from './components/views';
import * as common from './components/common';
import {addComponents} from "./shared/app-utils";

const app = createApp(App);

addComponents(app, views);
addComponents(app, common);
app.use(Router, routes);
app.mount('#app');


