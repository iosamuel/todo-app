import Vue from 'nativescript-vue';
import Home from './components/Home';
const firebase = require("nativescript-plugin-firebase");

// Uncommment the following to see NativeScript-Vue output logs
// Vue.config.silent = false;

const $bus = new Vue({});

firebase.init({
    persist: true
}).then(
    function () {
        $bus.$emit("firebase:initialized");
        console.log("firebase.init done");
    },
    function (error) {
        console.log("firebase.init error: " + error);
    }
);
Vue.prototype.$firebase = firebase;
Vue.prototype.$bus = $bus;

new Vue({

    template: `
        <Frame>
            <Home />
        </Frame>`,

    components: {
        Home
    }
}).$start();
