'use strict';

const Http = require('http');
const Domain = require('domain');

//Cluster code for stand-alone comparison
// const Cluster = require('cluster');
//
// const fork = function () {
//     const child = Cluster.fork();
//
//     child.once('exit', () => {
//         console.log('WARN: Child process exited. Restarting.');
//         fork();
//     });
// }
//
// if (Cluster.isMaster) {
//     fork();
//     fork();
//     fork();
//     fork();
//     return;
// }

const handler = function () {
    let closing = false;

    return function (req, res) {
        if (closing) {
            console.log('WARN: Unable to handle request. Server is shutting down.');
            res.writeHead(503, { Connection: 'close' });
            res.end();
            return;
        };

        const d = Domain.create();

        d.add(req);
        d.add(res);

        d.on('error', (error) => {
            closing = true;

            res.writeHead(500);
            res.end('Internal Server Error');

            console.log('ERROR: Uncaught Exception. Shutting down.');

            process.emit('SIGTERM');
        });

        d.run(() => {
            if ((Math.floor(Math.random() * 200) + 1) < 2) {
                throw new Error('Boom!');
            }

            res.writeHead(200);
            res.end('OK');
        });
    };
};

process.on('SIGTERM', () => {
    setTimeout(() => {
        console.log('INFO: Forced shutdown.');
        process.exit(1);
    }, 30000).unref();

    server.close(() => {
        console.log('INFO: Server closed. Exiting process.');
        process.exit();
    });
});

const server = Http.createServer(handler());

server.listen(3000, () => {
    console.log('INFO: Server listening.');
});
