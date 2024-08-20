const getFlag = (name, withValue = false) => {
	const flag = `--${name}`;
	const flagIndex = process.argv.findIndex((arg) => arg === flag);
	if (flagIndex === -1) return false;
	if (withValue) {
		if (flagIndex + 1 >= process.argv.length)
			throw Error('Missing value for flag: ' + flag);
		return process.argv[flagIndex + 1];
	} else {
		return true;
	}
};

module.exports = { getFlag };
