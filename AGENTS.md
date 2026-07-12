# AGENTS.md — new-api 项目约定

不要发送可选性的额外说明

## 概览

这是一个使用 Go 构建的 AI API 网关/代理项目，它将 40+ 上游 AI 提供商（OpenAI、Claude、Gemini、Azure、AWS Bedrock 等）聚合到统一 API 之后，并包含用户管理、计费、限流和管理后台

## 技术栈

- **后端**：Go 1.22+、Gin Web 框架、GORM v2 ORM
- **前端**：React 19、TypeScript、Rsbuild、Base UI、Tailwind CSS
- **数据库**：PostgreSQL
- **缓存**：Redis（go-redis）+ 内存缓存
- **认证**：JWT、WebAuthn/Passkeys、OAuth（GitHub、Discord、OIDC 等）
- **前端包管理器**：Bun（优先于 npm/yarn/pnpm）

## 架构

分层架构：Router -> Controller -> Service -> Model

```
router/        — HTTP 路由（API、relay、dashboard、web）
controller/    — 请求处理器
service/       — 业务逻辑
model/         — 数据模型与数据库访问（GORM）
relay/         — AI API relay/proxy 及提供商适配器
  relay/channel/ — 提供商适配器（openai/、claude/、gemini/、aws/ 等）
middleware/    — 认证、限流、CORS、日志、分发
setting/       — 配置管理（ratio、model、operation、system、performance）
common/        — 通用工具（JSON、加密、Redis、env、rate-limit 等）
dto/           — 数据传输对象（请求/响应结构体）
constant/      — 常量（API 类型、channel 类型、上下文 key）
types/         — 类型定义（relay 格式、文件来源、错误）
i18n/          — 后端国际化（go-i18n，en/zh）
oauth/         — OAuth 提供商实现
pkg/           — 内部包（cachex、ionet）
web/             — 前端主题容器
 web/default/   — 默认前端（React 19、Rsbuild、Base UI、Tailwind）
  web/default/src/i18n/ — 前端国际化（i18next，zh/en）
```

## 国际化（i18n）

### 后端（`i18n/`）
- 库：`nicksnyder/go-i18n/v2`
- 语言：en、zh

### 前端（`web/default/src/i18n/`）
- 库：`i18next` + `react-i18next` + `i18next-browser-languagedetector`
- 语言：en、zh
- 翻译文件：`web/default/src/i18n/locales/{lang}.json`，扁平 JSON，key 使用英文源字符串
- 用法：使用 `useTranslation()` hook，在组件中调用 `t('English key')`
- CLI 工具：`bun run i18n:sync`（在 `web/default/` 下执行）

## 规则

### 通用代码质量

- 新代码应保持直接、易读，优先使用提前返回、清晰分支和命名明确的局部变量，避免深层嵌套或过度分层的控制流
- 尽量减少嵌套函数定义，只有在回调 API 必须如此，或者把闭包保留在本地明显比新增一个符号更简单时才使用
- 避免新增只有一个调用方、且不表达稳定业务概念的包级或模块级 helper，此类逻辑应内联在调用处
- 当一个函数代表可复用行为、框架/接口要求的回调、导出 API、测试夹具，或值得单独测试的复杂业务逻辑时，拆函数是合适的
- 如果保留单次使用的 helper，它的命名必须描述一个持久的领域概念，而不是仅仅为了缩短调用方而抽取的机械步骤

### 后端规则

**JSON 包：** 所有 JSON marshal/unmarshal 操作都必须使用 `common/json.go` 中的包装函数：

- `common.Marshal(v any) ([]byte, error)`
- `common.Unmarshal(data []byte, v any) error`
- `common.UnmarshalJsonStr(data string, v any) error`
- `common.DecodeJson(reader io.Reader, v any) error`
- `common.GetJsonType(data json.RawMessage) string`

不要在业务代码中直接导入或调用 `encoding/json`，`json.RawMessage`、`json.Number` 等来自 `encoding/json` 的类型定义仍然可以作为类型使用，但实际的 marshal/unmarshal 调用必须通过 `common.*`

**数据库约束：** 主数据库和日志数据库统一使用 PostgreSQL

