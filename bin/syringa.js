#!/usr/bin/env node

const cli = require('commander');
const WebSocket = require('ws');
const watch = require('node-watch');
const open = require('open');
const fs = require('fs-extra');
const path = require('path');

const config = {};
const currentPath = process.cwd();
const binPath = __dirname;

const main = () => {
    cli.name('syringa').description('The Live Injector').version('0.1.0');

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
    editManifest();
    copyDir();
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

const editManifest = () => {
    try {
        const manifestFile = `${binPath}/../extension/manifest.json`;
        const manifestData = fs.readJsonSync(manifestFile);

        manifestData['content_scripts'][0].matches = config.extension.matches;

        fs.writeJsonSync(manifestFile, manifestData, { spaces: 4 });
    } catch (error) {
        console.error(error);
    }
};

const copyDir = () => {
    try {
        fs.copySync(currentPath, `${binPath}/../extension/resources`);
    } catch (error) {
        console.error(error);
    }
};

const createServer = () => {
    const wss = new WebSocket.Server({ port: 8128 });

    const info = {
        onopen: true,
    };

    wss.on('connection', function connection(ws) {
        info['config'] = config;

        ws.send(JSON.stringify({
            password: 'fidelio',
            info
        }));

        watchFiles(ws);
    });
};

const watchFiles = (ws) => {
    watch(currentPath, { recursive: true }, function (event, file) {
        if (event === 'update') {
            const fileDetail = path.parse(file);

            const info = {
                file: {
                    name: fileDetail.name,
                    ext: fileDetail.ext,
                    base: fileDetail.base,
                    path: file
                }
            };

            if (fileDetail.base === 'index.html' || fileDetail.base === '.syringarc.json') {
                readConfig();
                editManifest();

                info['config'] = config;
            }

            copyFile(file, fileDetail.base);

            ws.send(JSON.stringify({
                password: 'fidelio',
                info
            }));
        }
    });
};

const copyFile = (file, fileBase) => {
    try {
        fs.copySync(file, `${binPath}/../extension/resources/${fileBase}`);
    } catch (error) {
        console.error(error);
    }
};

const openBrowser = () => {
    const cmdArgs = [];

    if (config.options.autoLoad) {
        cmdArgs.push(`--load-extension=${`${binPath}/../extension`}`);
    }

    if (config.incognito) {
        cmdArgs.push('--incognito');
    }

    open(config.startUrl, {
        app: { name: open.apps[config.browser], arguments: cmdArgs }
    });
};

main();
