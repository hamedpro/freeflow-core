import { UnifiedHandlerServer } from "./UnifiedHandlerServer";
var uhs = new UnifiedHandlerServer();
console.log(uhs.cache.length);
uhs.websocket_api.close();
uhs.restful_express_app.close();
