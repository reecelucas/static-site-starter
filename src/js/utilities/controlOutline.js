// Modified Outline.js: https://github.com/lindsayevans/outline.js
const d = document;
const head = d.getElementsByTagName('HEAD')[0];
const styleElem = d.createElement('STYLE');

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

export default function controlOutline() {
    head.appendChild(styleElem);
    /**
     * Use `mousedown` instead of `mouseover`, so that previously focused
     * elements don't lose focus ring on mouse move
     */
    d.addEventListener('mousedown', removeFocusState);
    d.addEventListener('keydown', restoreFocusState);
}
