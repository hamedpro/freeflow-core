import { ObjectId } from "mongodb";

export async function find_tree_summit({ unit_context, unit_id, db }) {
	//unit_context can be any unit : packs , resources , ...
	var cursor = { unit_context, unit_id };

	while (true) {
		tmp = await db.collection(cursor.unit_context).findOne({ _id: ObjectId(unit_id) });
		if (tmp.pack_id) {
			cursor = { unit_context: "packs", unit_id: tmp.pack_id };
		} else {
			break;
		}
	}
	return cursor;
}
export async function build_units_downside_tree({ unit_context, unit_id, db }) {
	//this tree format must be standard one in entire application

	//if unit_context is "packs" returns an object like this :
	/*
        {
            unit_context : "packs",
            self : {db document of this pack},
            packs : [map of result of this function for each direct pack of that pack ],
            events : [direct events of this pack each one maped to result of this function ],
            ... the same for other remained units 
        }
    */
	/* else returns something in this format : 
        {
            unit_context : string ,
            self : that db document 
        } 
    */

	if (unit_context === "packs") {
		var tmp = {
			unit_context: "packs",
			self: JSON.parse(
				JSON.stringify(await db.collection("packs").findOne({ _id: ObjectId(unit_id) }))
			),
			packs: [],
		};

		for (var i of (await db.collection("packs").find({ pack_id: unit_id }).toArray()).map(
			(doc) => ({ ...doc, _id: doc._id.toString() })
		)) {
			tmp.packs.push(
				await build_units_downside_tree({
					unit_id: i._id,
					unit_context: "packs",
					db,
				})
			);
		}

		for (var i of ["resources", "notes", "tasks", "events"]) {
			tmp[i] = await Promise.all(
				(await db.collection(i).find({ pack_id: unit_id }).toArray())
					.map((doc) => ({ ...doc, _id: doc._id.toString() }))
					.map((j) => build_units_downside_tree({ unit_context: i, unit_id: j._id, db }))
			);
		}

		return tmp;
	} else {
		return {
			unit_context,
			self: JSON.parse(
				JSON.stringify(
					await db.collection(unit_context).findOne({ _id: ObjectId(unit_id) })
				)
			),
		};
	}
}
export function order_not_guranteed_tree_members(tree) {
	//returns an array of objects like this : [{unit_context : string , self : db document object}]
	//its name means order of tree members is not guranteed
	var results = [];
	function tmp(tree_level) {
		results.push({ unit_context: tree_level.unit_context, self: tree_level.self });
		if (tree_level.unit_context === "packs") {
			results = results.concat(
				tree_level.events,
				tree_level.resources,
				tree_level.tasks,
				tree_level.notes
			);
			tree_level.packs.forEach(tmp);
		}
	}
	tmp(tree);
	return results;
}
export function iterate_over_tree_members(tree, handler_function) {
	//executes handler_function once for each tree member
	//handler_function will be called each time with first parameter set to one of
	//items of result of "order_not_guranteed_tree_members" of that tree
	order_not_guranteed_tree_members(tree).forEach(handler_function);
}
