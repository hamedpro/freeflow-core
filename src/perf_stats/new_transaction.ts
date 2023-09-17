import { UnifiedHandlerServer } from "../UnifiedHandlerServer";
import { perf_profiler } from "../performance_profiler";

var new_transaction_profiler = new perf_profiler();
new_transaction_profiler.init_new_stat(
	"new_transaction_before_optimisation",
	"current transactions count",
	"time spent"
);
var uhs = new UnifiedHandlerServer();
uhs.reset_but_env();

for (var i = 0; i < 300; i++) {
	var point = new_transaction_profiler.new_point(
		"new_transaction_before_optimisation",
		uhs.transactions.length
	);
	point.start();
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
	point.end();
}
uhs.websocket_api.close();
uhs.restful_express_app.close();
new_transaction_profiler.commit();