- 优先使用 GORM 方法（`Create`、`Find`、`Where`、`Updates` 等），而不是原始 SQL
- 让 GORM 处理主键生成；不要直接使用 `SERIAL` 或手写自增逻辑
- 使用 GORM 查询方法构建 `SELECT ... FOR UPDATE` 行锁时，必须调用 `lockForUpdate(tx)`；禁止使用会被 GORM v2 静默忽略的 `tx.Set("gorm:query_option", "FOR UPDATE")`，也不要在调用处重复构造 `clause.Locking`
- 当无法避免原始 SQL 时，按 PostgreSQL 语法编写：
  - 列名引用使用 `"column"`
  - 对于 `group`、`key` 这类保留字列名，使用 `model/main.go` 中的 `commonGroupCol`、`commonKeyCol`
  - 布尔值使用 `commonTrueVal` / `commonFalseVal`
  - 仍然通过 `common.UsingMainDatabase(...)` 和 `common.UsingLogDatabase(...)` 收口数据库分支，避免把方言判断散落到业务代码里
- 新增或修改数据库逻辑时，不再为其他数据库添加兼容代码、迁移分支、部署说明或测试夹具
- 迁移和表结构变更以 PostgreSQL 为准，允许直接使用 PostgreSQL 支持的 `ALTER COLUMN`、类型转换和约束能力，但仍需保持升级过程可重复、可回滚、可审计
- 避免使用像 `gorm:"default:true"` 这样的 GORM 布尔默认值 tag，尤其当默认值本来就是代码里已强制执行的业务规则时，PostgreSQL 对默认值归一化也可能触发不必要的 `ALTER TABLE`，应优先在请求/模型归一化、hook、构造器或 service 逻辑中设置这些默认值

**Relay 与提供商行为：**

- 实现新 channel 时，确认提供商是否支持 `StreamOptions`；若支持，将该 channel 加入 `streamSupportedChannels`
- 对于从客户端 JSON 解析后再重新 marshal 给上游提供商的请求结构体，可选标量字段必须使用带 `omitempty` 的指针类型（例如 `*int`、`*uint`、`*float64`、`*bool`）
- 上游 relay 请求 DTO 必须保留显式零值：客户端 JSON 中缺失的字段应变成 `nil` 并被省略，而显式传入的 `0`、`0.0`、`false` 必须保持非 `nil` 并发送给上游
- 避免对可选请求参数使用带 `omitempty` 的非指针标量类型，因为零值会在 marshal 时被静默丢弃

**计费表达式系统：** 当处理分层/动态计费（基于表达式的定价）时，必须先阅读 `pkg/billingexpr/expr.md`，该文档说明了设计理念、表达式语言、完整架构、token 归一化规则、额度换算以及表达式版本化，所有计费表达式相关改动都必须遵循该文档

**计费安全不变量：** 额度/计费代码绝不能因为算术溢出或未验证输入而产生负收费（即反向给用户记信用）必须采用纵深防御：

