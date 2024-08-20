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
	account_id = getFlag('account-id', true);
	if (!account_id) account_id = readlineSync.question('AWS Account ID: ');

	region = getFlag('region', true);
	if (!region) region = readlineSync.question('Region: ');

	project = getFlag('project', true);
	if (!project) project = readlineSync.question('Project: ');

	let stage = getFlag('stage', true);
	if (!stage) stage = readlineSync.question('Stage (comma separate): ');
	stages = stage.split(',');

	let stack = getFlag('stack', true);
	if (!stack) stack = readlineSync.question('Stack (comma separate): ');
	stacks = stack.split(',');
}

let merge = getFlag('merge');
let mergedIAM;

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

		if (merge) {
			const parsedOutput = JSON.parse(output);
			if (!mergedIAM) {
				mergedIAM = parsedOutput;
			} else {
				mergedIAM.Statement.push(...parsedOutput.Statement);
			}
		} else {
			const fileName = `./output/${templateName}_${project}_${stage}_${stack}.json`;
			fs.writeFileSync(fileName, output);
			console.log(`-> Created ${fileName}`);
		}
	}
}

if (merge) {
	const fileName = `./output/${templateName}_${project}_${stages.join('-')}_${stacks.join('-')}.json`;
	const output = JSON.stringify(mergedIAM, null, '\t');
	fs.writeFileSync(fileName, output);
	console.log(`-> Created ${fileName}`);
}
