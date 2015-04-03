module.exports = {
    board: {
        fields: [{
            id: '1',
            color: 'red'
        }, {
            id: '2',
            color: 'blue'
        }, {
            id: '3',
            color: 'black'
        }]
    },
    cards: [{
        field: '1',
        paths: [{
            ports: [1, 6]
        }]
    }, {
        field: '2',
        paths: [{
            ports: [4, 0]
        }]
    }, {
        field: '3',
        paths: [{
            ports: [5, 2]
        }]
    }]
};
