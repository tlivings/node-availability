'use strict';

const Http = require('http');
const Domain = require('domain');

let closing = false;

const server = Http.createServer((req, res) => {
    if (closing) {
        res.writeHead(503);
        res.end();
        return;
    };

    const d = Domain.create();

    d.add(req);
    d.add(res);

    d.on('error', (error) => {
        closing = true;
        res.writeHead(500);
        res.end();
        server.close();
    });

    d.run(() => {
        if ((Math.floor(Math.random() * 200) + 1) < 2) {
            throw new Error('Boom!');
        }

        res.writeHead(200);
        res.end('OK');
    });
});

server.listen(3000);
