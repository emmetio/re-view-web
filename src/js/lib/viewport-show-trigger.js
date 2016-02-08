/**
 * A controller for triggering element displaydepending on its visibility
 * in given (browser) viewport
 */
'use strict';

export default class ViewportShowTrigger {
	constructor(elem, show) {
		this.elem = elem;
		this._displayed = false;
		this._rect = null;
		this._showTimer = null;

		this.show = () => {
			if (!this._displayed) {
				this._displayed = true;
				show();
			}
		};
	}

	check(viewportRect) {
		if (this.shouldShow(viewportRect)) {
			this.scheduleShow();
		}
	}

	get rect() {
		if (!this._rect) {
			let r = this.elem.getBoundingClientRect();
			let dy = getScrollY();
			this._rect = {
				top: r.top + dy,
				bottom: r.bottom + dy,
				left: r.left,
				right: r.right
			};
		}
		return this._rect;
	}

	resetRect() {
		this._rect = null;
	}

	resetShowSchedule() {
		if (this._showTimer) {
			clearTimeout(this._showTimer);
			this._showTimer = null;
		}
	}

	scheduleShow() {
		this.resetShowSchedule();
		this._showTimer = setTimeout(this.show, 500);
	}

	shouldShow(viewportRect) {
		return overlappingRatio(this.rect, viewportRect) > 0.5;
	}
};

function isOverlap(rect1, rect2) {
	return rect1.top <= rect2.bottom && rect1.bottom >= rect2.top;
}

function overlappingRatio(slideRect, viewportRect) {
	if (isOverlap(slideRect, viewportRect)) {
		// calculate overlapping area
		var vpHeight = viewportRect.bottom - viewportRect.top;
		var slideHeight = slideRect.bottom - slideRect.top;
		var overlappingHeight = Math.min(slideRect.bottom, viewportRect.bottom)
			- Math.max(slideRect.top, viewportRect.top);

		return overlappingHeight / Math.min(vpHeight, slideHeight);
	}
	return 0;
}

function getScrollY() {
	return window.pageYOffset;
}
