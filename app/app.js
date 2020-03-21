import Vue from 'nativescript-vue';
import Home from './components/Home';
const firebase = require("nativescript-plugin-firebase");

// Uncommment the following to see NativeScript-Vue output logs
// Vue.config.silent = false;
firebase.init({
    persist: true
}).then(
    function () {
        console.log("firebase.init done");
    },
    function (error) {
        console.log("firebase.init error: " + error);
    }
);
Vue.prototype.$firebase = firebase;

new Vue({

    template: `
        <Frame>
            <Home />
        </Frame>`,

    components: {
        Home
    }
}).$start();
