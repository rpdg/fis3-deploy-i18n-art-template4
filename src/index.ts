import * as fs from "fs";
import * as path from "path";
import * as template from "art-template";
import * as jsonfile from "jsonfile";
import * as deepmerge from "deepmerge";

type i18nOption = {
	rule: RegExp;
	directory: string;
	output: string;
};

/**
 * 读取同名json配置
 * @param file 页面文件
 */
function readConfig(file: FisFile): any {
	const jsonFile: string = file.realpathNoExt + ".json";

	let data: any;

	if (fs.existsSync(jsonFile)) {
		data = jsonfile.readFileSync(jsonFile);
	} else {
		data = {};
	}

	//data = deepmerge({} , data) ;

	return data["i18n"];
}

const DEFAULT_CONFIG: i18nOption = {
	rule: /<i18n ([\w\W]*?)\/>/,
	directory: "locales",
	output: "/$lang/$dir/$file"
};

export = function(cfg: i18nOption, modified: any[], total: any[], next: Function) {
	let option: i18nOption = deepmerge(DEFAULT_CONFIG, cfg);

	template.defaults.rules.length = 0;
	template.defaults.rules[0] = {
		test: option.rule,
		use: function(match: any, code: string) {
			return {
				code: code,
				output: "escape"
			};
		}
	};

	//read i18n language json file
	let langList: KeyValueObject = {};

	const projectRoot: string = fis.project.getProjectPath();
	const langJsonDir: string = path.join(projectRoot, option.directory);

	fs.readdirSync(langJsonDir).forEach(file => {
		let langPrefix = /^(.*[^\s])\.json$/.exec(file);

		if (langPrefix && langPrefix[1]) {
			langList[langPrefix[1]] = jsonfile.readFileSync(path.join(langJsonDir, file));
		}
	});

	let distHtmlFiles: any[] = [];

	//generate html file from i18n file and template file
	modified.forEach((file, i) => {
		if (file && file.isHtmlLike) {
			let render = template.compile(file.getContent());

			let localData = readConfig(file);
			let langData: KeyValueObject;
			if (localData) {
				let allData = [{}, langList, localData];
				langData = deepmerge.all(allData);
			} else {
				langData = langList;
			}

			for (let lang in langData) {
				let content = render(langData[lang]);

				let distfile = option.output.replace("$lang", lang);
				distfile = distfile.replace("$dir", file.subdirname);
				distfile = distfile.replace("$file", file.filename);
				distfile += file.ext;

				let htmlFile = fis.file(path.join(projectRoot, distfile));

				htmlFile.setContent(content);
				distHtmlFiles.push(htmlFile);
			}

			if(Object.keys(langData).length){
				modified[i] = null;
			}
			
		}
	});

	let i = modified.length;
	while (i--) {
		if (modified[i] === null) {
			modified.splice(i, 1);
		}
	}
	//modified = modified.filter(v => v!==null);

	//add to deplay file array
	distHtmlFiles.forEach(file => {
		modified.push(file);
	});

	//invoke the next deploy plugin
	next();
};
