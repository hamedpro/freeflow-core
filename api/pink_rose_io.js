/* when saying db in functions parameters 
i mean result of MongoClient.db(string) */
import archiver from "archiver";
import fs, { rmSync } from "fs";
import path from "path";
import { ObjectId } from "mongodb";
import tar from "tar-fs";
import { build_units_downside_tree, order_not_guranteed_tree_members } from "./api_helpers.js";
import { pipeline } from "stream/promises";
import { simple_find_duplicates } from "../common_helpers.js";
export async function freeflow_export({ db, unit_context, unit_id, uploads_dir_path }) {
	var archive_filename = `${new Date().getTime()}-${unit_context}-${unit_id}`;
	var archive = archiver("tar");
	var output_stream = fs.createWriteStream(archive_filename + ".tar");
	archive.pipe(output_stream);

	//saving db documents of that tree in data.json file
	var tree = await build_units_downside_tree({ unit_context, unit_id, db });
	await archive.append(JSON.stringify(tree), { name: "data.json" });

	//saving connected uploaded files

	//todo keep its algo synced with new uploading related features
	//now we just include resources files

	var connected_files_ids = [];
	var tms = order_not_guranteed_tree_members(tree);
	tms.forEach((tree_member) => {
		if (tree_member.unit_context === "resources") {
			connected_files_ids.push(tree_member.self.file_id);
		}
	});
	fs.mkdirSync(archive_filename);
	var uploaded_file_names = fs.readdirSync(uploads_dir_path);
	connected_files_ids.forEach((file_id) => {
		var connected_file_name = uploaded_file_names.find((file_name) =>
			file_name.startsWith(file_id)
		);
		fs.copyFileSync(
			path.resolve(uploads_dir_path, connected_file_name),
			path.resolve(archive_filename, connected_file_name)
		);
	});

	archive.directory(archive_filename, "files");
	await archive.finalize();
	fs.rmSync(archive_filename, { force: true, recursive: true });
	return archive_filename + ".tar";
}
export async function freeflow_import({ db, source_file_path, files_destination_path }) {
	var random_string = Math.random().toString(36).slice(2);
	await pipeline(fs.createReadStream(source_file_path), tar.extract("./" + random_string));

	//console.log(source_file_path);
	//console.log(fs.readdirSync("."));

	//checking if existing files have name collision with incoming ones
	//if so we will throw an Error
	var existing_files = fs.readdirSync(files_destination_path);
	var incoming_files = fs.readdirSync(path.join(random_string, "./files"));

	if (simple_find_duplicates(existing_files, incoming_files).length !== 0) {
		//there is a duplicate in file name
		throw new Error("Aborted process <- there is at least one file name collision");
	}

	//checking whether inserting all incoming mongo db documents doesnt cause a collision or not
	//if so we will throw an Error
	var tms = order_not_guranteed_tree_members(
		JSON.parse(fs.readFileSync(path.join(random_string, "./data.json"), "utf8"))
	);
	for (var i = 0; i < tms.length; i++) {
		var { unit_context, self } = tms[i];
		if ((await db.collection(unit_context).findOne({ _id: new ObjectId(self._id) })) !== null) {
			throw new Error(
				"Aborted process <- there is at least one mongodb document _id collision"
			);
		}
	}

	//so there is not any collision
	//we start importing ->
	for (var i = 0; i < tms.length; i++) {
		var { unit_context, self } = tms[i];
		await db.collection(unit_context).insertOne({ ...self, _id: ObjectId(self._id) });
	}
	for (var incoming_file of incoming_files) {
		fs.cpSync(
			path.join(random_string, "./files", incoming_file),
			path.join(files_destination_path, incoming_file)
		);
	}
	rmSync(random_string, { force: true, recursive: true });
	//done !
}
