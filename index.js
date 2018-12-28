"use strict";
var fs = require("fs");
var path = require("path");
var template = require("art-template");
var jsonfile = require("jsonfile");
var deepmerge = require("deepmerge");
module.exports = function (cfg, modified, total, next) {
    var option = {
        rule: /<i18n ([\w\W]*?)\/>/,
        directory: "locales",
        output: "/$lang/$dir/$file"
    };
    option = deepmerge(option, cfg);
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
    var langList = {};
    var projectRoot = fis.project.getProjectPath();
    var langJsonDir = path.join(projectRoot, option.directory);
    fs.readdirSync(langJsonDir).forEach(function (file) {
        var langPrefix = /^(.*[^\s])\.json$/.exec(file);
        if (langPrefix && langPrefix[1]) {
            langList[langPrefix[1]] = jsonfile.readFileSync(langJsonDir + "/" + file);
        }
    });
    var distHtmlFiles = [];
    //generate html file from i18n file and template file
    modified.forEach(function (file, i) {
        if (file.isHtmlLike) {
            var render = template.compile(file.getContent());
            for (var lang in langList) {
                var content = render(langList[lang]);
                var distfile = option.output.replace("$lang", lang);
                distfile = distfile.replace("$dir", file.subdirname);
                distfile = distfile.replace("$file", file.filename);
                distfile += file.ext;
                var htmlFile = fis.file(path.join(projectRoot, distfile));
                htmlFile.setContent(content);
                distHtmlFiles.push(htmlFile);
            }
            modified[i] = null;
        }
    });
    var i = modified.length;
    while (i--) {
        if (modified[i] === null) {
            modified.splice(i, 1);
        }
    }
    //modified = modified.filter(v => v!==null);
    //add to deplay file array
    distHtmlFiles.forEach(function (file) {
        modified.push(file);
    });
    //invoke the next deploy plugin
    next();
};
//# sourceMappingURL=index.js.map