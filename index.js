const Mustache = require('mustache');
const readlineSync = require('readline-sync');
const fs = require('fs');
const { getFlag } = require('./utils');

if (!fs.existsSync('./output')) {
	fs.mkdirSync('./output');
}

if (!fs.existsSync('./templates')) {
	throw Error('Required templates dir');
}

const files = fs.readdirSync('./templates');
const templates = files.map((f) => f.replace('.json', ''));

const templateFromFlag = getFlag('template', true);

let templateName;
if (templateFromFlag) {
	if (!templates.includes(templateFromFlag))
		throw Error(
			`Invalid template: ${templateFromFlag}, required: ${templates}`,
		);
	templateName = templateFromFlag;
} else {
	const templateIndex = readlineSync.keyInSelect(
		templates,
		'Choose a template: ',
	);
	templateName = templates[templateIndex];
}

let config;
let region = '';
let project = '';
let account_id = '';
let stages = [];
let stacks = [];

const template = fs.readFileSync(`templates/${templateName}.json`, 'utf8');
const configFile = getFlag('config', true);

if (configFile) {
	account_id = config.account_id;
	region = config.region;
	project = config[templateName].project;
	stages = config[templateName].stages;
	stacks = config[templateName].stacks;
} else {
	account_id = readlineSync.question('AWS Account ID: ');
	region = readlineSync.question('Region: ');
	project = readlineSync.question('Project: ');
	const stage = readlineSync.question('Stage (comma separate): ');
	stages = stage.split(',');
	const stack = readlineSync.question('Stack (comma separate): ');
	stacks = stack.split(',');
}

for (const stage of stages) {
	for (const stack of stacks) {
		const output = Mustache.render(template, {
			region,
			account_id,
			project,
			stage,
			stack_name: stack,
			stack_short_name: stack.substring(0, 6),
		});

		const fileName = `./output/${templateName}_${project}_${stage}_${stack}.json`;
		fs.writeFileSync(fileName, output);
		console.log(`-> Created ${fileName}`);
	}
}
