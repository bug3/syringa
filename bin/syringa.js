#!/usr/bin/env node

const cli = require('commander');
const WebSocket = require('ws');
const watch = require('node-watch');

const wss = new WebSocket.Server({ port: 8128 });

const create = () => {
    console.log('create');
};

const run = () => {
    wss.on('connection', function connection(ws) {
        watch(process.cwd(), { recursive: true }, function () {
            ws.send('fidelio');
        });
    });
};

cli.name('syringa').description('The Live Injector').version('0.0.1');

cli.command('create').action(create).description('create new project');
cli.command('run').action(run).description('run the project');

cli.parse();
