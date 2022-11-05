#!/usr/bin/env node

const cli = require('commander');
const WebSocket = require('ws');
const watch = require('node-watch');
const open = require('open');
const fs = require('fs-extra');

const config = {};
const currentPath = process.cwd();
const binPath = __dirname;

const main = () => {
    cli.name('syringa').description('The Live Injector').version('0.0.8');

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
};

const create = () => {
    const projectName = cli.args[1];

    fs.copy(`${binPath}/../default`, `${currentPath}/${projectName}`)
        .then(() => console.log(`${projectName} created`))
        .catch((error) => console.error(error));
};

const run = () => {
    readConfig();
    copyFiles(currentPath);
    createServer();
    openBrowser();
};

const readConfig = () => {
    try {
        const jsonString = fs.readFileSync(`${currentPath}/.syringarc.json`);

        Object.assign(config, JSON.parse(jsonString));
    } catch (error) {
        console.error(error);
    }
};

const copyFiles = (path) => {
    try {
        fs.copySync(path, `${binPath}/../extension/resources`);
    } catch (error) {
        console.error(error);
    }
};

const createServer = () => {
    const wss = new WebSocket.Server({ port: 8128 });

    wss.on('connection', function connection(ws) {
        watch(currentPath, { recursive: true }, function (event, file) {
            if (event === 'update') {
                copyFiles(file);

                ws.send('fidelio');
            }
        });
    });
};

const openBrowser = () => {
    const cmdArgs = [];

    if (config.options.autoLoad) {
        cmdArgs.push(`--load-extension=${`${binPath}/../extension`}`);
    }

    if (config.incognito) {
        cmdArgs.push('--incognito');
    }

    open(config.url, {
        app: { name: open.apps[config.browser], arguments: cmdArgs }
    });
};

main();
