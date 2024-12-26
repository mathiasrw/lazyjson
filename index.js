const re = {
	jsonStrip: new RegExp(jzon, 'g'),
	jsonStrip:
		/(?<QSTR>(['"])(?:[^\\\2]+?|\\\\|\\[^\2]|\\(?:\2))*?\2)|(?<COMMENT>\/\/[\w\W]*?(?=\n|$)|\/\*[\w\W]*?\*\/)/g,
	jsonCleanup:
		/(?<=[{,]\s*)(?:(?<UNDEF>[^\s{,':]+\s*:\s*(?:,|undefined((\s*,)+|(?=\s*}))(?=)))|(?<KEY>[^\s{,"':]+)(?=\s*:))|(?<EXTRACOMMA>,(?=\s*[}\]])|,\s*(?=,))|(?<=[\[,:]\s*)(?:-?\d+(\.\d+)?|[+-]?\d+e[+-]?\d+|true|false|null|(?<NUM>(?:[+-]?(?:\d|\d+\.|\.\d+))|0x[a-f]+)|(?<INF>[+-]?infinity)|(?<NULL>NaN|undefined)|(?<VAL>[^'",\{\[\]\}:\s]+))(?=[\s,\]\}])/gi,
	trailingCommas: /,\s*([\]}])/g,
	stringTokens: /__STRING_TOKEN_(\d+)__/g,
	nakedObj: /^\s*[^{\s:]+\s*:/,
};

const salt = Date.now().toString(36) + Date.now().toString(2);

export function parse(input) {
	const quotedStrings = {};
	let tokens = 0;

	input = input.replace(re.jsonStrip, (...args) => {
		const token = args.pop();

		if (token.QSTR) {
			const key = 'token_' + salt + '_' + ++tokens;
			let str = token.QSTR.slice(1, -1) // Strip outer quotes
				.replaceAll('\\\n', '\\n'); // todo : Deal with escaped escaped newline ?

			if (token.QSTR.length && token.QSTR[0] === "'") {
				str = str.replaceAll("\\'", "'").replaceAll('"', '\\"');
			}

			quotedStrings[key] = str;
			return '"' + key + '"';
		}
		if (token.COMMENT) {
			return '';
		}
		return args[0];
	});

	if (re.nakedObj.test(input)) input = '{' + input + '\n}';

	input = input.replace(re.jsonCleanup, (...args) => {
		const token = args.pop(); // Pop the last argument, which is the `tokens` object

		if (token.KEY) {
			return '"' + token.KEY + '"';
		}
		if (token.NUM) {
			return +token.NUM;
		}
		if (token.INF) {
			if (token.INF.length > 0 && token.INF[0] === '-') return Number.MIN_VALUE;
			return Number.MAX_VALUE;
		}
		if (token.NULL) {
			return `null`;
		}
		if (token.VAL) {
			return `"${token.VAL}"`;
		}
		if (token.EXTRACOMMA) {
			return '';
		}
		if (token.UNDEF) {
			return '';
		}
		return args[0];
	});

	if (tokens) {
		const chunkSize = 100;
		const keys = Object.keys(quotedStrings);

		// Use the chunkArray function to split keys into chunks of 100
		const keyChunks = chunkArray(keys, chunkSize);

		// Process each chunk
		keyChunks.forEach(keyChunk => {
			const tokenRe = new RegExp(keyChunk.join('|'), 'g');
			input = input.replace(tokenRe, match => quotedStrings[match]);
		});
	}

	return JSON.parse(input);
}

export function stringify(input) {
	return JSON.stringify(input);
}

export default { parse, stringify };

function chunkArray(array, chunkSize) {
	const chunks = [];
	for (let i = 0; i < array.length; i += chunkSize) {
		chunks.push(array.slice(i, i + chunkSize));
	}
	return chunks;
}

