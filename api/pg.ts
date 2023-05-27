import { transaction } from "./UnifiedHandler_types.js";
import rdiff from "recursive-diff";
import { resolve_thing, calc_cache, calc_unresolved_cache } from "./utils.js";
var transactions: transaction[] = [];
transactions.push(
	{
		id: 1,
		thing_id: 1,
		diff: rdiff.getDiff(
			{},
			{ type: "user", value: { username: "hamedpro", $password: "$$ref::2" } }
		),
		user_id: undefined,
		time: new Date().getTime(),
	},
	{
		id: 2,
		thing_id: 2,
		diff: rdiff.getDiff({}, { type: "user_credentials", value: { password: "hamed" } }),
		user_id: undefined,
		time: new Date().getTime(),
	}
);
console.log(JSON.stringify(calc_cache(transactions, undefined), undefined, 4));
