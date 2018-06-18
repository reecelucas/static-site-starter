import {
    fetchFromLocalStorage,
    saveToLocalStorage
} from './utilities/localStorage';

const html = document.documentElement;
const loadedClass = 'fonts-loaded';
const record = fetchFromLocalStorage(loadedClass);

function addLoadedClass() {
    html.className += ` ${loadedClass}`;
}

if (record) {
    addLoadedClass();
} else if ('fonts' in document) {
    Promise.all([
        document.fonts.load("300 1em 'Work Sans'"),
        document.fonts.load("400 1em 'Work Sans'"),
        document.fonts.load("600 1em 'Work Sans'")
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
    const script = document.createElement('script');
    script.src = 'js/font-loading-fallback.js';
    script.async = true;
    document.head.appendChild(script);
}
