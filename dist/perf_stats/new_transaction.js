import { UnifiedHandlerServer } from "../UnifiedHandlerServer.js";
var uhs = new UnifiedHandlerServer();
uhs.reset_but_env();
for (var i = 0; i < 400; i++) {
	uhs.new_transaction({
		new_thing_creator: () => ({
			type: "test",
			value: {
				name: "hamed",
				username: "hamedpro",
				lname: "yaghoutpour",
			},
		}),
		thing_id: undefined,
		user_id: 0,
	});
}
uhs.websocket_api.close();
uhs.restful_express_app.close();
