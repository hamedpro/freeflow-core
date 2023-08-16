/* when saying db in functions parameters 
i mean result of MongoClient.db(string) */
import archiver from "archiver"
import fs from "fs"
import os from "os"
import path from "path"
import { profile_seed, thing, transaction } from "./UnifiedHandler_types"
export async function export_backup({
    included_files,
    all_transactions,
    initial_values,
    user_id,
}: {
    included_files: number[]
    all_transactions: transaction[]
    initial_values: thing[]
    user_id: number
}) {
    var archive_filename = `${new Date().getTime()}-${user_id}.tar`
    var archive = archiver("tar")
    var output_stream = fs.createWriteStream(archive_filename)
    archive.pipe(output_stream)

    archive.append(JSON.stringify(all_transactions), {
        name: "all_transactions.json",
    })
    archive.append(JSON.stringify(initial_values), {
        name: "initial_values.json",
    })
    var filenames = fs.readdirSync(
        path.join(os.homedir(), ".freeflow_data/uploads")
    )
    var files = filenames.map((filename) => ({
        absolute_path: path.resolve(
            os.homedir(),
            ".freeflow_data/uploads",
            filename
        ),
        filename,
    }))

    for (var file of files) {
        if (included_files.includes(Number(file.filename.split("-")[0]))) {
            archive.file(file.absolute_path, { name: `files/${file.filename}` })
        }
    }

    await archive.finalize()
    return archive_filename
}
