var mongojs = require('mongojs');

var databaseUrl = 'todolist_db';
var collections = ['tasklist'];

var connect = mongojs(databaseUrl, collections);

module.exports = {
    connect: connect
};