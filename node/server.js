'use strict';

const Http = require('http');
const Domain = require('domain');

let closing = false;

const server = Http.createServer((req, res) => {
    if (closing) {
        console.log('SERVER IS SHUTTING DOWN');
        res.writeHead(503);
        res.end();
        return;
    };

    const d = Domain.create();

    d.add(req);
    d.add(res);

    d.on('error', (error) => {
        closing = true;
        res.writeHead(200);
        res.end();
        console.log('UNCAUGHT: SHUTTING DOWN SERVER');
        server.close(() => {
            console.log('PROCESS EXIT');
            process.exit(1);
        });
    });

    d.run(() => {
        if ((Math.floor(Math.random() * 200) + 1) < 2) {
            throw new Error('Boom!');
        }

        res.writeHead(200);
        res.end('OK');
    });
});

server.listen(3000, () => {
    console.log('Server up.');
});
