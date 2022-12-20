var crypto = require("crypto");
var mysql = require("mysql");
require("dotenv").config();

var arr_last_item = (arr) => {
	return arr[arr.length - 1];
};

var hash_sha_256_hex = (input) => crypto.createHash("sha256").update(input).digest("hex");

function build_pyramid(data_array, identifier_prop_name = "id", parent_prop_name = "parent") {
	function calc_children(identifier) {
		if (data_array.filter((item) => item[parent_prop_name] === identifier).length === 0) {
			return undefined;
		} else {
			return data_array
				.filter((item) => item[parent_prop_name] === identifier)
				.map((item) => {
					var tmp = { children: calc_children(item[identifier_prop_name]) };
					tmp[identifier_prop_name] = item[identifier_prop_name];
					return tmp;
				});
		}
	}
	var pyramid = {};
	(pyramid[identifier_prop_name] = data_array.find((item) => item[parent_prop_name] === null)[
		identifier_prop_name
	]),
		(pyramid.children = calc_children(
			data_array.find((item) => item[parent_prop_name] === null)[identifier_prop_name]
		));

	return pyramid;
}
var pretty_stringify = (input) => JSON.stringify(input, null, 4);
function gen_verification_code() {
	return Math.floor(100000 + Math.random() * 900000);
}
function is_there_any_conflict({ start, end, items }) {
	//what it does : it checks whether there is any conflicts between that range and any of those items or not
	//items is an array of items that contain start_date and end_date (both are unix timestamps)
	//range is an object of 2 unix timestamps : {start : number,end : number}
	return (
		/* todo make sure about this function 
		(conflict_situations are completely tested) */
		/* note if end of one task or event is equal to 
		start of the next one we do not consider it as a conflict 
		(todo make sure this rule is respected everywhere)*/
		items.filter((item) => {
			item_start = item.start_date;
			item_end = item.end_date;
			var possible_conflicts = [
				/* 	these are situations that if an
					item has we undertand that it has
					conflict with that range
					first item of each of these is related to start_date of item
					and second item is related to end_date of item
					so ["before", "in"] means start_date of item is smaller than start of range
					and also that "in" means (range_start < end_date < range_end) 

					** help understanding :
					each range is imagined like this : before---start---in---end---after
				  	and each item_start or item_end is either in one of these 5 places
				*/
				{ situation: ["before", "in"], bool: item_start < start && start<item_end && item_end< end },
				{ situation: ["before", "end"], bool: item_start < start && item_end === end },
				{ situation: ["before", "after"], bool: item_start < start && item_end > end },
				{ situation: ["start", "in"], bool: item_start === start && start < item_end  && item_end< end },
				{ situation: ["start", "end"], bool: item_start === start && item_end === end },
				{ situation: ["start", "after"], bool:  item_start === start && item_end > end },
				{ situation: ["in", "in"], bool: start < item_start && item_start < end && start < item_end && item_end < end },
				{ situation: ["in", "end"], bool:  start < item_start && item_start < end &&   item_end === end  },
				{ situation: ["in", "after"], bool: start < item_start && item_start < end && item_end > end  },
			];
			var conflicts = possible_conflicts.filter((i) => i.bool)
			if (conflicts.length !== 0) {
				//console.log(JSON.stringify({ item, situation: conflicts.map(i => i.situation) }))
				return true;
			} else {
				return false
			}
		}).length !== 0
	);
}
module.exports = {
	arr_last_item,
	hash_sha_256_hex,
	pretty_stringify,
	build_pyramid,
	gen_verification_code,
	is_there_any_conflict,
};
