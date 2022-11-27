import { build_pyramid } from "./common.cjs";
import fs from "fs";
var array = [
	{
		parent1: null,
		id1: "shokri",
	},
	{
		parent1: "shokri",
		id1: "mahmoud",
	},
	{
		parent1: "shokri",
		id1: "mohammad",
	},
	{
		parent1: "mohammad",
		id1: "seta",
	},
	{
		parent1: "mohammad",
		id1: "nia",
	},
];
var py = build_pyramid(array,"id1",'parent1');
fs.writeFileSync("./pyramid.json", JSON.stringify(py, null, 4));
