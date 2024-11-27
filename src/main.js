import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import './assets/styles';
import router from './router';
import FontAwesomeIcon from './plugins/font-awesome';

const app = createApp(App);

app.use(router); // Use the router in the app
app.component('font-awesome-icon', FontAwesomeIcon);
app.mount('#app');
