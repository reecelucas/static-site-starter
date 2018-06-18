import {
    fetchFromLocalStorage,
    saveToLocalStorage
} from './utilities/localStorage';

const d = document;
const html = d.documentElement;
const loadedClass = 'fonts-loaded';
const record = fetchFromLocalStorage(loadedClass);

function addLoadedClass() {
    html.className += ` ${loadedClass}`;
}

if (record) {
    addLoadedClass();
} else if ('fonts' in d) {
    Promise.all([
        d.fonts.load("300 1em 'Work Sans'"),
        d.fonts.load("400 1em 'Work Sans'"),
        d.fonts.load("600 1em 'Work Sans'")
    ])
        .then(() => {
            addLoadedClass();
            saveToLocalStorage({
                key: loadedClass,
                value: true,
                expirationDays: 364
            });
        })
        .catch(console.warn);
} else {
    const script = d.createElement('script');
    script.src = 'js/font-loading-fallback.js';
    script.async = true;
    d.head.appendChild(script);
}
