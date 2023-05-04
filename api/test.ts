import { UnifiedHandlerDB } from "./UnifiedHandler.js";

import rdiff from "recursive-diff";
var { applyDiff, getDiff } = rdiff;

var test = new UnifiedHandlerDB({
	onChange: (transaction) => {
		console.log("new transaction : ", transaction);
	},
});
/* 
test.new_transaction({
	diff: getDiff({}, { username: "vahidpro", password: "vahid1378" }),
	thing_id: 2,
}); */
console.log(test.surface_cache);
