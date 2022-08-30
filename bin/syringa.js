const cli = require('commander');

const create = () => {
    console.log('create');
};

cli.name('syringa').description('The Live Injector').version('0.0.1');

cli.command('create').action(create).description('create new project');

cli.parse();
