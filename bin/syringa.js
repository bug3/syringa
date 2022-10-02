#!/usr/bin/env node

const cli = require('commander');
const WebSocket = require('ws');
const watch = require('node-watch');
const open = require('open');
const fs = require('fs-extra');

var config = {};

let readConfig = () => {
    try {
        let jsonString = fs.readFileSync(process.cwd() + '/.syringarc.json');

        Object.assign(config, JSON.parse(jsonString));
    } catch (error) {
        console.error(error);
    }
};

let copyFiles = () => {
    try {
        fs.copySync(process.cwd(), __dirname + '/../extension/resources');
    } catch (error) {
        console.error(error);
    }
};

let createServer = () => {
    let wss = new WebSocket.Server({ port: 8128 });

    wss.on('connection', function connection(ws) {
        watch(process.cwd(), { recursive: true }, function () {
            copyFiles();

            ws.send('fidelio');
        });
    });
};

let openBrowser = () => {
    let cmdArgs = [];

    if (config.options.autoLoad) {
        cmdArgs.push(`--load-extension=${__dirname + '/../extension'}`);
    }

    if (config.incognito) {
        cmdArgs.push('--incognito');
    }

    open(config.url, {
        app: { name: open.apps[config.browser], arguments: cmdArgs }
    });
};

const create = () => {
    let projectName = cli.args[1];

    fs.copy(__dirname + '/../default', process.cwd() + '/' + projectName)
        .then(() => console.log(projectName + ' created'))
        .catch((error) => console.error(error));
};

const run = () => {
    readConfig();
    copyFiles();
    createServer();
    openBrowser();
};

cli.name('syringa').description('The Live Injector').version('0.0.5');

cli.command('create').argument('<project-name>', 'project name').action(create).description('create new project');
cli.command('run').description('run the project').option('--auto-load', 'no extension load required')
    .action((options) => {
        config.options = options;

        if (fs.existsSync('.syringarc.json')) {
            run(options);
        } else {
            console.error('.syringarc.json file not found');
        }
    });

cli.parse();
