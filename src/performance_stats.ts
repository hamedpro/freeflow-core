import { UnifiedHandlerServer } from "./UnifiedHandlerServer";
import { performance_profile } from "./performance_profiler";

var p = new performance_profile(
	"new_transaction",
	"current transactions count",
	"new transaction time"
);
var uhs = new UnifiedHandlerServer();
uhs.reset_but_env();
for (var i = 0; i < 300; i++) {
	p.start_point(uhs.transactions.length);
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
	p.end_point();
}
uhs.websocket_api.close();
uhs.restful_express_app.close();
p.commit();