- 每个会成为计费乘数的用户可控数量（图片 `n`、视频 `seconds`/`duration`、分辨率/质量倍率、批次数）在进入额度计算前都必须先做边界限制，超出范围时在请求校验阶段返回 400，已有边界包括：图片生成数量使用 `dto.MaxImageN`，任务视频时长使用 `relaycommon.MaxTaskDurationSeconds`，每种 relay 格式（OpenAI、Claude、Gemini、Responses）的 `max_tokens` 系列字段使用 `relay/helper/valid_request.go` 中的 `maxTokensLimit`，针对相同概念应复用这些常量，不要再引入新的临时限制，新增 relay 格式或请求 DTO 时，必须从第一天起就在其 validator 中限制 max-tokens 和数量字段
- 注意校验绕过路径：透传字段（例如 `Extra["parameters"]`）、任务 `metadata` map、multipart 表单字段，都可能绕过标准 DTO 校验携带同样的数量任何 adaptor 只要从这些路径读取乘数，就必须在本地施加相同边界（或 clamp）
- 从媒体元数据解析出的时长也是用户/上游可控的：音频文件头（转写 token 计算、TTS 响应时长）以及上游扣费数字（例如 Kling `FinalUnitDeduction`）都可能声称荒谬的数值它们在参与 token 计数前必须经过饱和转换
- 不要使用裸类型转换把计算出的额度或 token 数转成 `int`，例如 `int(float64(quota) * ratio)`、在无界输入上使用 `int(math.Round(...))`，或 `int(decimal.IntPart())`所有额度取整/换算都集中在 `common/quota_math.go`；请使用这些 helper：浮点乘积截断用 `common.QuotaFromFloat`，需要四舍五入时用 `common.QuotaRound`（远离零方向的 half-away-from-zero），decimal 乘积用 `common.QuotaFromDecimal``billingexpr.QuotaRound` 也委托给 `common.QuotaRound`不要重新引入本地转换 helper 或裸 cast饱和上限是 int32，因为数据库中的额度列（user/token/log）是 32 位整数，而且每次 clamp/NaN 回退都会通过 `common.SysError` 记录，因为单次请求本不应接近这些边界
- 饱和事件也必须可审计：每个 helper 都有一个 `*Checked` 变体（`common.QuotaFromFloatChecked` / `QuotaRoundChecked` / `QuotaFromDecimalChecked`），在发生 clamp 时额外返回一个 `*common.QuotaClamp`计算收费的计费路径必须把这个 clamp 挂到 `relayInfo.QuotaClamp`（或在线程任务结算链路中传递），并在写入 consume/task log 之前调用 `attachQuotaSaturation`（位于 `service/log_info_generate.go`），该函数会把标记嵌套到日志的 `other.admin_info.quota_saturation` 下，并输出带 request 关联信息的 `logger.LogWarn`把它放在 `admin_info` 下意味着天然只有管理员可见（非管理员日志视图会剥离 `admin_info`）新增计费路径时，必须使用 `*Checked` 变体并以相同方式暴露 clamp，这样异常才能同时在管理员日志 UI 和后端日志中被审计
- 倍率 map 必须通过 `types.PriceData.AddOtherRatio` 进入，该方法会拒绝非正数、NaN 和 +Inf 比率不要直接写 `PriceData.OtherRatios`，也不要削弱这些保护
- 预扣费和结算（差额）两端都必须安全：对于饱和后的超大额度，预扣费阶段必须以余额不足失败，绝不能静默溢出新增计费路径（新的 relay 格式、新的任务平台、新的调整 hook）时，必须完整梳理链路：校验 → EstimateBilling/OtherRatios → 额度转换 → 预扣费 → 结算/退款，并确认每一步都保持这些不变量
- 解析为无符号类型（`*uint`）的字段可以接受极大的正 JSON 数字（例如 `18446744073686646784`，这是包装后的负数）；仅做 `>= 0` 检查是不够的，必须有上界限制
- 这些不变量的回归测试应放在它们所保护的边界附近（请求校验器、转换 helper）可参考 `relay/helper/openai_image_request_test.go`、`relay/common/relay_utils_test.go` 和 `common/quota_math_test.go` 的风格

**后端测试质量：** 后端测试必须保护真实行为、API 契约、计费/记账不变量、数据兼容性或回归路径

- 不要添加那种只提高覆盖率数字、只证明代码能跑、或在没有用户可见/跨模块契约的情况下锁死实现细节的测试
- 避免伪造的 fuzz/stress/smoke/performance 测试，这类测试通常基于随机输入、大量循环、sleep、计时比较，或只断言日志输出
- 避免重复测试：如果两个测试只是名字不同但覆盖的是同一分支、没有新增不变量，就不要保留
- 避免编写会把错误的 provider/protocol 语义强加给生产代码的测试
- 避免测试私有常量、字段选择列表、helper 内部实现或文件布局；如果可观察行为已经在别处覆盖，就不要锁死这些细节
- 优先使用确定性的表驱动测试，给出明确输入和精确期望输出
- 如果测试依赖数据库、请求上下文、用户组、配置或缓存状态，必须在测试夹具中显式初始化这些状态
- 新增或大幅重写的 Go 后端测试必须使用 `github.com/stretchr/testify/require` 处理 setup 和致命断言，使用 `github.com/stretchr/testify/assert` 处理非致命值校验
- 避免手写断言 helper，除非它编码的是一个可复用的项目特定不变量
- 清理测试时，要保留有意义的回归覆盖如果删除的旧测试是间接覆盖真实契约，应使用一个更小、更直接的测试来覆盖那个契约

### 前端规则

- 前端（`web/default/`）必须优先使用 `bun` 作为包管理器和脚本运行器：
  - `bun install` 用于安装依赖
  - `bun run dev` 用于开发服务器
  - `bun run build` 用于生产构建
  - `bun run i18n:*` 用于 i18n 工具
- 前端 UI 文案必须通过 `i18next` / `react-i18next` 支持国际化，使用 `web/default/src/i18n/locales/{lang}.json` 中的扁平 JSON 语言文件，key 为英文源字符串
- 在 React 组件中，使用 `useTranslation()` 并调用 `t('English key')` 渲染面向用户的文案
- 前端的详细约定（包括 TypeScript、组件结构、样式、可访问性、测试和构建检查）遵循 `web/default/AGENTS.md`

### 项目治理

