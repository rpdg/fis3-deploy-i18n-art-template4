# fis3-deploy-i18n-art-template4 

在前端的工程构建工具[FIS3](http://fis.baidu.com/)发布(deploy)阶段，将所有拥有`isHtmlLike: true`的文件包含的多语言标记替换成指定内容，并生成文件的插件。

## 使用说明
### 安装
```shell
npm install -g fis3-deploy-i18n-art-template4
```

### 默认配置
```javascript

{
    rule: /<i18n ([\w\W]*?)\/>/, //正则匹配规则，默认是 <i18n ... />
    directory: "locales", //json语言包的目录，默认是 locales
    // 生成文件的路径规则，
    // 其中`$lang`代表语言名，`$dir`代表编译的文件原路径，`$file`代表编译的文件名，
    // 默认生成结果类似 /cn/page_path/file.html
    output: "/$lang/$dir/$file" 
}
```


### 项目目录结构
```
# project root path
│
├── locales # 文件名及语言名
│   ├── en.json
│   ├── cn.json
│   └── ...
│
├── pages
│   ├── index.html
│   ├── ...
│   └── sub-folder
│       ├── detail.html
│       └── ...
│
├── fis-conf.js
│
└── package.json
```

### 配置`fis-conf.js`中`fis3-deploy-i18n-ejs`相关的内容
``` javascript
// ------ deploy ------

// i18n，自定义配置样例
fis.match("**", {
	deploy: [
		fis.plugin("i18n-art-template4", {
			rule : /\[i18n ([\w\W]*?)\]/, // 自定义[i18n ...]为匹配规则
			directory: 'langs', // 自定义语言json包在 /langs下
			output: "/$dir/$file_$lang",// 生成文件的路径规则， /page_path/file_cn.html
		}), 
		fis.plugin("local-deliver") , // 貌似这行不能少，不知道为啥...
	]
});

// ------ translations ------
fis.match('/locales/**', {
  release: false //避免生成出语言包文件
});

```

### `langs`中的文件内容示例
langs/en.json
```
{
    "hello": "hello",
    "world": "world"
}
```

langs/cn.json
```
{
    "hello": "你好",
    "world": "世界"
}
```

### `pages`待转换的文件夹
#### `pages/index.html`
```
<html>
<head>
    <meta charset="UTF-8">
    <title>index</title>
</head>
<body>
    <p>[i18n hello], [i18n world ]!</p>
</body>
</html>
```

### 输出结果
#### 语言为`cn`的输出结果：
- `pages/index_cn.html`
```
<html>
<head>
    <meta charset="UTF-8">
    <title>index</title>
</head>
<body>
    <p>你好,世界!</p>
</body>
</html>
```

#### 语言为`en`的输出结果：
- `pages/index_en.html`
```
<html>
<head>
    <meta charset="UTF-8">
    <title>index</title>
</head>
<body>
    <p>hello,world!</p>
</body>
</html>
```
