import 'fontfaceobserver';
import { saveToLocalStorage } from './utilities/localStorage';

const w = window;
const loadedClass = 'fonts-loaded';
const fontA = new w.FontFaceObserver('Work Sans', { weight: 300 });
const fontB = new w.FontFaceObserver('Work Sans', { weight: 400 });
const fontC = new w.FontFaceObserver('Work Sans', { weight: 600 });

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
