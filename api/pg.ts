import rdiff from "recursive-diff";

var a = { thing_id: 22, thing: { username: "hamedpro", password: "hamedpro@82H" } };
var b = { thing_id: 22, thing: { username: "neginpro", password: "neginpro@76N" } };

console.log(rdiff.getDiff(a, b));