**Git 提交规范：** 提交信息必须使用 Conventional Commits 风格，允许中文和英文两种写法

- 格式统一为：`type: subject`
- `type` 使用小写英文，例如：`fix`、`feat`、`refactor`、`docs`、`test`、`chore`、`style`、`perf`、`build`、`ci`、`revert`
- 中文提交信息示例：`fix: 修复某种错误`
- 英文提交信息示例：`fix: resolve token quota overflow`
- `:` 后必须保留一个空格
- `subject` 必须直接描述本次改动，不要写空泛内容，例如“update”“modify”“调整一下”
- 提交信息的 `subject` 中禁止使用中文句号
- 提交信息的 `subject` 中禁止使用英文句号 `.`
- 除非有明确需要，否则单个 commit 不要混合多类无关改动
- 如果当前修改是在修正或补全同一分支中尚未推送的同主题提交，必须使用 amend、fixup 或交互式 rebase 整理进原提交；不得追加“修正上一提交”的补丁 commit。只有主题和审查边界确实独立时才新增 commit

**上游提交状态标记：** 比较或处理上游 `QuantumNous/new-api` 提交时：

- 每条上游提交使用完整 SHA 标识，并且最多只能存在一种状态 tag：`sync/<完整SHA>`、`covered/<完整SHA>` 或 `rejected/<完整SHA>`；没有状态 tag 才表示尚待处理
- `sync/<完整SHA>` 表示本仓库实际产生了吸收改动；tag 必须指向本地主线中对应的吸收提交，该提交正文必须记录 `Upstream-SHA: <完整SHA>`
- 吸收提交必须按实际改动使用 Conventional Commits 类型，例如文档用 `docs:`、修复用 `fix:`、功能用 `feat:`、重构用 `refactor:`；不得使用自定义的 `sync:` 类型
- 上游提交、本地吸收提交和 `sync/*` tag 必须严格一一对应；禁止聚合或 squash 多条上游提交，也禁止让多个 `sync/*` tag 指向同一条本地提交
- 多条上游提交存在依赖时，应按依赖顺序分别同步、验证、提交和打 tag；无法安全拆分时，整组停止自动同步并等待决策
- `covered/<完整SHA>` 表示本仓库已经行为等价，无需产生本地改动；只重复父提交内容、没有独立补丁的 merge 提交也使用该状态
- 混合多个独立改动的上游提交必须先拆分审查；只要仍有未审查部分就必须保持待处理。文件多、存在冲突或不能整包直接应用，都不能作为整条 `rejected` 的依据
- 涉及用户可见 UI 的上游改动，在给出 `sync`、`covered` 或 `rejected` 建议前，必须提供同一页面、同一视口和同一状态下的实际视觉对比，并说明上游改动目的、可见效果及与本地设计的冲突；无法完成视觉验证时必须保持待处理，不得仅凭代码差异下结论
- `rejected/<完整SHA>` 只表示全部独立改动均已审查，且用户明确决定整条不同步；未经用户最终确认不得创建该状态
- 混合提交中只要有部分内容需要落到本地，就应在全部部分处理完后创建对应的本地吸收提交和 `sync/<完整SHA>` tag，并在 tag 消息中说明吸收和放弃的范围；全部内容均已在本地等价时才使用 `covered/<完整SHA>`
- `covered/*` 和 `rejected/*` 必须使用注解 tag，直接指向对应的上游提交对象，并在 tag 消息中记录判定依据；不得为它们制造空提交
- 每次比较上游前必须先检查三种状态 tag；已有状态的提交视为已处理，不得重复列为待处理或再次要求用户决策
- 创建状态 tag 前后必须检查三种状态互斥、tag 名中的 SHA 与目标或提交正文一致，以及所有 `sync/*` tag 的本地落点不存在重复

**Pull Request：** 创建 PR 时：

- 起草 PR 标题和正文时，必须使用仓库的 `.github/PULL_REQUEST_TEMPLATE.md` 模板，保留模板结构并填写对应内容，不要改成自定义格式

## Agent 技能

### Issue 跟踪器

Issue 和 PRD 统一记录在 GitHub Issues 中，外部 PR 也作为分诊入口。详见 `docs/agents/issue-tracker.md`

### 分诊标签

仓库使用 `needs-triage`、`needs-info`、`ready-for-agent`、`ready-for-human` 和 `wontfix` 五个标准分诊标签。详见 `docs/agents/triage-labels.md`

### 领域文档

仓库使用单上下文领域文档布局。详见 `docs/agents/domain.md`
