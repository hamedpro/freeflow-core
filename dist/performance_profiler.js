import { homedir } from "os";
import path from "path";
import { writeFileSync, readFileSync, existsSync } from "fs";
export class point {
    constructor(perf_profiler, identifier, x) {
        this.auto_commit = false;
        this.identifier = identifier;
        this.perf_profiler = perf_profiler;
        this.x = x;
    }
    start() {
        this.tmp_timestamp = performance.now();
    }
    end() {
        if (this.tmp_timestamp === undefined)
            throw "this point has not started yet";
        this.duration = performance.now() - this.tmp_timestamp;
        this.perf_profiler.stats[this.identifier].xs.push(this.x);
        this.perf_profiler.stats[this.identifier].ys.push(this.duration);
        console.log(`new point was pushed => x : ${this.x}, y : ${this.duration}`);
        if (this.auto_commit === true)
            this.perf_profiler.commit();
    }
}
export class perf_profiler {
    constructor() {
        this.store_path = path.join(homedir(), "stats.json");
        this.tmp_timestamp = 0;
        if (existsSync(this.store_path) === false) {
            writeFileSync(this.store_path, JSON.stringify({}));
        }
        this.stats = JSON.parse(readFileSync(this.store_path, "utf-8"));
    }
    init_new_stat(identifier, x_title, y_title) {
        if (Object.keys(this.stats).includes(identifier) === false) {
            this.stats[identifier] = {
                x_title: x_title,
                y_title: y_title,
                xs: [],
                ys: [],
            };
        }
    }
    commit() {
        writeFileSync(this.store_path, JSON.stringify(this.stats));
    }
    new_point(identifier, x) {
        return new point(this, identifier, x);
    }
}
