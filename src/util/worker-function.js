const work = require('webworkify');

function createWorker(module) {
    let worker = work(module);
    return wrapWorker(worker);
}

function wrapWorker(worker) {
    let incrementalId = 0;
    let callbackMap = {};
    worker.addEventListener('message', function onMessage(message) {
        var { requestId, result, error } = message.data;
        return callbackMap[requestId](error, result);
    });
    return function callWorker(...args) {
        let requestId = incrementalId++;
        worker.postMessage({ requestId, args });
        return new Promise(function promise(resolve, reject) {
            callbackMap[requestId] = function onResult(error, result) {
                callbackMap[requestId] = undefined;
                if (error) {
                    return reject(error);
                }
                resolve(result);
            };
        });
    };
}

module.exports = createWorker;
