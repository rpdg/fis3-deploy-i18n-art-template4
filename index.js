"use strict";
const fs = require("fs");
const path = require("path");
const template = require("art-template");
const jsonfile = require("jsonfile");
const deepmerge = require("deepmerge");
/**
 * 读取同名json配置
 * @param file 页面文件
 */
function readConfig(file) {
    const jsonFile = file.realpathNoExt + ".json";
    let data;
    if (fs.existsSync(jsonFile)) {
        data = jsonfile.readFileSync(jsonFile);
    }
    else {
        data = {};
    }
    //data = deepmerge({} , data) ;
    return data["i18n"];
}
const DEFAULT_CONFIG = {
    rule: /<i18n ([\w\W]*?)\/>/,
    directory: "locales",
    output: "/$lang/$dir/$file"
};
module.exports = function (cfg, modified, total, next) {
    let option = deepmerge(DEFAULT_CONFIG, cfg);
    template.defaults.rules.length = 0;
    template.defaults.rules[0] = {
        test: option.rule,
        use: function (match, code) {
            return {
                code: code,
                output: "escape"
            };
        }
    };
    //read i18n language json file
    let langList = {};
    const projectRoot = fis.project.getProjectPath();
    const langJsonDir = path.join(projectRoot, option.directory);
    fs.readdirSync(langJsonDir).forEach(file => {
        let langPrefix = /^(.*[^\s])\.json$/.exec(file);
        if (langPrefix && langPrefix[1]) {
            langList[langPrefix[1]] = jsonfile.readFileSync(path.join(langJsonDir, file));
        }
    });
    let distHtmlFiles = [];
    //generate html file from i18n file and template file
    modified.forEach((file, i) => {
        if (file && file.isHtmlLike) {
            let render = template.compile(file.getContent());
            let localData = readConfig(file);
            let langData;
            if (localData) {
                let allData = [{}, langList, localData];
                langData = deepmerge.all(allData);
            }
            else {
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
            if (Object.keys(langData).length) {
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
//# sourceMappingURL=index.js.map