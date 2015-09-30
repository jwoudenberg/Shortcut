export default function createInMemoryStore (name) {
    const store = {};

    function get (key) {
        return Promise.resolve(store[key]);
    }

    function set (key, value, options = {}) {
        const { overwrite = true } = options;
        if (!overwrite && store[key]) {
            throw new Error(`[${name} store] Now allowed to overwrite key: ${key}`);
        }
        store[key] = value;
        return Promise.resolve(null);
    }

    return { set, get };
}
