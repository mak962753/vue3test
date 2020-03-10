import * as views from '../components/views';
import {Route} from '../router';

const routes = {
    routes: [
        {path: '', name: 'home', component: views.Home},
        {path: '/', name: 'home', component: views.Home},
        {path: '/about', name: 'about', component: views.About},
        {path: '/todos', name: 'todos', component: views.Todos},
        {path: '/scene', name: 'scene', component: views.Scene}
    ] as Route[]
};

export default routes;