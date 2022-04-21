module.exports = {
	apps: [{
		name: 'EmojiUtilities',
		script: './src/index.js',
		watch: ['src'],
		ignore_watch: ['node_modules', 'databases'],
	}],
};
