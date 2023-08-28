var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/* when saying db in functions parameters
i mean result of MongoClient.db(string) */
import archiver from "archiver";
import fs from "fs";
import os from "os";
import path from "path";
export function export_backup({ included_files, all_transactions, initial_values, user_id, }) {
    return __awaiter(this, void 0, void 0, function* () {
        var archive_filename = `${new Date().getTime()}-${user_id}.tar`;
        var archive = archiver("tar");
        var output_stream = fs.createWriteStream(archive_filename);
        archive.pipe(output_stream);
        archive.append(JSON.stringify(all_transactions), {
            name: "all_transactions.json",
        });
        archive.append(JSON.stringify(initial_values), {
            name: "initial_values.json",
        });
        var filenames = fs.readdirSync(path.join(os.homedir(), ".freeflow_data/uploads"));
        var files = filenames.map((filename) => ({
            absolute_path: path.resolve(os.homedir(), ".freeflow_data/uploads", filename),
            filename,
        }));
        for (var file of files) {
            if (included_files.includes(Number(file.filename.split("-")[0]))) {
                archive.file(file.absolute_path, { name: `files/${file.filename}` });
            }
        }
        yield archive.finalize();
        return archive_filename;
    });
}
