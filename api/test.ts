/* import { UnifiedHandlerDB } from "./UnifiedHandler.js";

import rdiff from "recursive-diff";
var { applyDiff, getDiff } = rdiff;

var test = new UnifiedHandlerDB({
	onChange: (transaction) => {
		console.log("new transaction : ", transaction);
	},
});
console.log(test.surface_cache);
 */
function say_hello<T>: T 
var a = say_hello<string>
a