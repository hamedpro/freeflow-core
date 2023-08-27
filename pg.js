import { execSync } from "child_process"
import { readFileSync } from "fs"
var component_names = JSON.parse(
    readFileSync("./component_names.json", "utf-8")
)
var issues = JSON.parse(
    execSync(
        "gh issue list --json labels,title,number,closed --limit=400"
    ).toString()
)
for (var component_name of component_names) {
    var tmp = issues.find((issue) => issue.title === component_name)
    if (tmp !== undefined) {
        if (tmp.closed === true) {
            execSync(
                `gh issue reopen ${tmp.number} -c "this component was reopened to pass new development progress"`
            )
        }
    } else {
        execSync(`gh issue create --label component --title ${component_name}`)
    }
}
