// to add the rules
module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        'type-enum': [
            2,
            'always',
            [
                'feat', // 新功能（feature）
                'fix', // 修补bug
                'docs', // 文档（documentation）
                'style', // 格式（不影响代码运行的变动）
                'refactor', // 重构（即不是新增功能，也不是修改bug的代码变动）
                'test', // 增加测试
                'chore', // 构建过程或辅助工具的变动
                'revert', // 回滚
                'merge', // 合并
                'perf', // 性能优化
                'ci', // CI配置
                'build', // 打包
                'release', // 发布
                'workflow', // 工作流
                'types', // 类型定义文件更改
                'wip', // 开发中
                'config', // 配置文件
                'deps', // 依赖更新
                'upgrade', // 第三方库升级
                'breaking', // 不兼容变更
                'security', // 安全
                'revert', // 回滚
                'init', // 初始化
                'add', // 新增
                'del', // 删除
                'remove', // 移除
                'update', // 更新
                'change', // 修改
                'improve', // 改进
                'correct', // 修正
            ],
        ],
        'subject-full-stop': [0, 'never'],
        'subject-case': [0, 'never'],
    },
};