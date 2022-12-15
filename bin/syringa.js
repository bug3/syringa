#!/usr/bin/env node

const cli = require('commander');
const WebSocket = require('ws');
const watch = require('node-watch');
const open = require('open');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

const config = {};
const tempPrefix = 'syringa-temp';
const configFile = '.syringarc.json';
const currentPath = process.cwd();
const binPath = __dirname;

const main = () => {
    cli.name('syringa').description('The Live Injector').version('0.1.9');

    cli.command('create').argument('<project-name>', 'project name').action(create).description('create new project');
    cli.command('create-config').action(createConfig).description('create config file');
    cli.command('run').description('run the project').option('--auto-load', 'no extension load required')
        .action((options) => {
            config.options = options;

            if (fs.existsSync(configFile)) {
                run(options);
            } else {
                console.error(`${ configFile } file not found`);
            }
        });

    cli.parse();
};

const create = () => {
    const projectName = cli.args[1];

    fs.copy(`${ binPath }/../default`, `${ currentPath }/${ projectName }`)
        .then(() => console.log(`${ projectName } created`))
        .catch((error) => console.error(error));
};

const createConfig = () => {
    fs.copy(`${ binPath }/../default/${ configFile }`, `${ currentPath }/${ configFile }`)
        .then(() => console.log(`${ configFile } created`))
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
        const jsonString = fs.readFileSync(`${ currentPath }/${ configFile }`);

        Object.assign(config, JSON.parse(jsonString));
    } catch (error) {
        console.error(error);
    }
};

const editManifest = () => {
    try {
        const manifestFile = `${ binPath }/../extension/manifest.json`;
        const manifestData = fs.readJsonSync(manifestFile);

        manifestData['content_scripts'][0].matches = config.extension.matches;

        fs.writeJsonSync(manifestFile, manifestData, { spaces: 4 });
    } catch (error) {
        console.error(error);
    }
};

const copyDir = () => {
    try {
        const resourcesDir = `${ binPath }/../extension/resources`;
        const server = {
            onCreate: true,
            files: {
                html: config.codes.html.map((w) => w.file),
                css: config.codes.css,
                js: config.codes.js
            }
        };

        fs.copySync(`${ currentPath }/${ configFile }`, `${ resourcesDir }/${ configFile }`);

        Object.keys(server.files).forEach((key) => {
            server.files[key].forEach((file, index) => {
                server.files[key][index] = path.parse(file).name;

                if (fs.existsSync(`${ currentPath }/${ file }`)) {
                    fs.copySync(`${ currentPath }/${ file }`, `${ resourcesDir }/${ file }`);
                } else {
                    console.error(`${ file } not found`);

                    process.exit(1);
                }
            });
        });

        Object.assign(config, server);
    } catch (error) {
        console.error(error);
    }
};

const createServer = () => {
    const wss = new WebSocket.Server({ port: 8128 });

    wss.on('connection', function connection(ws) {
        ws.send(JSON.stringify({
            password: 'fidelio',
            config
        }));

        watchFiles(ws);
    });
};

const watchFiles = (ws) => {
    watch(currentPath, { recursive: true }, function (event, file) {
        if (event === 'update') {
            const fileDetail = path.parse(file);
            const extension = fileDetail.ext.replace('.', '');
            const isConfigFile = (fileDetail.base === configFile);

            config.onCreate = isConfigFile;

            if ((config.files[extension] || []).includes(fileDetail.name) || isConfigFile) {

                config['changes'] = {
                    file: {
                        name: fileDetail.name,
                        ext: fileDetail.ext,
                        base: fileDetail.base,
                        path: file
                    }
                };

                if (isConfigFile) {
                    readConfig();
                    editManifest();
                    copyDir();
                }

                copyFile(file, fileDetail.base);

                ws.send(JSON.stringify({
                    password: 'fidelio',
                    config
                }));
            }
        }
    });
};

const copyFile = (file, fileBase) => {
    try {
        fs.copySync(file, `${ binPath }/../extension/resources/${ fileBase }`);
    } catch (error) {
        console.error(error);
    }
};

const openBrowser = () => {
    const cmdArgs = [];

    if (config.options.autoLoad) {
        cmdArgs.push(`--load-extension=${ `${ binPath }/../extension` }`);

        try {
            const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), tempPrefix));

            cmdArgs.push(`--user-data-dir=${ tempDir }`);
            cmdArgs.push('--no-first-run');
            cmdArgs.push('--no-default-browser-check');
            cmdArgs.push('--start-maximized');
        } catch (error) {
            console.error(error);
        }
    } else {
        if (config.incognito) {
            cmdArgs.push('--incognito');
        }
    }

    open(config.startUrl, {
        app: { name: open.apps[config.browser], arguments: cmdArgs }
    });
};

main();
