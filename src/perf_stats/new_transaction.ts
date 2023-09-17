import { UnifiedHandlerServer } from "../UnifiedHandlerServer";
import { perf_profiler } from "../performance_profiler";

var uhs = new UnifiedHandlerServer();
uhs.reset_but_env();

for (var i = 0; i < 300; i++) {
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
