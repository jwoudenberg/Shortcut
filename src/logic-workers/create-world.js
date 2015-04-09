var createWorld = require('../logic/create-world');

module.exports = function worker(self) {
    self.addEventListener('message', function onMessage(message) {
        var { args, requestId } = message.data;
        createWorld.apply(null, args).then(function sendResponse(result) {
            self.postMessage({ requestId, result });
        }).catch(function sendError(error) {
            self.postMessage({ requestId, error });
        });
    });
};
