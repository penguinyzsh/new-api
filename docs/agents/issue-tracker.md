# Issue 跟踪器：GitHub

本仓库的 Issue 和 PRD 统一记录在 GitHub Issues 中。所有操作均使用 `gh` CLI。

## 操作约定

- **创建 Issue**：运行 `gh issue create --title "..." --body "..."`。多行正文使用 heredoc
- **读取 Issue**：运行 `gh issue view <编号> --comments`，使用 `jq` 筛选评论并同时读取标签
- **列出 Issue**：运行 `gh issue list --state open --json number,title,body,labels,comments --jq '[.[] | {number, title, body, labels: [.labels[].name], comments: [.comments[].body]}]'`，并按需添加 `--label` 和 `--state` 筛选条件
- **评论 Issue**：运行 `gh issue comment <编号> --body "..."`
- **添加或移除标签**：运行 `gh issue edit <编号> --add-label "..."` 或 `gh issue edit <编号> --remove-label "..."`
- **关闭 Issue**：运行 `gh issue close <编号> --comment "..."`

仓库地址从 `git remote -v` 推断；在仓库克隆目录中运行时，`gh` 会自动完成推断。

## 将 Pull Request 作为分诊入口

**将 PR 作为请求入口：是。** `/triage` 会读取此配置，将外部 PR 纳入分诊。

PR 使用与 Issue 相同的标签和状态，并通过对应的 `gh pr` 命令操作：

- **读取 PR**：运行 `gh pr view <编号> --comments`，并运行 `gh pr diff <编号>` 查看差异
- **列出待分诊的外部 PR**：运行 `gh pr list --state open --json number,title,body,labels,author,authorAssociation,comments`，仅保留 `authorAssociation` 为 `CONTRIBUTOR`、`FIRST_TIME_CONTRIBUTOR` 或 `NONE` 的 PR，排除 `OWNER`、`MEMBER` 和 `COLLABORATOR`
- **评论、添加标签或关闭 PR**：分别使用 `gh pr comment`、`gh pr edit --add-label`、`gh pr edit --remove-label` 和 `gh pr close`

GitHub 的 Issue 和 PR 共用同一编号空间，因此单独出现的 `#42` 可能是 Issue，也可能是 PR。先运行 `gh pr view 42`，失败后再运行 `gh issue view 42`。

## 当技能要求“发布到 Issue 跟踪器”时

创建一个 GitHub Issue。

## 当技能要求“获取相关工单”时

运行 `gh issue view <编号> --comments`。

## Wayfinder 操作约定

供 `/wayfinder` 使用。一个 **map** 对应一个 Issue，具体工单作为其子 Issue。

- **Map**：使用一个带 `wayfinder:map` 标签的 Issue，正文包含“备注”“当前决策”和“未知事项”。运行 `gh issue create --label wayfinder:map` 创建
- **子工单**：通过 GitHub 子 Issue API（使用 `gh api` 调用 sub-issues 端点）关联到 map。如果仓库未启用子 Issue，则在 map 正文中添加任务列表，并在子工单正文顶部写入 `Part of #<map编号>`。标签使用 `wayfinder:<类型>`，类型包括 `research`、`prototype`、`grilling` 和 `task`。工单被领取后，指派给负责推进的开发者
- **阻塞关系**：优先使用 GitHub 原生 Issue 依赖关系。运行 `gh api --method POST repos/<所有者>/<仓库>/issues/<子工单编号>/dependencies/blocked_by -F issue_id=<阻塞工单数据库ID>` 添加依赖。数据库 ID 通过 `gh api repos/<所有者>/<仓库>/issues/<编号> --jq .id` 获取，不能使用 `#编号` 或 `node_id`。GitHub 通过 `issue_dependencies_summary.blocked_by` 返回仍未关闭的阻塞项。如果原生依赖不可用，则在子工单正文顶部写入 `Blocked by: #<编号>, #<编号>`。所有阻塞工单关闭后，该工单才视为解除阻塞
- **查询可执行工单**：按 map 中的顺序列出尚未关闭的子工单，排除存在未关闭阻塞项或已有负责人者，第一项即为下一项可执行工单
- **领取**：运行 `gh issue edit <编号> --add-assignee @me`。这是会话中的第一次写操作
- **完成**：运行 `gh issue comment <编号> --body "<结论>"`，随后运行 `gh issue close <编号>`，最后将上下文链接及其地址追加到 map 的“当前决策”部分
