import { custom_find_unique } from "../common_helpers.js";

console.log(
	custom_find_unique(
		[{ name: "hamed" }, { name: "negin" }, { name: "hamed" }],
		(thing1, thing2) => thing1.name === thing2.name
	)
);
