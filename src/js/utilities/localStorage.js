/**
 * @param {Object} options
 * @param {String} options.key
 * @param {Any} options.value
 * @param {Number}
 * @returns {void}
 */
export const saveToLocalStorage = ({ key, value, expirationDays }) => {
    // Try for localStorage support...
    try {
        // Convert days to milliseconds (ms)
        const expirationMS = expirationDays * 24 * 60 * 60 * 1000;
        const record = {
            value: JSON.stringify(value),
            timestamp: new Date().getTime() + expirationMS
        };

        localStorage.setItem(key, JSON.stringify(record));
    } catch (e) {
        console.warn(e);
    }
};

/**
 * @param {String} key
 * @returns {(Object|void)}
 */
export const fetchFromLocalStorage = key => {
    // Try for localStorage support...
    try {
        const record = JSON.parse(localStorage.getItem(key));

        // Return the record if it exists & its timestamp has not expired
        if (record && new Date().getTime() < record.timestamp) {
            return JSON.parse(record.value);
        }

        return undefined;
    } catch (e) {
        console.warn(e);
        return undefined;
    }
};
