#!/usr/bin/env node

const cli = require('commander');
const WebSocket = require('ws');
const watch = require('node-watch');
const open = require('open');
const fs = require('fs-extra');

let openBrowser = () => {
    open('google.com', {
        app: { name: 'chromium', arguments: [`--load-extension=${__dirname + '/../extension'}`] }
    });
};

let createServer = () => {
    let wss = new WebSocket.Server({ port: 8128 });

    wss.on('connection', function connection(ws) {
        watch(process.cwd(), { recursive: true }, function () {
            ws.send('fidelio');
        });
    });
};

const create = () => {
    let projectName = cli.args[1];

    fs.copy(__dirname + '/../default', process.cwd() + '/' + projectName)
        .then(() => console.log(projectName + ' created'))
        .catch((error) => console.error(error));
};

const run = () => {};

cli.name('syringa').description('The Live Injector').version('0.0.1');

cli.command('create').argument('<project-name>', 'project name').action(create).description('create new project');
cli.command('run').action(run).description('run the project');

cli.parse();
