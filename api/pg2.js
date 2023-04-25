class Test {
	constructor() {
		this.method2();
	}
	async method1() {
		console.log(this);
	}
	async method2() {
		this.method1();
	}
}
new Test();
