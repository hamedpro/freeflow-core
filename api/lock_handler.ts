export class LockHandler {
	lock: Promise<any> | undefined;
	use_lock(func: Function) {
		var tmp = async () => {
			if (this.lock !== undefined) {
				await this.lock;
			}
			await func();
		};
		return (this.lock = tmp());
	}
}
