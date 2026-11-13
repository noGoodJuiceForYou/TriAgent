## MODIFIED Requirements

### Requirement: VitePress documentation runtime

仓库 SHALL 在根 npm workspace 中提供以 `docs` 为源目录的 VitePress 开发、构建和预览命令，并 SHALL NOT 提交构建或缓存产物。`docs/openspec` SHALL 是指向 `../openspec` 的符号链接，使变更页面的相对 `@include` 能解析到真实 OpenSpec 源文件。

#### Scenario: 开发者启动 WIKI

- **WHEN** 执行 `npm run docs:dev`
- **THEN** VitePress MUST 启动并提供项目首页与变更 WIKI。

#### Scenario: 文档生产构建

- **WHEN** 执行 `npm run docs:build`
- **THEN** 构建 MUST 成功，且 `docs/.vitepress/dist` 与缓存目录 MUST 被 Git 忽略。

#### Scenario: 变更页面 include 解析到源文件

- **WHEN** 变更页面通过 `../../../openspec/changes/...` 引用 proposal、design、tasks 或 delta spec
- **THEN** `docs/openspec` MUST 是符号链接并解析到仓库根的 `openspec` 目录
- **AND** 构建产物 MUST 包含被引用源文件的正文

#### Scenario: 源链接失效时不静默产出空页面

- **WHEN** `docs/openspec` 不是可解析的符号链接
- **THEN** 变更页面的「提案」「设计」「任务」「规格变更」章节 MUST NOT 以空内容通过验收
- **AND** 修复方式 MUST NOT 改写 `@include` 相对路径或复制源文件
