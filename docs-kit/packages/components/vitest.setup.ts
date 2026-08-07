/**
 * jsdom does not implement the `<dialog>` top layer, so `showModal` and `close` are
 * polyfilled for tests. Browsers provide the real behaviour, including focus trapping.
 */
if (typeof HTMLDialogElement !== 'undefined' && !HTMLDialogElement.prototype.showModal) {
	HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
		this.open = true;
	};
	HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
		this.open = false;
		this.dispatchEvent(new Event('close'));
	};
}
