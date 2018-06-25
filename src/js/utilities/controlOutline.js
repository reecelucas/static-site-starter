// Modified Outline.js: https://github.com/lindsayevans/outline.js

const head = document.getElementsByTagName('HEAD')[0];
const styleElem = document.createElement('STYLE');

// Inserts style string in the injected `<style>` tag
const setCss = cssString => {
    styleElem.innerHTML = cssString;
};

const removeFocusState = () => {
    setCss(':focus{outline:0;}::-moz-focus-inner{border:0;}');
};

const restoreFocusState = () => {
    setCss('');
};

export default () => {
    head.appendChild(styleElem);
    /**
     * Use `mousedown` instead of `mouseover`, so that previously focused
     * elements don't lose focus ring on mouse move
     */
    document.addEventListener('mousedown', removeFocusState);
    document.addEventListener('keydown', restoreFocusState);
}
