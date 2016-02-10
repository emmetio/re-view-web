import deviceWall from 'livestyle-re-view/lib/view/device-wall';
import breakpoints from 'livestyle-re-view/lib/view/breakpoints';
import likely from './vendor/likely';
import ViewportShowTrigger from './lib/viewport-show-trigger';

const demoUrl = '/demo/';
const deviceSpecs = [{
	"label": "Apple iPhone 5",
	"width": 320,
	"height": 568,
	"dpi": 2
}, {
    "label": "Apple iPhone 6",
    "width": 375,
    "height": 667,
    "dpi": 2
}, {
    "label": "Apple iPhone 6 Plus",
    "width": 414,
    "height": 736,
    "dpi": 3
}];

const breakpointSpecs = [
    {width: 320},
    {width: 360},
    {width: 400},
    {width: 720}
];


if (/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
	document.documentElement.classList.add('is-safari');
}

createBreakpointsView();
createDeviceWallView();

function createBreakpointsView() {
    var target = document.querySelector('#breakpoints');
    var specs = breakpointSpecs.map(spec => ({
        ...spec,
        height: '100%',
        resize: true
    }));

    var view = breakpoints(target, demoUrl, specs, {noScrollOverride: true});
    createShowController(target, view);
}

function createDeviceWallView() {
    var target = document.querySelector('#device-wall');
    var specs = deviceSpecs.map(spec => ({
        ...spec,
        usePageViewport: true
    }));

    var view = deviceWall(target, demoUrl, specs, {itemMargin: 30});
    createShowController(target, view);
}

function createShowController(elem, view) {
    var controller = new ViewportShowTrigger(elem, () => view.show());
	var check = () => controller.check(getViewport());
	window.addEventListener('scroll', check);
	window.addEventListener('resize', evt => {
		controller.resetRect();
		check();
	});
	check();
    return controller;
}

/**
 * Returns browser window viewport: a rect describing visible area of page
 * @return {Object}
 */
function getViewport() {
	return {
		top: window.pageYOffset,
		bottom: window.pageYOffset + window.innerHeight,
		left: window.pageXOffset,
		right: window.pageXOffset + window.innerWidth
	};
}
