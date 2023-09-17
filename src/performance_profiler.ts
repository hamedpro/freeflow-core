import { homedir } from "os";
import path from "path";
import { writeFileSync, mkdirSync, readFileSync, existsSync } from "fs";

export type snapshot = { time: number; xs: number[]; ys: number[] };
export type stats = {
	[stat_title: string]: {
		x_title?: string;
		y_title?: string;
		snapshots: snapshot[];
	};
};
export var stats: stats = {
	new_transaction: {
		x_title: "current transactions count",
		y_title: "new_transaction time",
		snapshots: [],
	},
};
export class performance_profile {
	store_path = path.join(homedir(), "stats.json");
	xs: number[] = [];
	ys: number[] = [];
	stat_title: string;
	x_title?: string;
	y_title?: string;
	tmp_timestamp: number = 0;

	constructor(stat_title: string, x_title?: string, y_title?: string) {
		if (existsSync(this.store_path) === false) {
			writeFileSync(this.store_path, JSON.stringify({}));
		}
		this.stat_title = stat_title;
		this.x_title = x_title;
		this.y_title = y_title;
	}
	commit() {
		var stats: stats = JSON.parse(readFileSync(this.store_path, "utf-8"));
		if (Object.keys(stats).includes(this.stat_title) === false) {
			stats[this.stat_title] = {
				x_title: this.x_title,
				y_title: this.y_title,
				snapshots: [],
			};
		}
		stats[this.stat_title].snapshots.push({
			xs: this.xs,
			ys: this.ys,
			time: new Date().getTime(),
		});
		writeFileSync(this.store_path, JSON.stringify(stats));
	}
	new_point(x: number, y: number) {
		this.xs.push(x);
		this.ys.push(y);
	}
	start_point(x: number) {
		this.xs.push(x);
		this.tmp_timestamp = performance.now();
	}
	end_point() {
		this.ys.push(performance.now() - this.tmp_timestamp);
		console.log(`point was added => x : ${this.xs.at(-1)}, y : ${this.ys.at(-1)}`);
	}
}
