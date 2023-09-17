import { homedir } from "os";
import path from "path";
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "fs";

export type snapshot = { time: number; xs: number[]; ys: number[] };
export type stats = {
	[stat_title: string]: {
		x_title?: string;
		y_title?: string;
		xs: number[];
		ys: number[];
	};
};
export class point {
	identifier: string;
	tmp_timestamp?: number;
	duration?: number;
	perf_profiler: perf_profiler;
	x: number;
	constructor(perf_profiler: perf_profiler, identifier: string, x: number) {
		this.identifier = identifier;
		this.perf_profiler = perf_profiler;
		this.x = x;
	}
	start() {
		this.tmp_timestamp = performance.now();
	}
	end() {
		if (this.tmp_timestamp === undefined) throw "this point has not started yet";
		this.duration = performance.now() - this.tmp_timestamp;

		this.perf_profiler.stats[this.identifier].xs.push(this.x);
		this.perf_profiler.stats[this.identifier].ys.push(this.duration);
		console.log(`new point was pushed => x : ${this.x}, y : ${this.duration}`);
	}
}
export class perf_profiler {
	store_path = path.join(homedir(), "stats.json");
	tmp_timestamp: number = 0;
	stats: stats;
	constructor() {
		if (existsSync(this.store_path) === false) {
			writeFileSync(this.store_path, JSON.stringify({}));
		}
		this.stats = JSON.parse(readFileSync(this.store_path, "utf-8"));
	}
	init_new_stat(identifier: string, x_title: string, y_title: string) {
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
	new_point(identifier: string, x: number) {
		return new point(this, identifier, x);
	}
}
