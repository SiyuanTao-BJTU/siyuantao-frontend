# GoodsExchangeFrontend
 A second-hand goods trading platform on campus, front end based on Vue.js
## Project File Structure
- `GoodsExchangeFrontend` is the root directory of the project
  - `cache` is the cache directory for downloaded electron packaging tool
  - `dist` is the directory where the packaged files are stored. Note that this is the result of the web application packaging, not the electron desktop application packaging! That is, this folder is the output folder of `npm run build`
  - `electron` is the directory where the electron desktop application build files are stored
  - `node_modules` is the directory where the node.js module is stored
  - `public` is the directory where the static files are stored
    - `app` is the directory where the electron desktop application installation package is stored
  - `src` is the source code directory
    - `assets` is the directory where the static resources are stored
    - `axios_client` is the directory where stores the encapsulated axios object
    - `components` is the directory where the Vue component is stored
    - `router` is the directory where the Vue router is stored
    - `socket_client` is the directory where the encapsulated WebSocketService object is stored
    - `store` is the directory where the Vuex store is stored
    - `utils` is the directory where the utility functions are stored
    - `views` is the directory where the_ Vue page is stored
    - `vue-i18n` is the directory where the internationalization configuration is stored
    - `App.vue` is the entry file of the Vue application
    - `main.js` is the main file of the Vue application
  - `release` is the directory where the packaged files are stored. Note that this is the result of the electron desktop application packaging, not the web application packaging!
  - `.gitignore` is the configuration file for git
  - `index.html` is the entry file of the web application
  - `package.json` is the configuration file for the node.js module
  - `jsconfig.json` is the configuration file for the JavaScript language service
  - `vite.config.js` is the configuration file for the Vite build tool
  - `.editDist.js` is the script file for the packaging
## Project Setup
First, you can pull up our code repository via Github(https://github.com/GoodsExchangeSCNU/GoodsExchangeFrontend).

Under the GoodsExchangeFrontend repository, you can install the necessary node.js dependencies by executing the following command
``` 
npm install
```

After successfully installing the dependencies, you are ready to start our service by running the project with the following command
```
npm run dev
```

If you want to package our application and deploy it, we offer two packaging options, which can be packaged as a Web application and a Windows desktop application 
### Packaging as a Web application
   You can package front-end applications directly from build scripts
```
npm run build
```

Once you have completed the above steps, the /dist folder is the complete packaged front-end file that you can deploy to the server

### Packaging as a Windows desktop application

Due to the automatic packaging command `npm run build:desktop` provided by npm, it is not suitable for the packaging of this project. To do this, we wrote a packaging script, `editDist.js`, which we can run to package the application as a Windows desktop application

If you are in China Mainland, the download may fail when you run the command. In this case, run the following command to download cnpm instead.
```
npm install cnpm
cnpm install
```
If the download still fails or is too slow, you can copy the link from the control terminal to the browser, download the compressed package, and save it to the `/cache` directory.

### Backend Service Configuration

If you need to modify the front-end application request address, you can edit `backend.config.js` file to modify the content of the backend address
```javascript
const BackendConfig = {
  BASIC_URL: 'http://www.goods-exchange.io', // The basic URL of the backend service
  RESTFUL_API_URL: 'http://www.goods-exchange.io/api', // The URL of the RESTful API
  WebSocket_URL: 'ws://www.goods-exchange.io/ws/chat' // The URL of the WebSocket service
}

export default BackendConfig
```

Thanks For Your Attention!