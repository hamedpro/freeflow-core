import rdiff from "recursive-diff";
var a = rdiff.getDiff([{ name: "hamed" }], [{ name: "hamed" }, { name: "negin" }]);
console.log(a);
