declare type i18nOption = {
    rule: RegExp;
    directory: string;
    output: string;
};
declare const _default: (cfg: i18nOption, modified: any[], total: any[], next: Function) => void;
export = _default;
