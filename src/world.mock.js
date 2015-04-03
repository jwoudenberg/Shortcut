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
        paths: [
            { ports: [1, 7] },
            { ports: [3, 2] },
            { ports: [4, 0] },
            { ports: [5, 6] }
        ]
    }, {
        field: '2',
        paths: [
            { ports: [0, 1] },
            { ports: [7, 3] },
            { ports: [2, 6] },
            { ports: [5, 4] }
        ]
    }, {
        field: '3',
        paths: [
            { ports: [2, 7] },
            { ports: [4, 0] },
            { ports: [5, 6] },
            { ports: [1, 3] }
        ]
    }]
};
