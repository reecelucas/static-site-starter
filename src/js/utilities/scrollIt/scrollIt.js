import easingFunctions from './easingFunctions';

const html = document.documentElement;
const { body } = document;

// Modified from: https://pawelgrzybek.com/page-scroll-in-vanilla-javascript/
export default ({
    destination,
    duration = 400,
    easing = 'linear',
    callback
}) => {
    // Store initial scroll position and time
    const start = window.pageYOffset;
    const startTime = new Date().getTime();

    // Calculate the max scrollable value
    const docHeight = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
    );

    const winHeight =
        window.innerHeight ||
        html.clientHeight ||
        document.getElementsByTagName('body')[0].clientHeight;

    const destinationOffsetToScroll = Math.round(
        docHeight - destination < winHeight
            ? docHeight - winHeight
            : destination
    );

    // If `requestAnimationFrame` is not supported...
    if (!('requestAnimationFrame' in window)) {
        window.scrollTo(0, destinationOffsetToScroll);

        if (callback && typeof callback === 'function') {
            callback();
        }

        return;
    }

    function scroll() {
        const scrollY = window.pageYOffset;
        const now = new Date().getTime();
        const time = Math.min(1, (now - startTime) / duration);
        const easingFunc = easingFunctions[easing](time);

        window.scroll(
            0,
            Math.ceil(easingFunc * (destinationOffsetToScroll - start) + start)
        );

        // We've reached our destination...
        if (scrollY === destinationOffsetToScroll) {
            if (callback && typeof callback === 'function') {
                callback();
            }

            return;
        }

        requestAnimationFrame(scroll);
    }

    scroll();
};
