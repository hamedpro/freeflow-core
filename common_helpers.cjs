function is_there_any_conflict({ start, end, items }) {
	//what it does : it checks whether there is any conflicts between that range and any of those items or not
	//items is an array of items that contain start_date and end_date (both are unix timestamps)
	//range is an object of 2 unix timestamps : {start : number,end : number}
	//todo instead of working on items, deep clone it first and work on that becuse may that change while filtering
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
				{
					situation: ["before", "in"],
					bool: item_start < start && start < item_end && item_end < end,
				},
				{ situation: ["before", "end"], bool: item_start < start && item_end === end },
				{ situation: ["before", "after"], bool: item_start < start && item_end > end },
				{
					situation: ["start", "in"],
					bool: item_start === start && start < item_end && item_end < end,
				},
				{ situation: ["start", "end"], bool: item_start === start && item_end === end },
				{ situation: ["start", "after"], bool: item_start === start && item_end > end },
				{
					situation: ["in", "in"],
					bool:
						start < item_start &&
						item_start < end &&
						start < item_end &&
						item_end < end,
				},
				{
					situation: ["in", "end"],
					bool: start < item_start && item_start < end && item_end === end,
				},
				{
					situation: ["in", "after"],
					bool: start < item_start && item_start < end && item_end > end,
				},
			];
			var conflicts = possible_conflicts.filter((i) => i.bool);
			if (conflicts.length !== 0) {
				//console.log(JSON.stringify({ item, situation: conflicts.map(i => i.situation) }))
				return true;
			} else {
				return false;
			}
		}).length !== 0
	);
}

module.exports = {is_there_any_conflict}