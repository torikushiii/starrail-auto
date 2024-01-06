module.exports = class Command extends require("./template.js") {
	name;
	description = null;
	code;

	data = {};

	constructor (data) {
		super();

		this.name = data.name;
		if (typeof this.name !== "string" || this.name.length === 0) {
			console.error("Command name must be a string and not empty", this.name);
			this.name = "";
		}

		this.description = data.description;

		if (typeof data.run === "function") {
			this.code = data.run;
		}
		else {
			try {
				this.code = eval(data.run);
			}
			catch (e) {
				console.error(`Failed to compile code for ${this.name}`, e);
				this.code = () => ({
					success: false,
					reply: "Failed to compile code"
				});
			}
		}
	}

	destroy () {
		this.code = null;
		this.data = null;
	}

	execute (...args) {
		return this.code(...args);
	}

	static async initialize () {
		return this;
	}

	static async importData (definitions) {
		super.importData(definitions);
		await this.validate();
	}

	static async validate () {
		if (Command.data.length === 0) {
			console.warn("No command found");
		}

		if (!sr.Config) {
			console.warn("Config is not initialized");
		}
		else if (Command.prefix === null) {
			console.warn("Command prefix is not set");
		}

		const names = Command.data.flatMap(i => i.name);
		const duplicates = names.filter((i, index) => names.indexOf(i) !== index);
		if (duplicates.length > 0) {
			console.warn("Duplicate command name found", duplicates);
		}
	}

	static get (name) {
		if (name instanceof Command) {
			return name;
		}
		else if (typeof name === "string") {
			return Command.data.find(i => i.name === name);
		}
		else {
			throw new sr.Error({
				message: "Invalid command name",
				args: {
					type: typeof name,
					name
				}
			});
		}
	}

	static async checkAndRun (identifier, argumentArray, options = {}) {
		if (!identifier) {
			return {
				success: false,
				reply: "No command name specified"
			};
		}

		if (!Array.isArray(argumentArray)) {
			throw new sr.Error({ message: "Invalid argument array" });
		}

		const command = Command.get(identifier);
		if (!command) {
			return {
				success: false,
				reply: "Command not found"
			};
		}
        
		const args = argumentArray;
		const appendOptions = { ...options };
		const contextOptions = {
			platform: options.platform,
			invocation: identifier,
			command,
			append: appendOptions
		};

		let execution;
		const context = contextOptions;

		try {
			execution = await command.code(context, ...args);
		}
		catch (e) {
			const logData = {
				command: command.name,
				invocation: identifier,
				platform: options.platform.id,
				args,
				error: e
			};

			sr.Logger.json(logData);
			execution = {
				success: false,
				reply: "An error occurred while executing the command, please check the console for more details"
			};
		}

		if (!execution) {
			return execution;
		}
		else if (typeof execution === "string") {
			return execution;
		}

		execution.reply = String(execution.reply).trim();
        
		if (typeof execution.reply !== "undefined") {
			execution.reply = String(execution.reply).trim();
			if (execution.reply.length === 0) {
				execution.reply = "(no message)";
			}
		}

		return execution;
	}
};
