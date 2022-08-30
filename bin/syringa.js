const cli = require('commander');

const create = () => {
    console.log('create');
};

const run = () => {
    console.log('run');
};

cli.name('syringa').description('The Live Injector').version('0.0.1');

cli.command('create').action(create).description('create new project');
cli.command('run').action(run).description('run the project');

cli.parse();
