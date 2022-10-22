var arr_last_item = require("./common.cjs").arr_last_item;
var formidable = require("formidable");
var fs = require("fs");
var debug_mode = false;
function custom_upload({
	req,
	files_names, // array with struc like this : ["file1","file2"]
	uploadDir = "./",
	onSuccess = () => {},
	onReject = () => {},
}) {
	/* 	
		body should contain a form with files appended to it 
		the path should contain the other required parameters like relative_path as its query parameters
	*/
	if(!fs.existsSync(uploadDir)){
		fs.mkdirSync(uploadDir);
	}
	var form = formidable({ uploadDir });
	form.parse(req, (err, fields, files) => {
		//todo catch errors
		if (debug_mode) console.log(files);
		let has_error = false;
		Object.keys(files).forEach((file, index) => {
			var to;
			if (!uploadDir.endsWith("/")) {
				uploadDir += "/";
			}
			if (debug_mode) console.log(uploadDir);
			to =
				uploadDir +
				files_names[index] +
				"." +
				arr_last_item(files[file]["originalFilename"].split("."));
			var from = files[file]["filepath"];
			try {
				if (debug_mode) console.log(`renaming sync from ${from} to ${to}`);
				fs.renameSync(from, to);
			} catch (e) {
				has_error = true;
				onReject(e);
			}
		});
		if (!has_error) onSuccess();
	});
}
module.exports = {
	custom_upload,
};
