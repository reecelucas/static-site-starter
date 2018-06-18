import 'fontfaceobserver';
import { saveToLocalStorage } from './utilities/localStorage';

const loadedClass = 'fonts-loaded';
const fontA = new window.FontFaceObserver('Work Sans', { weight: 300 });
const fontB = new window.FontFaceObserver('Work Sans', { weight: 400 });
const fontC = new window.FontFaceObserver('Work Sans', { weight: 600 });

Promise.all([
    fontA.load(null, 5000),
    fontB.load(null, 5000),
    fontC.load(null, 5000)
])
    .then(() => {
        document.documentElement.className += ` ${loadedClass}`;
        saveToLocalStorage({
            key: loadedClass,
            value: true,
            expirationDays: 364
        });
    })
    .catch(console.warn);
