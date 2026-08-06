# 《十日终焉》单机剧情桌游：第二章完整 PLAN

状态：**本地实装与自动验收完成；等待用户本地确认后进入 Render 发布门。**  
暂定章名：**第二章 · 四面杀机**  
玩家视角：齐夏  
前置章节：第一章 · 说谎者  

> 本文中的“第二章”是游戏章节，不是原著发布单元“第2章”。第一章已经使用原著第1—10章；第二章承接人羊死亡后的内容。

## 0. 实施约束

- 本 PLAN 已冻结为第二章的实现契约；实现必须依照本文的原文范围、玩法、资产表和验收门推进。
- 已完成：原文审计、纯规则引擎、存档门禁、第一章结算入口、第二章完整流程、正式视觉、十四段动画、静态固定语音、固定 BGM/SFX、自动测试与本地实机验收。
- 仍待发布门：用户确认本地版本后，才允许提交、推送、Render 发布并进行线上同版本验收。
- 实现中不得擅自扩写主线、改变成功路径、交换角色行为或提前公开伏笔答案。

---

## 1. 原文范围

### 1.1 推荐范围

第二章采用：

- 起点：原著第11章《继续吧》，原文第1237行，人羊死亡后齐夏继续检查现场。
- 主体：原著第11—20章，原文第1237—2845行。
- 结尾镜头：原著第21章《腹地》前半，原文第2847—2927行。
- 收束画面：九人来到终焉之地广场，看见暗红天空、土色太阳、破败城市、电子屏与铜钟；屏幕写出“我听到了「招灾」的回响。”
- 不进入：便利店、女店员与九人分队。这些内容留到第三章。

### 1.2 为什么这样切

这段内容是一个完整的“面试房后半场”：

1. 从人羊面具内侧发现第二阶段线索。
2. 完成“雨后春笋”。
3. 完成“天降死亡”。
4. 完成“是与非”。
5. 人龙结算四场考验并发放四颗“道”。
6. 终焉之地第一次完整揭幕。

若在第20章人龙讲话处结束，视觉与情绪没有落点；加入第21章广场揭幕后，第二章才同时具有玩法闭环和章节级高潮。

### 1.3 原文锚点

| 原著范围 | 原文行号 | 必须复刻的内容 |
|---|---:|---|
| 第11章《继续吧》 | 1237—1401 | 齐夏判断人羊为何射中心脏；面具内侧文字；墙面和屋顶出现鱼叉孔 |
| 第12章《你们的家乡》 | 1403—1577 | 1:15时限；可旋转的桌面；九人的省份；地图推理 |
| 第13章《一场雨》 | 1579—1791 | 九点连成“右”；桌面裂为九小一大；大桌板是陷阱；九块小板组成春笋锥体 |
| 第14章《雨后见》 | 1793—1957 | 鱼叉雨；甜甜手掌受伤；韩一墨肩膀被贯穿；鱼叉开始回收 |
| 第15章《一波未平》 | 1959—2091 | 打结留叉；林檎的绳结自动分离；李尚武割绳；乔家劲以身体撑住韩一墨 |
| 第16章《一波又起》 | 2093—2237 | 鱼叉尾部文字；1:30“死亡再次天降”；九个天花板孔；羊与狗的疑点 |
| 第17章《羊和狗》 | 2239—2389 | “羊”是说谎类游戏、“狗”是合作类游戏；墙边是陷阱；方板卡入天花板孔 |
| 第18章《是非题》 | 2391—2559 | 地板碎裂；九人吊在把手上；肖冉浪费第一个问题；人蛇宣布三问规则 |
| 第19章《无所不能》 | 2561—2727 | 齐夏的元问题；人蛇拉杆；长廊、生肖与大量死者房间 |
| 第20章《寻道》 | 2729—2845 | 人龙；十天；三千六百个“道”；四场考验各奖励一颗“道” |
| 第21章《腹地》前半 | 2847—2927 | 通过游戏获取“道”；暗红死城；门消失；电子屏与铜钟；“招灾”的回响 |

### 1.4 本章不可提前解释的伏笔

- 人羊面具内为何写“我是人狗”。
- “诅咒”的完整含义。
- 齐夏脑海中等待他的女人到底是谁。
- 林檎为何习惯捂住口鼻、为何提到“口罩”。
- 动物面具为什么全部属于十二生肖。
- “回响”“招灾”是什么。
- “道”的真实材质、价值与三千六百的深层含义。
- 九人是否真的死亡。

本章只展示原文当时可知的信息，不用系统提示解释这些伏笔。

---

## 2. 角色连续性圣经

### 2.1 玩家身份

- 玩家始终扮演齐夏。
- 齐夏是成年男性、职业骗子、冷静、推演快、对他人保持戒心。
- 玩家可以做错误选择并死亡，但成功路线只能复刻齐夏在原文中的判断与行动。
- 不提供改变正史的“好感选项”或原创分支。

### 2.2 本章九人状态

| 角色 | 本章起始状态 | 本章固定行为 | 本章结束状态 |
|---|---|---|---|
| 齐夏 | 完好，仍不信任他人 | 检查面具、解地图、识破大桌板、指挥留叉、识破人羊谎言、提出元问题 | 持有四颗“道”，明确要离开 |
| 乔家劲 | 完好，开始主动信任齐夏 | 用港普说话；出力转桌；扶甜甜；托住韩一墨；试图攻击人蛇 | 完好，与齐夏形成初步合作 |
| 甜甜 | 完好 | 先尝试自己转圈；鱼叉雨中手掌被刺穿 | 右手有包扎，不能突然恢复 |
| 肖冉 | 完好 | 鱼叉险些刺中眼睛；“是与非”中抢先问出第一个问题 | 完好，但因误用问题自责 |
| 赵海博 | 完好 | 处理伤势；一度主张慢慢割绳；解释鱼叉暂不能拔出 | 完好，承担医生职责 |
| 韩一墨 | 紧张 | 肩膀被鱼叉贯穿；失血、无力；悬吊时险些坠落 | 肩上仍留鱼叉，本章末尚未缝合 |
| 章晨泽 | 完好 | 提出盾牌覆盖问题；保持理性 | 完好 |
| 李尚武 | 完好 | 拿大桌板后服从齐夏丢弃；精准割绳；托住韩一墨；阻止乔家劲攻击人蛇 | 完好 |
| 林檎 | 完好，持续捂口鼻 | 根据血迹计数；打出可自动分离的绳结；能辨别齐夏没有说谎 | 完好，口罩伏笔只展示不解释 |

### 2.3 新角色

| 角色 | 原文形象 | 功能 |
|---|---|---|
| 人蛇 | 老旧西装、墨绿色巨大蛇头、腥臭、低温感 | 主持“是与非”，不说假话 |
| 人龙 | 多种腐烂动物器官缝合的面具，鹰爪手套 | 说明十天、三千六百个“道”与游戏奖励 |

人羊、人狗不是两个可以随意交换立绘的新角色。本章沿用第一章死亡主持者的同一具身体和面具，只通过面具内文字与鱼叉文字制造身份矛盾。

---

## 3. 第二章的玩家体验目标

第一章的核心是“收集证词并证明唯一说谎者”；第二章改为连续空间推理，但仍保持桌游式思考：

1. **观察**：点击真实场景中的面具、座钟、桌面、墙孔、鱼叉、绳子、天花板孔。
2. **整理**：把原始观察放进齐夏脑内草稿，不直接写答案。
3. **推演**：地图连字、盾牌结构、游戏类型与逻辑问题分别使用不同的桌游组件。
4. **下令**：玩家以齐夏身份向队友发出行动命令。
5. **承担后果**：错误会显示具体失败原因并推进剧情钟；达到死线或做出不可逆错误会死亡。

本章不能退化为：

- 连续点击“下一句”的视觉小说；
- 只有一张大图和一大段说明文字；
- 直接把答案写在提示栏的解谜网页；
- 没有明确规则的快速反应游戏；
- 巨大的章名或“说谎者”字样遮住主要画面。

---

## 4. 章节流程

### 4.1 场景 A：人羊死后

**目的**：从第一章自然接续，不另开无关菜单。

流程：

1. 第一章成功结算后出现“继续检查房间”，不是“重新复盘”唯一按钮。
2. 人羊倒在桌边，枪落在地上，羊头面具被乔家劲拿起。
3. 玩家自由检查“头部、心口、手枪、面具”。
4. 赵海博提供心脏中弹后仍可能短暂有意识的医学事实。
5. 玩家在草稿中选择“保护面具”作为人羊射中心脏的原因。
6. 翻开面具，逐行出现原文线索。

面具内必须保留的七条文字：

- 我是「人狗」。
- 你们受了诅咒。
- 我希望你们活下去。
- 时钟一刻不停，四面皆有杀机。
- 若想活下去，请往家乡的方向转动一百次。
- 都说雨后春笋，为什么春笋不怕雨打？
- 雨后见。

这些文字是线索，不添加解释。

### 4.2 场景 B：家乡地图

**公开规则**：

- 座钟从 1:00 开始。
- 到 1:15，四面和屋顶的鱼叉将发射。
- 调查动作推进剧情钟；这不是现实倒计时。
- 每个按钮在点击前显示会推进几分钟。

**原始事实**：

- 桌面可以旋转，转动时内部有链条声。
- 桌面很重，需要九人合作。
- 九人的地点为：内蒙、四川、陕西、云南大理、广东、宁夏、江苏、山东、广西。
- 原文里赵海博说“在江苏工作”，UI不能偷偷改成“江苏老家”。

**桌游组件**：

- 一张不显示答案的中国省级轮廓图。
- 九枚写着角色姓名的地点标记。
- 玩家根据九人的原话放置标记。
- 放置正确后允许用三组连线笔划连接九点。
- 系统只检查标记与笔划，不在解开前显示“右”。

**正史路径**：

1. 乔家劲等人先向左转了十几圈。
2. 玩家发现省份排列构成“右”。
3. 齐夏叫停众人，改向右。
4. 九人合力完成一百圈。

**错误反馈**：

- 省份放错：直接标红对应角色标记并写“该地点与此人的原话不一致”，推进 1 分钟。
- 笔划不闭合：标红错误笔划并写“这一笔没有连接已知地点”，推进 1 分钟。
- 选择向左：写“九个地点没有构成‘左’的字形证据”，推进 2 分钟，允许修正。
- 到 1:15仍未完成：触发鱼叉贯穿的死亡结算，从“家乡地图”检查点重来。

### 4.3 场景 C：雨后春笋

桌面完成一百圈后，不出现答案页，直接进入场景变化动画：

1. 座钟射出八道细光。
2. 桌面沿光线裂开。
3. 出现九块小三角桌板和一块大桌板。
4. 每块背面有把手。
5. 李尚武先拿起大桌板，其他人拿小桌板。

**玩家任务**：

- 在俯视桌面中拖拽或点选桌板。
- 判断大桌板是否使用。
- 调整九块小板的尖端方向。
- 把九块小板拼成锥体。

**无障碍替代**：

- 不能拖拽时可用“选择桌板 -> 选择位置 -> 旋转”。
- 键盘方向键可以移动和旋转。

**正确结构**：

- 丢弃大桌板。
- 九块小板尖端向上、向内靠拢，形成棱锥。
- 鱼叉以斜角撞击五个方向，降低贯穿力。

**错误反馈与死亡**：

- 使用大桌板：标出“大板占用了第九块小板的位置，结构无法闭合”。
- 尖端朝下：标出“上方存在开口，不能同时保护头顶”。
- 错落直立：标出“桌板与鱼叉近乎垂直，贯穿风险没有降低”。
- 每次错误推演推进 1 分钟。
- 玩家按下“承受鱼叉”属于不可逆提交；结构错误则展示对应破口、角色受击和死亡，从盾牌拼装检查点重来。

**固定伤情**：

- 正确结构也不是无伤。
- 肖冉眼前两三厘米处有鱼叉停住。
- 甜甜右手掌被刺穿。
- 乔家劲去扶甜甜的桌板。
- 韩一墨肩膀被鱼叉贯穿。
- 李尚武分担韩一墨的桌板。

不得把伤者随机化，否则后续剧情会断裂。

### 4.4 场景 D：留下一枚鱼叉

**危机**：

- 鱼叉都有绳子连接墙洞。
- 韩一墨被倒钩贯穿。
- 鱼叉开始回收，徒手无法对抗。

**行动卡**：

- 直接拔出韩一墨的鱼叉。
- 徒手拉住绳子。
- 用两根绳子打结互相对拉。
- 让林檎处理绳结。
- 让李尚武持鱼叉割绳。
- 让乔家劲挡在韩一墨和墙之间。

玩家必须排出正史行动链：

1. 两根绳子打结互相对拉。
2. 使用林檎能自动分离的绳结保留一枚鱼叉。
3. 李尚武用留下的鱼叉切割韩一墨身后的绳子。
4. 乔家劲用身体撑住韩一墨，争取最后时间。

**反馈规则**：

- 直接拔叉：明确显示“倒钩会扩大伤口，且没有解决墙洞回收的绳索”，推进 1 格。
- 徒手拉住：明确显示“回收力足以撕碎木板，人的力量不能抵消”，推进 1 格。
- 选错切割者：说明该角色为何无法稳定完成切割，推进 1 格。
- 四格危机条耗尽，韩一墨被钉入墙面，触发死亡/失去队友的失败结算。

### 4.5 场景 E：天降死亡

李尚武检查留下的鱼叉，尾部出现原文文字：

- 能看到这段字，说明你们活下来了。
- 可是你们到底活下来几个人呢？
- 有人受伤吗？
- 我真的非常担忧你们。
- 我不能眼睁睁地看着你们去死。
- 一刻钟后，死亡再次天降。
- 躲开它们，想办法活下来。

房间变化：

- 墙洞消失。
- 天花板出现九个长方形孔。
- 九块桌板只剩带把手的正方形中央。
- 座钟走向 1:30。

**推理板**：

玩家需要连接四条事实：

1. 人羊主持的游戏允许规则文字说谎。
2. 人狗对应合作，上一场必须九人合力。
3. 鱼叉文字声称“不能看着你们去死”。
4. 九个孔与九块带把手方板数量一致。

**行动**：

1. 选择站位：墙边或九孔下方。
2. 选择方板用途：头顶盾牌、铺地、塞入孔中。
3. 在地板抬升时把方板竖直塞入孔，再横置并向下拉。
4. 地板粉碎后，九人抓住把手悬吊。

**错误反馈**：

- 站墙边：提交前显示“该方案完全相信了人羊的文字，没有处理‘羊会说谎’这一事实”；若坚持提交则死亡。
- 把板当普通盾牌：显示“把手与孔洞的数量对应仍未被解释”。
- 铺地：显示“方板面积不足以覆盖地面，也没有利用把手”。
- 达到 1:30仍未闭合推演：触发地板挤压或坠落死亡，从本场检查点重来。

### 4.6 场景 F：是与非

地板粉碎后：

- 九人悬吊在十米高空。
- 韩一墨只能用左手抓住把手。
- 乔家劲与李尚武托住韩一墨。
- 甜甜因右手受伤下滑，齐夏抓住她的手腕。
- 下方木门打开，人蛇进入。

**公开规则**：

- 所有人合计可以问三个问题。
- 人蛇只能回答“是”或“否”。
- 人蛇不会说假话。
- 三问后，只有人蛇答应救人，才会拉下拉杆。

**固定剧情**：

- 第一问不可由玩家篡改。
- 肖冉抢先问：“你能放我们下来吗？”
- 人蛇回答：“否。”
- 玩家只剩两个问题。

**桌游组件**：

- 一个“问题构造器”，提供原文存在的逻辑片段，而不是直接列出完整答案。
- 玩家组合“假如 / 我的下一个问题 / 你会不会拉下拉杆 / 你的回答 / 会跟这个问题一样吗”等片段。
- 右侧用真假分支图即时显示：当前问题是否仍存在“不拉杆”的合法分支。
- 分支图只显示逻辑结果，不自动补全正确句子。

**正确问题**：

只有玩家组合正确并提交后，才完整显示齐夏原文中的元问题。系统不能提前在提示、教程或测试文本里泄露整句答案。

**错误反馈**：

- 普通请求：显示“此问只得到态度，没有约束下一次回答”。
- 反向请求：显示“回答‘是’仍可能代表拒绝救人”。
- 不闭合的元问题：在分支图中标红仍然存在的“不拉杆”路径。
- 第二问错误会消耗问题数。
- 第三问仍未迫使人蛇答应，则人蛇关门，九人最终坠落或力竭，触发死亡并从“是与非”检查点重来。

### 4.7 场景 G：走廊与生肖

成功后：

1. 人蛇拉下拉杆，天花板下降。
2. 乔家劲试图攻击人蛇，李尚武阻止。
3. 人蛇打开木门。
4. 九人进入低矮、腐烂气味沉重的长廊。
5. 两侧数以千计的门打开。
6. 大多数房间走出浑身是血的生肖主持者，只有极少数幸存者。
7. 出现牛、马、狗、羊、蛇、鼠、鸡等面具。
8. 齐夏只得出“是生肖”，不解释等级和规则。

本段是可行走的短场景，不是纯文字过场。玩家只能前进和观察，不能改变正史。

### 4.8 场景 H：寻道与终焉之地揭幕

人龙必须说明：

- 十天内需要三千六百个“道”。
- 不足则他们所在的世界湮灭。
- “道”是白色外圈、金色内圈、略有弹性的金色小球。
- 不同游戏会奖励不同数量的“道”。
- 四个考验分别是“说谎者”“雨后春笋”“天降死亡”“是与非”。
- 九人获得四颗“道”。
- 有罪的人得不了“道”，只有所谓“天选之人”可以。

随后进入章节收束动画：

1. 九人穿过出口。
2. 门与建筑从背后消失。
3. 暗红天空和土色太阳逐层显露。
4. 黑线在太阳表面蔓延。
5. 破败城市与暗红植物进入景深。
6. 广场电子屏亮起。
7. 斑驳铜钟从黑暗中显形。
8. 屏幕显示：“我听到了「招灾」的回响。”
9. 进入第二章结算，保存四颗“道”和全部固定伤情。

结算页只显示本章获得的信息，不解释“招灾”。

---

## 5. 失败、死亡与检查点

### 5.1 死亡仍然存在

第二章不会因为第一章的反馈而取消死亡。死亡是规则压力的一部分，但必须公平：

- 所有代价在操作前显示。
- 所有错误在操作后指出具体错误字段或逻辑缺口。
- 推演错误允许修正并推进剧情钟。
- 只有到达死线、耗尽次数或确认不可逆错误时才死亡。
- 死亡动画明确对应玩家刚才的错误，不使用随机死法。

### 5.2 检查点

| 检查点 | 重开位置 |
|---|---|
| C2-A | 人羊死后、检查面具前 |
| C2-B | 家乡地图与转桌前 |
| C2-C | 桌板裂开、盾牌拼装前 |
| C2-D | 鱼叉回收、留叉救援前 |
| C2-E | 读取鱼叉文字、天降死亡前 |
| C2-F | 人蛇公布“是与非”规则后 |
| C2-G | 长廊入口 |
| C2-H | 终焉之地揭幕动画 |

死亡后提供：

- “重试当前考验”
- “查看刚才的错误”
- “回到第二章开头”

不能只提供“回到抽牌前”，也不能强迫重玩第一章。

---

## 6. 视觉 PLAN

### 6.1 视觉事实源

优先级：

1. 腾讯视频、番茄动漫官方动画 PV：人物、生肖、终焉之地、回响的色彩和构图。
2. 腾讯视频、柠萌影视官方剧集物料：写实材质、建筑、服化道，只作为写实皮肤参考。
3. 官方出版物、授权卡牌与活动物料：图形、字体语汇、道具纹样。
4. 原著文字：补齐尚无官方镜头的场景几何和道具动作。

已确认官方入口：

- 腾讯视频官方动画 PV：`https://weibo.com/2591595652/5312612583604911`
- 十日终焉官方微博：`https://weibo.com/u/7876487889`
- 腾讯视频官方剧集物料：`https://weibo.com/2591595652/5286133916766866`

正式开发前先扩充 `content/official-visual-reference.json`：

- 每条视觉引用记录来源账号、原帖 URL、物料名称、画面时间码或图片序号。
- 记录可参考的角色、场景、色板、材质、构图和禁止用途。
- 同人图、百科二传图、无来源图片不得进入正式资产。
- 官方物料没有展示的细节，只能按原著补齐，并标注为“原著补足”，不能冒充官方画面。

### 6.2 固定角色资产

- 第一章九人沿用已锁定的同一张脸、同一发型、同一服装和同一年龄。
- 第二章不得重新生成九人立绘。
- 伤情通过独立透明覆盖层实现：血迹、手掌包扎、肩部鱼叉、脸色与汗水；覆盖层不能改变脸。
- 人物图统一保留头顶、下巴、双肩安全区。
- 桌面与手机都用 `contain` 或经角色单独审核的裁切，不使用会裁头的通用 `cover`。

新增固定资产：

- `renshe-v1`
- `renlong-v1`

两者完成一次角色设定审核后永久锁定，后续章节只做受伤、光线和动作覆盖层，不重新换脸或换面具。

### 6.3 场景与道具资产清单

| ID | 内容 | 来源约束 |
|---|---|---|
| `interview-room-damaged-v2` | 人羊死亡后的面试房 | 沿用第一章房间；按原著增加孔洞和破坏 |
| `renyang-mask-inner-v1` | 羊皮面具内侧文字 | 原著精确文字 |
| `harpoon-wall-rig-v1` | 墙面、屋顶孔和上弦鱼叉 | 原著结构；官方材质色板 |
| `hometown-map-board-v1` | 中国省级轮廓桌游板 | 中性制图，不预画答案 |
| `table-wedges-v1` | 九小一大桌板 | 原著数量、把手和形状 |
| `bamboo-cone-v1` | 九块小板组成棱锥 | 原著结构 |
| `harpoon-rain-fx-v1` | 五方向鱼叉雨 | 独立动画层 |
| `square-handle-board-v1` | 方板与把手 | 原著结构 |
| `ceiling-nine-holes-v1` | 九个长方形孔 | 原著数量与比例 |
| `collapse-shaft-v1` | 十米深坑和下方木门 | 原著空间 |
| `zodiac-corridor-v1` | 低矮长廊、数千扇门 | 官方 PV 优先 |
| `dao-token-v1` | 白边金心、有弹性的“道” | 原著形态；官方物料优先 |
| `termination-plaza-v1` | 广场、电子屏、铜钟 | 官方 PV 优先 |
| `termination-city-v1` | 暗红天空、土色太阳、破城、红色植物 | 官方 PV 优先 |

### 6.4 画面结构

桌面：

- 主场景占视口约 70%，行动托盘占底部约 30%。
- HUD 是窄条，不盖住角色头部和核心机关。
- 草稿、规则与记录使用侧抽屉，内部独立滚动。

手机：

- 主场景使用 `100svh`，适配浏览器地址栏变化。
- 人物全身/半身画面放在上方安全区；字幕与按钮在下方，不与脸重叠。
- 行动托盘可折叠但当前目标始终可见。
- 最小点击区域 44×44 CSS 像素。
- 所有长内容可触摸惯性滚动并显示滚动条。
- 不禁用浏览器缩放。

### 6.5 必做动画

| 动画 | 目标 |
|---|---|
| 人羊心跳停止与面具翻面 | 接续第一章，不用硬切 |
| 墙面软化、孔洞浮现 | 表现房间不符合物理规律 |
| 鱼叉后退上弦、链条抖动 | 建立方向与紧迫感 |
| 座钟八道光切桌 | 清晰展示九小一大 |
| 桌板拖拽、旋转、磁吸闭合 | 让“春笋”是玩家拼出来的 |
| 五方向鱼叉雨、斜面弹开 | 让正确结构可视化 |
| 鱼叉贯穿甜甜和韩一墨 | 固定伤情，不做随机血浆 |
| 绳索绷紧、断裂、回抽 | 清楚表现留叉原理 |
| 地板上升、方板入孔、地面崩塌 | “天降死亡”核心机关 |
| 九人悬吊与体力下降 | “是与非”的空间压力 |
| 人蛇拉杆与天花板下降 | 成功反馈 |
| 长廊千门渐开 | 扩大世界规模 |
| 门后空间消失 | 终焉之地的非现实感 |
| 暗红城市多层视差与铜钟显形 | 本章视觉高潮 |

每个关键动画：

- 支持跳过和重看。
- 支持 `prefers-reduced-motion`。
- 跳过动画不跳过必须读到的规则。
- 手机低性能模式减少粒子数量，但不移除机关动作。

---

## 7. 音频与固定语音 PLAN

### 7.1 永久音色规则

- 第一章已经固定的九人音色继续使用，不重新选音色。
- 齐夏始终为固定成年男声。
- 乔家劲始终为同一个港普男声音色，不回退为标准北方普通话。
- 甜甜始终为成年、甜美但不幼态的女声。
- 追问、判断与内心推演由齐夏说，不由当前被问角色说。
- 人蛇、人龙各自只建立一个固定音色，首次确认后写入角色圣经，不再更换。

### 7.2 生成与存储

- 台词表先经原文核对，再一次性合成。
- 每句使用稳定 `lineId`，格式如 `c02-qixia-001`。
- 一句台词只生成一次。
- 音频落为静态资产并保存 SHA-256、时长、角色、音色 ID、模型、生成日期和原文锚点。
- 运行时只能读取静态清单，不允许调用 TTS API重新生成。
- 不把短期第三方 URL 当作永久资产；正式版使用项目托管的静态文件或受版本管理的对象存储。
- 所有语音都要有字幕；字幕文本与音频 `lineId` 一一对应。

### 7.3 本章新增语音角色

- 人羊/人狗留下的文字不自动改成“旁白朗读”；玩家点击文字时可由齐夏低声读出。
- 人蛇：成年男性、平稳、阴冷、逻辑清晰，不做夸张怪物声。
- 人龙：成年男性、腐朽、兴奋、带疯癫笑意，但对白必须听清。

### 7.4 BGM

本章至少三条可无缝循环的固定声场：

1. `c02-room-tension`：面具、地图与桌面阶段；链条脉冲逐渐加速。
2. `c02-harpoon-crisis`：鱼叉雨、回收、悬吊阶段；高频金属与中低频心跳。
3. `c02-termination-reveal`：长廊和终焉之地揭幕；低沉钟声、远处风声、腐朽城市氛围。

要求：

- 必须在玩家点击“继续检查房间”这一用户手势后启动。
- 保留明显的声场开关和音量滑杆。
- 手机扬声器可听，不能只使用 55/82Hz超低频。
- 语音播放时 BGM 自动降低，不掩盖台词。
- 目标响度和峰值在资产清单中记录，避免不同场景突然过响或无声。

### 7.5 SFX

- 枪落地、面具翻面、钢笔字显现
- 链条上弦、鱼叉破空、撞击木板、木板贯穿
- 座钟走针、桌面卡榫、桌板裂开
- 绳索绷紧、断裂、快速回抽
- 地板抬升、碎裂、深坑回声
- 人蛇拉杆、木门开启、千门开启
- “道”落入掌心、电子屏通电、远方铜钟

---

## 8. 信息层级与防剧透

每个谜题的数据分为四层：

1. `observations`：玩家实际看到或听到的原始事实。
2. `hypotheses`：玩家可以尝试组合的推测。
3. `validatedSteps`：已通过的中间结论。
4. `solution`：成功后才出现的最终解释。

强制防泄露测试：

- 地图解开前，线索和 HUD 不得出现“向右转”或“右字”。
- 盾牌拼好前，不得出现“丢弃大桌板”“九块组成棱锥”。
- 天降死亡解开前，不得出现“站在孔洞下面才是生路”。
- 是与非解开前，不得出现完整元问题。
- 终焉之地揭幕后，不得解释“招灾”的含义。

帮助系统分三层：

- 提醒当前还没利用的原始事实。
- 指出未闭合的逻辑关系。
- 最后才高亮应重新观察的物件。

帮助系统不直接填写答案。

---

## 9. UI 与规则说明

### 9.1 开章规则卡

只显示一次，内容控制在一屏：

- 你扮演齐夏。
- 点击场景收集原始事实。
- 把事实拖入草稿完成推演。
- 操作会推进剧情钟，代价写在按钮旁。
- 错误会标出具体原因。
- 到达死线或用尽问题次数会死亡。
- 可随时打开“规则”，规则面板会暂停交互。

### 9.2 常驻 HUD

必须始终显示：

- 当前考验名称。
- 当前目标。
- 当前剧情钟或剩余问题数。
- 伤者状态。
- 已获得的“道”数量。
- 音量与静音状态。

第二章不能把所有信息塞进长抽屉。当前目标、代价、错误反馈必须在主界面直接可见。

### 9.3 记录册

记录册分四页：

- 现场：物件和环境原始事实。
- 人物：九人当下伤情与已公开行为。
- 推演：地图、结构和逻辑分支。
- 纪要：已经发生的正史事件。

所有页面在手机上可滚动，关闭后保留滚动位置。

---

## 10. 存档与章节连接

### 10.1 第一章到第二章

第一章成功结算新增“继续检查房间”入口。

进入第二章时保存：

- 第一章投票成功。
- 人羊死亡。
- 九人全部存活。
- 座钟时间 1:00。
- 九人的第一章记录。
- 当前固定角色资产版本。
- 当前固定音色版本。

### 10.2 第二章完成存档

必须保存：

- 第二章八个检查点状态。
- 甜甜右手伤。
- 韩一墨肩伤与留置鱼叉。
- 四颗“道”。
- 齐夏、乔家劲的初步合作。
- 林檎的口罩异常已经被看到但未解释。
- 已识别“生肖”。
- 已听到“招灾”的回响。

存档要带 `schemaVersion`，后续更新不得让旧玩家从第一章重来。

---

## 11. 工程结构 PLAN

第一章目前主要逻辑集中在单一页面。第二章不继续把全部状态堆进同一文件。

建议结构：

```text
app/
  chapter/
    1/page.tsx
    2/page.tsx
  lib/
    chapters/
      chapter-02-canon.ts
      chapter-02-engine.ts
      chapter-02-voice.ts
      chapter-02-assets.ts
    save-game.ts
content/
  chapter-02-canon-audit.json
  chapter-02-asset-manifest.json
public/
  art/chapter-02/
  audio/chapter-02/
tests/
  chapter-02-canon.test.mjs
  chapter-02-engine.test.mjs
  chapter-02-assets.test.mjs
```

原则：

- 剧情数据、规则引擎、React画面和资产清单分离。
- 成功与死亡由纯状态机决定，方便穷举测试。
- 每个台词、观察、结论带原文行号。
- 组件不直接硬编码答案。
- 第一章旧路由保留，旧存档可继续。
- 不碰其他项目或 `boardgame`。

---

## 12. 开发顺序

### Phase 1：原文与资产审计

1. 建立第1237—2927行的逐场景 canon audit。
2. 固定每句对白、物件、角色动作、伤情和伏笔。
3. 扩充官方视觉引用，给每个新资产绑定来源。
4. 完成第二章角色、场景、语音资产清单。
5. 用户确认视觉与角色圣经。

### Phase 2：纯规则原型

1. 实现章节状态机和检查点。
2. 实现地图、盾牌、救援、天降死亡、是与非五个交互原型。
3. 使用占位色块验证规则，不先做装饰。
4. 穷举成功、错误、死亡与重试路径。

### Phase 3：正式视觉与动画

1. 复用九人固定立绘。
2. 完成房间机关层、道具层、伤情层。
3. 完成所有必做动画。
4. 完成长廊和终焉之地揭幕。
5. 桌面与手机分别校正安全区。

### Phase 4：固定语音、BGM、SFX

1. 冻结台词表。
2. 一次性生成并保存静态语音。
3. 写入音色和文件校验清单。
4. 接入三条BGM与全部SFX。
5. 验证手机用户手势启动、静音、恢复、语音压低BGM。

### Phase 5：完整验收

1. 原文一致性。
2. 全分支规则测试。
3. 无答案泄露测试。
4. 390×844、412×915、768×1024、1440×900、1920×1080验证。
5. Chrome手机与桌面真实播放、滚动、触摸和动画验证。
6. 性能、低动画模式、断点续玩验证。

### Phase 6：发布

1. 用户确认本地完整章节。
2. 生成不可变版本并记录资产哈希。
3. 使用项目现有 Sites 绑定保存生产版本。
4. 推送 GitHub `firefoxy1015/zhongyan`，触发现有 Render 发布。
5. 分别验证新 Sites 版本与 `https://zhongyan.onrender.com`。
6. 只有线上实际出现第二章独特文本、场景和音频资产，才报告上线完成。

---

## 13. 自动验收清单

### 13.1 原文

- [ ] 第二章起点和结尾在审计文件中有行号。
- [ ] 面具七条文字无改写。
- [ ] 九人省份与原文一致。
- [ ] 四场考验名称一致。
- [ ] 甜甜、韩一墨伤情一致。
- [ ] 人蛇三问规则一致。
- [ ] 齐夏元问题只在解开后出现。
- [ ] 四颗“道”、十天、三千六百一致。
- [ ] “招灾”只展示不解释。

### 13.2 游戏

- [ ] 每个谜题有观察、推演、提交、反馈。
- [ ] 每种错误指出具体缺口。
- [ ] 错误仍有代价。
- [ ] 每场至少一条明确死亡路径。
- [ ] 死亡可从当前检查点重试。
- [ ] 不必重玩第一章。
- [ ] 成功路径严格按照原文。

### 13.3 视觉

- [ ] 无人物裁头。
- [ ] 文字不遮脸、不遮机关。
- [ ] 手机可滚动、按钮可触达。
- [ ] 大标题不占据主要游戏画面。
- [ ] 所有新资产有来源记录。
- [ ] 九人脸、服装、年龄不漂移。
- [ ] 伤情使用覆盖层而非重生成人物。
- [ ] 十三项关键动画全部可见。

### 13.4 音频

- [ ] 所有角色音色固定。
- [ ] 齐夏始终为男声。
- [ ] 乔家劲始终为固定港普。
- [ ] 语音与字幕 `lineId` 一一对应。
- [ ] 运行时零 TTS生成请求。
- [ ] 静态音频有哈希、时长和来源。
- [ ] 手机点击后BGM确实可听。
- [ ] 语音播放时BGM自动降低。

### 13.5 工程与线上

- [ ] `npm.cmd test`
- [ ] `npm.cmd run lint`
- [ ] `git diff --check`
- [ ] 无第一章回归。
- [ ] 无第二章答案泄露。
- [ ] Sites生产版本验证。
- [ ] Render新版本独特特征验证。

---

## 14. 第二章完成定义

只有同时满足以下条件，第二章才算完成：

1. 原著第11—20章及第21章揭幕段全部通过逐条审计。
2. 玩家亲手完成三个后续考验，而不是点击播放剧情。
3. 错误有精确反馈，死亡仍然真实存在。
4. 九人形象与声音保持第一章固定版本。
5. 新角色人蛇、人龙完成一次设定后永久锁定。
6. 房间机关、鱼叉雨、地板崩塌、长廊和终焉之地都有实质动画。
7. BGM、SFX和静态角色语音在手机与桌面都能播放。
8. 手机无裁头、无覆盖、可滚动、可触摸。
9. 自动测试、真实浏览器验证和线上新版本验证全部通过。
10. 未提前解释林檎、回响、招灾、道和轮回伏笔。

---

## 15. 用户确认门

开发前只需要用户确认这一版范围：

> 第二章从人羊死亡后开始，完整游玩“雨后春笋”“天降死亡”“是与非”，以九人第一次看见终焉之地广场和“招灾”回响收尾；便利店留到第三章。

用户确认后，严格按 Phase 1 开始，不越过资产与原文审计直接堆页面。

---

# CODE 级实施规格

以下内容规定“具体怎么写代码”。它仍然是 PLAN，不是本轮实现。

## 16. 现有代码基线与改造边界

### 16.1 已确认的现状

- `app/page.tsx` 是第一章单机模式入口，共 757 行，使用多个 `useState` 管理抽牌、调查、草稿、投票和结算。
- 第一章推理数据在：
  - `app/lib/liar-game.ts`
  - `app/lib/deduction-game.ts`
- 第一章固定语音在：
  - `app/lib/testimony-speech.ts`
  - `app/lib/voice-assets.ts`
- 第一章紧迫声场在 `app/lib/suspense-bgm.ts`，目前由 Web Audio 振荡器实时构成。
- `app/globals.css` 已有 6838 行，并包含多次移动端覆盖；第二章不能继续把全部样式追加到这个文件。
- 现有测试使用 Node `node:test`，先构建再读取 Worker 或直接导入纯 TypeScript 模块。
- 项目使用 React 19、Next 16、Vinext、TypeScript strict，当前不需要为第二章引入状态管理库。

### 16.2 必须遵守的改造边界

1. 第一章仍保留在 `/`，不在第二章开发时强行搬路由。
2. 第二章新增 `/chapter/2`。
3. 第一章只做最小连接改动：
   - 成功后写入第一章完成标记。
   - 增加“继续检查房间”按钮。
   - 保留“重新复盘”。
4. 第二章不用十几个 `useState` 复制第一章写法，改用纯 `useReducer` 状态机。
5. 第二章样式全部进入 CSS Module。
6. 规则判断全部放在纯函数，React组件不直接判断答案。
7. 音频播放、动画播放和存档属于副作用层，不写进纯 reducer。
8. 不改联机 `/room`，不把第二章联机化。

---

## 17. 最终文件树

### 17.1 新增文件

```text
app/
  chapter/
    2/
      page.tsx
      ChapterTwoGame.tsx
      chapter-two.module.css
      components/
        ChapterHud.tsx
        SceneStage.tsx
        ActionTray.tsx
        RuleDrawer.tsx
        RecordDrawer.tsx
        ErrorPanel.tsx
        DeathOverlay.tsx
        ChapterComplete.tsx
        AftermathScene.tsx
        HometownMapPuzzle.tsx
        ShieldPuzzle.tsx
        RescuePuzzle.tsx
        SkyDeathPuzzle.tsx
        YesNoPuzzle.tsx
        ZodiacCorridor.tsx
        TerminationReveal.tsx
        CharacterLayer.tsx
        StageImage.tsx
  lib/
    chapter-two/
      types.ts
      canon.ts
      engine.ts
      selectors.ts
      save.ts
      assets.ts
      audio.ts
      voice-lines.ts
      voice-assets.ts
      animation.ts
content/
  chapter-02-canon-audit.json
  chapter-02-asset-manifest.json
public/
  art/
    chapter-02/
  audio/
    chapter-01/
    chapter-02/
      bgm/
      sfx/
      voice/
scripts/
  cache-locked-voice-assets.mjs
  render-chapter-two-voices.mjs
tests/
  chapter-two-canon.test.mjs
  chapter-two-engine.test.mjs
  chapter-two-save.test.mjs
  chapter-two-assets.test.mjs
```

### 17.2 修改文件

| 文件 | 只允许的修改 |
|---|---|
| `app/page.tsx` | 第一章成功时调用 `markChapterOneComplete()`；结算页增加进入第二章的链接 |
| `app/lib/voice-assets.ts` | 第一章远端语音完成本地缓存后，将 URL 改为项目内静态路径 |
| `app/layout.tsx` | 不改全局标题；第二章自己的 metadata 放在第二章路由 |
| `tests/rendered-html.test.mjs` | 增加 `/chapter/2` 路由渲染断言 |
| `package.json` | 将新增的四个 Node 测试文件加入 `npm test`；不添加不必要依赖 |
| `content/official-visual-reference.json` | 添加官方物料镜头、时间码和用途，不覆盖现有记录 |

---

## 18. 第二章类型设计

文件：`app/lib/chapter-two/types.ts`

### 18.1 场景、检查点和结算

```ts
export type ChapterTwoSceneId =
  | "aftermath"
  | "hometown-map"
  | "shield-assembly"
  | "harpoon-rescue"
  | "sky-death"
  | "yes-no"
  | "zodiac-corridor"
  | "termination-reveal"
  | "complete"
  | "death";

export type ChapterTwoCheckpointId =
  | "c2-a"
  | "c2-b"
  | "c2-c"
  | "c2-d"
  | "c2-e"
  | "c2-f"
  | "c2-g"
  | "c2-h";

export type ChapterTwoFailureId =
  | "harpoon-volley"
  | "shield-breach"
  | "han-pinned-to-wall"
  | "wall-position-crush"
  | "floor-collapse"
  | "yes-no-exhausted";

export type ChapterTwoPuzzleId =
  | "aftermath"
  | "hometown-map"
  | "shield-assembly"
  | "harpoon-rescue"
  | "sky-death"
  | "yes-no";

export type ChapterTwoObservationId =
  | "heart-shot"
  | "preserved-mask"
  | "mask-writing"
  | "wall-holes"
  | "clock-quarter"
  | "rotating-table"
  | "nine-hometowns"
  | "split-table"
  | "harpoon-ropes"
  | "harpoon-tail-writing"
  | "ceiling-nine-holes"
  | "square-board-handles"
  | "sheep-dog-types"
  | "shaft-door"
  | "snake-rules"
  | "zodiac-masks"
  | "human-dragon"
  | "dao-token"
  | "termination-plaza";

export type ChapterTwoAnimationId =
  | "mask-writing-reveal"
  | "wall-holes-open"
  | "table-turn-right"
  | "table-split"
  | "shield-lock"
  | "harpoon-volley"
  | "rope-retract"
  | "rope-cut-release"
  | "ceiling-holes-open"
  | "floor-rise"
  | "floor-collapse"
  | "snake-lever"
  | "corridor-doors"
  | "city-reveal";

export type ChapterTwoStatus =
  | { kind: "playing" }
  | { kind: "animating"; animationId: ChapterTwoAnimationId }
  | { kind: "death"; failureId: ChapterTwoFailureId }
  | { kind: "complete" };
```

`status` 使用判别联合类型，不能同时存在“播放动画”和“允许提交”的矛盾状态。

### 18.2 可序列化状态

```ts
export interface ChapterTwoState {
  schemaVersion: 1;
  scene: ChapterTwoSceneId;
  checkpoint: ChapterTwoCheckpointId;
  status: ChapterTwoStatus;

  storyClockMinute: number;
  deadlineMinute: 75 | 90 | null;
  dangerTicks: number;
  questionCount: number;
  daoCount: number;
  narrativeBeat: number;

  observedIds: ChapterTwoObservationId[];
  recordedIds: ChapterTwoObservationId[];
  solvedPuzzleIds: ChapterTwoPuzzleId[];
  history: HistoryEntry[];
  errors: FieldError[];

  characterStates: Record<CharacterId, CharacterRuntimeState>;
  aftermath: AftermathPuzzleState;
  hometown: HometownPuzzleState;
  shield: ShieldPuzzleState;
  rescue: RescuePuzzleState;
  skyDeath: SkyDeathPuzzleState;
  yesNo: YesNoPuzzleState;
}
```

数组代替 `Set`，保证状态可以直接 JSON 序列化。去重通过 `appendUnique()` 纯函数完成。

### 18.3 角色运行状态

```ts
export type CharacterId =
  | "qixia"
  | "qiao"
  | "tiantian"
  | "xiao"
  | "zhao"
  | "han"
  | "zhang"
  | "li"
  | "lin";

export interface CharacterRuntimeState {
  alive: boolean;
  pose:
    | "standing"
    | "turning-table"
    | "holding-shield"
    | "hanging"
    | "supporting"
    | "injured";
  injuries: InjuryId[];
  stamina: 0 | 1 | 2 | 3;
}

export type InjuryId =
  | "tiantian-right-palm"
  | "han-shoulder-harpoon"
  | "han-blood-loss";
```

伤情只通过明确 action 添加，不能随机生成。

### 18.4 各谜题子状态

```ts
export interface AftermathPuzzleState {
  selectedReason: AftermathAnswer | null;
}

export interface RescuePuzzleState {
  step: number;
  completedActionIds: RescueActionId[];
}

export interface YesNoPuzzleState {
  tokenIds: QuestionTokenId[];
  branches: QuestionBranch[];
  solvedText: string | null;
}

export interface HistoryEntry {
  id: string;
  scene: ChapterTwoSceneId;
  text: string;
  kind: "observation" | "deduction" | "warning" | "result";
}
```

### 18.5 错误结构

```ts
export interface FieldError {
  scope: ChapterTwoPuzzleId;
  fieldId: string;
  code: string;
  message: string;
  clockCost?: number;
  dangerCost?: number;
}
```

React只渲染 `FieldError`，不自行拼写模糊的“答案不对”。

---

## 19. Canon 数据怎么写

### 19.1 审计 JSON

文件：`content/chapter-02-canon-audit.json`

结构：

```json
{
  "source": {
    "fileSha256": "沿用现有canon manifest的全文哈希",
    "startLine": 1237,
    "endLine": 2927
  },
  "beats": [
    {
      "id": "mask-inside-text",
      "chapter": 11,
      "lineStart": 1281,
      "lineEnd": 1309,
      "characters": ["qixia", "qiao", "zhao", "li"],
      "facts": ["人羊射中心脏以保护面具", "面具内写着我是人狗"],
      "spoilerLevel": "observation"
    }
  ]
}
```

测试只核对短事实、行号和哈希，不把原文全文打包进 Web。

### 19.2 运行时 canon

文件：`app/lib/chapter-two/canon.ts`

```ts
export interface CanonObservation {
  id: ChapterTwoObservationId;
  scene: ChapterTwoSceneId;
  label: string;
  observation: string;
  note: string;
  sourceRef: {
    chapter: number;
    lineStart: number;
    lineEnd: number;
  };
  actionCost: number;
}

export const CHAPTER_TWO_OBSERVATIONS =
  [/* 仅短观察文本 */] as const satisfies readonly CanonObservation[];
```

强制分开：

```ts
export const HOMETOWN_RAW_FACTS = [/* 九人的原话 */] as const;
export const HOMETOWN_SOLUTION = { direction: "right", /* ... */ } as const;
```

UI组件只能导入 `HOMETOWN_RAW_FACTS`；答案校验函数才允许导入 `HOMETOWN_SOLUTION`。

### 19.3 九个地点

```ts
export const HOMETOWN_FACTS = [
  { characterId: "li", placeId: "inner-mongolia", wording: "我是内蒙人。" },
  { characterId: "zhang", placeId: "sichuan", wording: "我是四川人。" },
  { characterId: "tiantian", placeId: "shaanxi", wording: "我在陕西。" },
  { characterId: "xiao", placeId: "yunnan", wording: "云南大理。" },
  { characterId: "qiao", placeId: "guangdong", wording: "广东。" },
  { characterId: "lin", placeId: "ningxia", wording: "宁夏人。" },
  { characterId: "zhao", placeId: "jiangsu", wording: "我在江苏工作。" },
  { characterId: "qixia", placeId: "shandong", wording: "山东。" },
  { characterId: "han", placeId: "guangxi", wording: "我是广西人。" }
] as const;
```

赵海博的文案必须保留“工作”，不能静默改成家乡。

---

## 20. Reducer 与动作

文件：`app/lib/chapter-two/engine.ts`

### 20.1 Action 联合类型

```ts
export type ChapterTwoAction =
  | { type: "OBSERVE"; observationId: ChapterTwoObservationId }
  | { type: "RECORD"; observationId: ChapterTwoObservationId }
  | { type: "SUBMIT_AFTERMATH"; answer: AftermathAnswer }
  | { type: "PLACE_HOMETOWN"; characterId: CharacterId; placeId: PlaceId }
  | { type: "SET_MAP_STROKE"; strokeIndex: number; placeIds: PlaceId[] }
  | { type: "SUBMIT_HOMETOWN"; direction: "left" | "right" }
  | { type: "PLACE_WEDGE"; wedgeId: WedgeId; slotId: WedgeSlotId }
  | { type: "ROTATE_WEDGE"; wedgeId: WedgeId; orientation: WedgeOrientation }
  | { type: "SUBMIT_SHIELD" }
  | { type: "APPLY_RESCUE_ACTION"; actionId: RescueActionId }
  | { type: "SET_SKY_FIELD"; field: keyof SkyDeathAnswer; value: string }
  | { type: "SUBMIT_SKY_DEATH" }
  | { type: "ADD_QUESTION_TOKEN"; tokenId: QuestionTokenId }
  | { type: "REMOVE_QUESTION_TOKEN"; index: number }
  | { type: "CLEAR_QUESTION" }
  | { type: "SUBMIT_QUESTION" }
  | { type: "ADVANCE_NARRATIVE" }
  | { type: "ANIMATION_FINISHED"; animationId: ChapterTwoAnimationId }
  | { type: "RETRY_CHECKPOINT" }
  | { type: "RESTORE"; state: ChapterTwoState };
```

### 20.2 Reducer 外形

```ts
export function chapterTwoReducer(
  state: ChapterTwoState,
  action: ChapterTwoAction,
): ChapterTwoState {
  if (state.status.kind === "death" && action.type !== "RETRY_CHECKPOINT") {
    return state;
  }

  if (state.status.kind === "animating" && action.type !== "ANIMATION_FINISHED") {
    return state;
  }

  switch (action.type) {
    case "OBSERVE":
      return observe(state, action.observationId);
    case "SUBMIT_HOMETOWN":
      return submitHometown(state, action.direction);
    // 其余动作逐一转给纯函数
    default:
      return assertNever(action);
  }
}
```

不允许在 reducer 中：

- 调用 `localStorage`。
- 创建 `Audio`。
- `setTimeout`。
- 操作 DOM。
- 直接导航。

### 20.3 时间推进

```ts
function advanceStoryClock(
  state: ChapterTwoState,
  amount: number,
  failureId: ChapterTwoFailureId,
): ChapterTwoState {
  const nextMinute = state.storyClockMinute + amount;
  if (state.deadlineMinute !== null && nextMinute >= state.deadlineMinute) {
    return enterDeath(
      { ...state, storyClockMinute: state.deadlineMinute },
      failureId,
    );
  }
  return { ...state, storyClockMinute: nextMinute };
}
```

特殊正史节点使用明确跳时：

```ts
function beginShieldAssembly(state: ChapterTwoState): ChapterTwoState {
  return {
    ...state,
    scene: "shield-assembly",
    checkpoint: "c2-c",
    storyClockMinute: 72,
    deadlineMinute: 75,
    status: { kind: "animating", animationId: "table-split" },
  };
}
```

这样玩家完成地图后固定来到 1:12，拥有三次公平修正机会，不受设备速度影响。

### 20.4 场景推进

场景只能通过成功函数或对应动画结束推进：

```ts
const NEXT_SCENE_AFTER_ANIMATION: Partial<
  Record<ChapterTwoAnimationId, ChapterTwoSceneId>
> = {
  "mask-writing-reveal": "hometown-map",
  "table-split": "shield-assembly",
  "harpoon-volley": "harpoon-rescue",
  "floor-collapse": "yes-no",
  "snake-lever": "zodiac-corridor",
  "city-reveal": "complete",
};
```

`ANIMATION_FINISHED` 必须核对当前 `animationId`，旧动画迟到事件不能推进新场景。

长廊、人龙与城市揭幕使用 `ADVANCE_NARRATIVE`，而不是在组件内部直接 `setScene`：

```ts
function advanceNarrative(state: ChapterTwoState): ChapterTwoState {
  if (state.scene === "zodiac-corridor") {
    const nextBeat = state.narrativeBeat + 1;
    if (nextBeat === HUMAN_DRAGON_DAO_BEAT) {
      return {
        ...state,
        narrativeBeat: nextBeat,
        daoCount: 4,
      };
    }
    if (nextBeat >= CORRIDOR_BEATS.length) {
      return {
        ...state,
        scene: "termination-reveal",
        checkpoint: "c2-h",
        narrativeBeat: 0,
        status: { kind: "animating", animationId: "city-reveal" },
      };
    }
    return { ...state, narrativeBeat: nextBeat };
  }
  return state;
}
```

`daoCount` 只能在人龙结算四场考验的固定 beat 变成 4。

---

## 21. 各谜题的具体校验代码

### 21.1 人羊死后

```ts
export type AftermathAnswer =
  | "avoid-pain"
  | "head-too-hard"
  | "protect-mask";

function submitAftermath(
  state: ChapterTwoState,
  answer: AftermathAnswer,
): ChapterTwoState {
  if (answer !== "protect-mask") {
    return withErrors(
      advanceStoryClock(state, 1, "harpoon-volley"),
      [{
        scope: "aftermath",
        fieldId: "shot-reason",
        code: "DOES_NOT_EXPLAIN_HEART_SHOT",
        message: "这个解释没有说明：他为什么宁愿承受更久痛苦，也不让子弹接近头部。",
        clockCost: 1,
      }],
    );
  }

  return {
    ...clearErrors(state),
    solvedPuzzleIds: appendUnique(state.solvedPuzzleIds, "aftermath"),
    status: { kind: "animating", animationId: "mask-writing-reveal" },
  };
}
```

### 21.2 家乡地图

状态：

```ts
export interface HometownPuzzleState {
  placements: Partial<Record<CharacterId, PlaceId>>;
  strokes: [PlaceId[], PlaceId[], PlaceId[]];
  direction: "left" | "right" | null;
  scriptedLeftTurns: number;
  committedRightTurns: number;
}
```

答案校验分三步：

```ts
export function validateHometown(
  draft: HometownPuzzleState,
  direction: "left" | "right",
): FieldError[] {
  return [
    ...validateHometownPlacements(draft.placements),
    ...validateMapStrokes(draft.strokes),
    ...validateDirection(direction),
  ];
}
```

位置错误：

```ts
function validateHometownPlacements(
  placements: HometownPuzzleState["placements"],
): FieldError[] {
  return HOMETOWN_FACTS.flatMap((fact) =>
    placements[fact.characterId] === fact.placeId
      ? []
      : [{
          scope: "hometown-map",
          fieldId: `place:${fact.characterId}`,
          code: "WRONG_PLACE",
          message: `${characterName(fact.characterId)}的位置与刚才的原话不一致。`,
        }],
  );
}
```

笔划比较先排序再比较集合，不依赖玩家连线顺序：

```ts
function normalizeStroke(placeIds: readonly PlaceId[]) {
  return [...new Set(placeIds)].sort().join("|");
}
```

三个正确笔划组只存在引擎文件中：

- 宁夏 + 山东。
- 内蒙 + 四川 + 云南。
- 广西 + 广东 + 陕西 + 江苏。

成功后：

```ts
return {
  ...state,
  hometown: {
    ...state.hometown,
    direction: "right",
    committedRightTurns: 100,
  },
  solvedPuzzleIds: appendUnique(state.solvedPuzzleIds, "hometown-map"),
  status: { kind: "animating", animationId: "table-turn-right" },
};
```

`table-turn-right` 结束后进入 `table-split`，而不是瞬间显示答案页。

### 21.3 九块桌板

```ts
export type WedgeId =
  | "small-1" | "small-2" | "small-3"
  | "small-4" | "small-5" | "small-6"
  | "small-7" | "small-8" | "small-9"
  | "large-decoy";

export type WedgeOrientation =
  | "tip-in"
  | "tip-out"
  | "vertical";

export interface ShieldPuzzleState {
  placements: Partial<Record<WedgeId, WedgeSlotId>>;
  orientations: Partial<Record<WedgeId, WedgeOrientation>>;
  discardedIds: WedgeId[];
}
```

校验：

```ts
export function validateShield(draft: ShieldPuzzleState): FieldError[] {
  const errors: FieldError[] = [];
  const smallIds = WEDGE_IDS.filter((id) => id !== "large-decoy");

  if (!draft.discardedIds.includes("large-decoy")) {
    errors.push(error(
      "shield-assembly",
      "large-decoy",
      "LARGE_BOARD_BLOCKS_CLOSURE",
      "大桌板占用了第九块小板的位置，锥体无法闭合。",
    ));
  }

  if (smallIds.some((id) => draft.placements[id] === undefined)) {
    errors.push(error(
      "shield-assembly",
      "small-wedges",
      "MISSING_SMALL_WEDGE",
      "九块小桌板没有全部进入结构。",
    ));
  }

  if (smallIds.some((id) => draft.orientations[id] !== "tip-in")) {
    errors.push(error(
      "shield-assembly",
      "orientation",
      "WRONG_WEDGE_ANGLE",
      "仍有桌板与鱼叉近乎垂直，或者在头顶留下开口。",
    ));
  }

  return errors;
}
```

错误提交：

```ts
const errors = validateShield(state.shield);
if (errors.length > 0) {
  return withErrors(
    advanceStoryClock(state, 1, "shield-breach"),
    errors.map((item) => ({ ...item, clockCost: 1 })),
  );
}
```

如果 1:15 前结构正确：

```ts
return {
  ...clearErrors(state),
  storyClockMinute: 75,
  deadlineMinute: null,
  characterStates: applyCanonicalHarpoonInjuries(state.characterStates),
  status: { kind: "animating", animationId: "harpoon-volley" },
};
```

### 21.4 留叉救援

```ts
export type RescueActionId =
  | "pull-han-harpoon"
  | "hold-retracting-rope"
  | "knot-opposing-ropes"
  | "lin-release-knot"
  | "li-cut-rope"
  | "qiao-brace-han";

const CANONICAL_RESCUE_SEQUENCE: readonly RescueActionId[] = [
  "knot-opposing-ropes",
  "lin-release-knot",
  "li-cut-rope",
  "qiao-brace-han",
] as const;
```

每次只校验下一步：

```ts
function applyRescueAction(
  state: ChapterTwoState,
  actionId: RescueActionId,
): ChapterTwoState {
  const expected = CANONICAL_RESCUE_SEQUENCE[state.rescue.step];

  if (actionId !== expected) {
    const next = {
      ...state,
      dangerTicks: state.dangerTicks + 1,
      errors: [rescueErrorFor(actionId)],
    };
    return next.dangerTicks >= 4
      ? enterDeath(next, "han-pinned-to-wall")
      : next;
  }

  const nextStep = state.rescue.step + 1;
  if (nextStep < CANONICAL_RESCUE_SEQUENCE.length) {
    return {
      ...clearErrors(state),
      rescue: { ...state.rescue, step: nextStep },
    };
  }

  return {
    ...clearErrors(state),
    dangerTicks: 0,
    solvedPuzzleIds: appendUnique(state.solvedPuzzleIds, "harpoon-rescue"),
    status: { kind: "animating", animationId: "rope-cut-release" },
  };
}
```

错误文案由 `rescueErrorFor()` 逐项返回，禁止统一返回“顺序不对”。

### 21.5 天降死亡

```ts
export interface SkyDeathAnswer {
  gameType: "trust-human-sheep" | "sheep-can-lie" | null;
  position: "wall" | "under-holes" | null;
  boardUse: "shield" | "floor-cover" | "ceiling-anchor" | null;
  insertion: "flat" | "vertical-then-horizontal" | null;
}
```

校验：

```ts
export function validateSkyDeath(answer: SkyDeathAnswer): FieldError[] {
  const errors: FieldError[] = [];
  if (answer.gameType !== "sheep-can-lie") {
    errors.push(error(
      "sky-death",
      "gameType",
      "TRUSTED_SHEEP_TEXT",
      "这套方案仍然把人羊写下的话当成了可靠说明。",
    ));
  }
  if (answer.position !== "under-holes") {
    errors.push(error(
      "sky-death",
      "position",
      "POSITION_DOES_NOT_USE_NINE_HOLES",
      "这个站位没有解释：为什么孔洞和参与者都恰好是九个。",
    ));
  }
  if (answer.boardUse !== "ceiling-anchor") {
    errors.push(error(
      "sky-death",
      "boardUse",
      "HANDLE_UNUSED",
      "这个用途没有利用方板背面的牢固把手。",
    ));
  }
  if (answer.insertion !== "vertical-then-horizontal") {
    errors.push(error(
      "sky-death",
      "insertion",
      "BOARD_CANNOT_LOCK",
      "方板无法以当前角度穿过窄孔并在孔后卡住。",
    ));
  }
  return errors;
}
```

每次错误提交推进 2 分钟并标出所有错误字段。到 1:30 触发对应死亡。

成功：

```ts
return {
  ...clearErrors(state),
  storyClockMinute: 90,
  deadlineMinute: null,
  characterStates: setHangingPoses(state.characterStates),
  status: { kind: "animating", animationId: "floor-collapse" },
};
```

### 21.6 “是与非”问题解析

不能只比较完整字符串。必须先把玩家选择的词块解析成结构：

```ts
export type QuestionAst =
  | { kind: "direct"; proposition: "pull-lever" }
  | { kind: "negated"; proposition: "pull-lever" }
  | {
      kind: "same-answer-meta";
      nextQuestion: { kind: "direct"; proposition: "pull-lever" };
    };
```

词块：

```ts
export type QuestionTokenId =
  | "if"
  | "my-next-question"
  | "will-you-pull"
  | "your-answer"
  | "same-as-this"
  | "will-you-not-pull"
  | "can-you-save-us"
  | "is-yes";
```

解析：

```ts
export function parseQuestion(
  tokenIds: readonly QuestionTokenId[],
): QuestionAst | QuestionParseError {
  if (matches(tokenIds, META_QUESTION_PATTERN)) {
    return {
      kind: "same-answer-meta",
      nextQuestion: { kind: "direct", proposition: "pull-lever" },
    };
  }
  if (matches(tokenIds, DIRECT_PULL_PATTERN)) {
    return { kind: "direct", proposition: "pull-lever" };
  }
  // 其余模式或语法错误
  return { kind: "parse-error", fieldId: firstInvalidToken(tokenIds) };
}
```

逻辑验证返回分支，不直接返回答案句：

```ts
export interface QuestionBranch {
  currentAnswer: "yes" | "no";
  nextAnswer: "yes" | "no" | "unconstrained";
  pullForced: boolean;
}

export function analyzeQuestion(ast: QuestionAst): QuestionBranch[] {
  if (ast.kind === "same-answer-meta") {
    return [
      { currentAnswer: "yes", nextAnswer: "yes", pullForced: true },
      { currentAnswer: "no", nextAnswer: "yes", pullForced: true },
    ];
  }
  return [
    { currentAnswer: "yes", nextAnswer: "unconstrained", pullForced: false },
    { currentAnswer: "no", nextAnswer: "unconstrained", pullForced: false },
  ];
}
```

提交：

```ts
function submitQuestion(state: ChapterTwoState): ChapterTwoState {
  const parsed = parseQuestion(state.yesNo.tokenIds);
  if (parsed.kind === "parse-error") {
    return withErrors(state, [questionParseError(parsed)]);
  }

  const branches = analyzeQuestion(parsed);
  const forcesPull = branches.every((branch) => branch.pullForced);
  const nextCount = state.questionCount + 1;

  if (!forcesPull) {
    const next = {
      ...state,
      questionCount: nextCount,
      yesNo: { ...state.yesNo, branches },
      errors: [unforcedBranchError(branches)],
    };
    return nextCount >= 3
      ? enterDeath(next, "yes-no-exhausted")
      : next;
  }

  return {
    ...clearErrors(state),
    questionCount: nextCount,
    solvedPuzzleIds: appendUnique(state.solvedPuzzleIds, "yes-no"),
    yesNo: { ...state.yesNo, branches, solvedText: CANONICAL_META_QUESTION },
    status: { kind: "animating", animationId: "snake-lever" },
  };
}
```

肖冉的第一问在 `initialChapterTwoState()` 进入“是与非”时就将 `questionCount` 设置为 1，并用过场展示，不允许玩家删除或重写。

---

## 22. 检查点与死亡代码

### 22.1 检查点快照

不保存八份巨大状态。保存当前场景的可重建 checkpoint ID：

```ts
const CHECKPOINT_FACTORIES: Record<
  ChapterTwoCheckpointId,
  () => ChapterTwoState
> = {
  "c2-a": createAftermathCheckpoint,
  "c2-b": createHometownCheckpoint,
  "c2-c": createShieldCheckpoint,
  "c2-d": createRescueCheckpoint,
  "c2-e": createSkyDeathCheckpoint,
  "c2-f": createYesNoCheckpoint,
  "c2-g": createCorridorCheckpoint,
  "c2-h": createRevealCheckpoint,
};
```

每个 factory 明确重建该节点应有的伤情、座钟、已解谜题和剧情记录。

### 22.2 死亡信息

```ts
export const FAILURE_PRESENTATION: Record<
  ChapterTwoFailureId,
  {
    title: string;
    description: string;
    visualVariant: string;
    checkpoint: ChapterTwoCheckpointId;
  }
> = {
  "shield-breach": {
    title: "锥体出现缺口",
    description: "鱼叉从未闭合的方向贯穿了防线。",
    visualVariant: "harpoon-gap",
    checkpoint: "c2-c",
  },
  // 每种失败单独定义
};
```

`DeathOverlay` 只根据 `failureId` 读取，不临时编造死法。

### 22.3 重试

```ts
function retryCheckpoint(state: ChapterTwoState): ChapterTwoState {
  const factory = CHECKPOINT_FACTORIES[state.checkpoint];
  return factory();
}
```

“查看刚才错误”由死亡前缓存的 `lastFailureErrors` 提供；重试后错误面板可以展开一次，但不保留错误选择到草稿中。

---

## 23. 存档代码

文件：`app/lib/chapter-two/save.ts`

### 23.1 Key 与 envelope

```ts
export const SOLO_SAVE_KEY = "zhongyan:solo-save:v2";

export interface SoloSaveEnvelope {
  version: 2;
  updatedAt: string;
  completedChapters: number[];
  activeChapter: 1 | 2;
  chapterTwo?: ChapterTwoState;
  lockedAssetVersions: {
    portraits: string;
    voices: string;
  };
}
```

### 23.2 安全读取

```ts
export function loadSoloSave(storage: Storage): SoloSaveEnvelope | null {
  const raw = storage.getItem(SOLO_SAVE_KEY);
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    return parseSoloSave(parsed);
  } catch {
    return null;
  }
}
```

`parseSoloSave()` 逐字段验证，不把未知 JSON 直接断言为类型。

### 23.3 第一章完成

```ts
export function markChapterOneComplete(storage: Storage) {
  const current = loadSoloSave(storage) ?? createEmptySoloSave();
  saveSoloState(storage, {
    ...current,
    completedChapters: appendUnique(current.completedChapters, 1),
    activeChapter: 2,
  });
}
```

只在 `resolveCanonicalVote(...).isCorrect === true` 时调用。

### 23.4 第二章自动保存

`ChapterTwoGame.tsx`：

```ts
useEffect(() => {
  if (!hydrated) return;
  saveChapterTwo(window.localStorage, state);
}, [hydrated, state]);
```

首次渲染先使用纯 `initialChapterTwoState()`，挂载后再恢复本地存档，避免服务端和客户端 HTML 不一致。

### 23.5 旧存档

- 没有 `v2` 存档，但用户从第一章成功按钮进入：允许创建新存档。
- 直接访问 `/chapter/2` 且无第一章完成标记：显示“从第一章开始”和“读取存档”，不自动伪造通关。
- 开发测试通过显式测试 fixture 注入状态，不增加公开作弊 query。

---

## 24. 页面与组件怎么写

### 24.1 路由文件

`app/chapter/2/page.tsx` 保持为服务端组件：

```tsx
import type { Metadata } from "next";
import { ChapterTwoGame } from "./ChapterTwoGame";

export const metadata: Metadata = {
  title: "第二章·四面杀机｜十日终焉：单机剧情 RPG",
  description: "承接说谎者结算，完成面试房后续三场考验。",
};

export default function ChapterTwoPage() {
  return <ChapterTwoGame />;
}
```

### 24.2 客户端根组件

`ChapterTwoGame.tsx`：

```tsx
"use client";

export function ChapterTwoGame() {
  const [state, dispatch] = useReducer(
    chapterTwoReducer,
    undefined,
    () => initialChapterTwoState(),
  );
  const [drawer, setDrawer] = useState<DrawerId>(null);
  const [hydrated, setHydrated] = useState(false);
  const audioRef = useRef<ChapterTwoAudioDirector | null>(null);

  useChapterTwoHydration(dispatch, setHydrated);
  useChapterTwoSave(state, hydrated);
  useChapterTwoAudio(state, audioRef);

  const view = selectChapterTwoView(state);

  return (
    <main className={styles.game} data-scene={state.scene}>
      <ChapterHud view={view.hud} onOpenDrawer={setDrawer} />
      <SceneStage state={state} dispatch={dispatch} />
      <ActionTray state={state} dispatch={dispatch} />
      <ChapterOverlay state={state} dispatch={dispatch} />
      <ChapterDrawer id={drawer} state={state} onClose={() => setDrawer(null)} />
    </main>
  );
}
```

根组件不写谜题答案、不写死亡判断。

### 24.3 SceneStage

```tsx
export function SceneStage({ state, dispatch }: SceneProps) {
  switch (state.scene) {
    case "aftermath":
      return <AftermathScene state={state} dispatch={dispatch} />;
    case "hometown-map":
      return <HometownMapPuzzle state={state} dispatch={dispatch} />;
    case "shield-assembly":
      return <ShieldPuzzle state={state} dispatch={dispatch} />;
    case "harpoon-rescue":
      return <RescuePuzzle state={state} dispatch={dispatch} />;
    case "sky-death":
      return <SkyDeathPuzzle state={state} dispatch={dispatch} />;
    case "yes-no":
      return <YesNoPuzzle state={state} dispatch={dispatch} />;
    case "zodiac-corridor":
      return <ZodiacCorridor state={state} dispatch={dispatch} />;
    case "termination-reveal":
      return <TerminationReveal state={state} dispatch={dispatch} />;
    default:
      return null;
  }
}
```

### 24.4 组件 props

```ts
export interface SceneProps {
  state: ChapterTwoState;
  dispatch: Dispatch<ChapterTwoAction>;
}

export interface PuzzleSubmitProps {
  disabled: boolean;
  costLabel: string;
  errorIds: string[];
  onSubmit: () => void;
}
```

子组件不持有决定游戏结果的本地状态。拖拽中的像素位置可以暂存在组件内，落下后必须 dispatch 成标准化数据。

---

## 25. 地图与桌板交互代码

### 25.1 不使用 HTML5 drag

HTML5 `dragstart` 在手机端不稳定。使用 Pointer Events：

```tsx
function DraggableToken({ id, position, onCommit }: DraggableTokenProps) {
  const [draft, setDraft] = useState(position);

  const onPointerDown = (event: React.PointerEvent) => {
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return;
    setDraft(toNormalizedBoardPoint(event));
  };

  const onPointerUp = (event: React.PointerEvent) => {
    event.currentTarget.releasePointerCapture(event.pointerId);
    onCommit(findNearestPlace(draft));
  };

  return /* button with transform */;
}
```

### 25.2 标准化坐标

```ts
export interface BoardPoint {
  x: number; // 0..1000
  y: number; // 0..1000
}
```

不把屏幕像素保存进游戏状态。桌面和手机都将归一化坐标映射到容器尺寸。

### 25.3 地图底图

- 使用经过来源审计的静态 WebP/PNG地图底图。
- 不在代码中手写复杂中国地图 SVG。
- 九个可交互节点用绝对定位按钮覆盖。
- 连线使用旋转后的 CSS `div` 线段：

```tsx
<span
  className={styles.mapLine}
  style={{
    left: `${start.x / 10}%`,
    top: `${start.y / 10}%`,
    width: `${distance(start, end) / 10}%`,
    transform: `rotate(${angle(start, end)}deg)`,
  }}
/>
```

### 25.4 键盘和点击替代

- 每个角色标记旁有 `<select aria-label="为齐夏选择地点">`。
- “连接一笔”模式允许依次点击地点，不要求拖线。
- 桌板有“放入第N槽”“旋转”“丢弃”按钮。
- 拖拽和按钮最终 dispatch 同一 action。

---

## 26. 动画代码

文件：`app/lib/chapter-two/animation.ts`

### 26.1 动画 ID

`ChapterTwoAnimationId` 在 `types.ts` 定义，`animation.ts` 只导入该类型，避免 `types.ts` 与 `animation.ts` 互相依赖。

```ts
import type { ChapterTwoAnimationId } from "./types";
```

### 26.2 动画配置

```ts
export const ANIMATION_SPECS: Record<
  ChapterTwoAnimationId,
  {
    durationMs: number;
    skippableAfterMs: number;
    sfxIds: readonly ChapterTwoSfxId[];
  }
> = {
  "table-split": {
    durationMs: 4200,
    skippableAfterMs: 900,
    sfxIds: ["clock-beam", "wood-split"],
  },
  // ...
};
```

### 26.3 动画完成 hook

```ts
export function useSceneAnimationCompletion(
  status: ChapterTwoStatus,
  dispatch: Dispatch<ChapterTwoAction>,
) {
  useEffect(() => {
    if (status.kind !== "animating") return;
    const spec = ANIMATION_SPECS[status.animationId];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timeout = window.setTimeout(
      () => dispatch({
        type: "ANIMATION_FINISHED",
        animationId: status.animationId,
      }),
      reduced ? 50 : spec.durationMs + 150,
    );
    return () => window.clearTimeout(timeout);
  }, [status, dispatch]);
}
```

CSS `animationend` 可以提前完成，但 reducer核对 `animationId` 后才接受。Timeout是保险，避免手机丢失事件后卡死。

### 26.4 CSS Module

`chapter-two.module.css` 不使用全局名字：

```css
.game {
  min-height: 100svh;
  height: 100svh;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  overflow: hidden;
  background: #090806;
}

.stage {
  position: relative;
  min-height: 0;
  overflow: hidden;
  isolation: isolate;
}

.portrait {
  width: 100%;
  height: 100%;
  object-fit: contain;
  object-position: center bottom;
}

.drawerBody {
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  -webkit-overflow-scrolling: touch;
}
```

移动端：

```css
@media (max-width: 720px) {
  .game {
    grid-template-rows: auto minmax(42svh, 1fr) auto;
  }

  .hudSecondary {
    display: none;
  }

  .actionTray {
    max-height: 38svh;
    overflow-y: auto;
    padding-bottom: calc(12px + env(safe-area-inset-bottom));
  }
}
```

禁止：

- `.witness-portrait img { object-fit: cover; }`
- 无作用域的 `.game-drawer`
- 手机端 `overflow: hidden` 放在需要滚动的记录容器
- 通过负 `top` 把人物头部推到屏幕外

---

## 27. 视觉层代码

### 27.1 资产类型

文件：`app/lib/chapter-two/assets.ts`

```ts
export type ChapterTwoAssetId =
  | "interview-room-damaged"
  | "renyang-mask-inner"
  | "harpoon-wall-rig"
  | "hometown-map-board"
  | "table-wedges"
  | "bamboo-cone"
  | "square-handle-board"
  | "collapse-shaft"
  | "renshe"
  | "renlong"
  | "zodiac-corridor"
  | "dao-token"
  | "termination-plaza"
  | "termination-city";

export interface ChapterTwoAsset {
  id: ChapterTwoAssetId;
  src: string;
  width: number;
  height: number;
  sha256: string;
  provenanceId: string;
  safeArea: { top: number; right: number; bottom: number; left: number };
}
```

### 27.2 StageImage

```tsx
export function StageImage({
  asset,
  alt,
  decorative = false,
}: StageImageProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      alt={decorative ? "" : alt}
      aria-hidden={decorative || undefined}
      className={styles.stageImage}
      decoding="async"
      draggable={false}
      src={asset.src}
    />
  );
}
```

不把关键线索仅放在 `background-image` 中；关键道具使用真实按钮或图片元素。

### 27.3 人物伤情覆盖层

```tsx
<figure className={styles.character}>
  <StageImage asset={portraitAsset} alt={`${name}固定立绘`} />
  {injuries.includes("tiantian-right-palm") && (
    <StageImage asset={tiantianHandWoundOverlay} alt="" decorative />
  )}
</figure>
```

脸、服装和基础立绘不重新生成。

---

## 28. 音频代码

### 28.1 不继续用单一振荡器承担全部BGM

第一章 `SuspenseBgm` 可保留；第二章新增固定音轨播放器。

文件：`app/lib/chapter-two/audio.ts`

```ts
export class ChapterTwoAudioDirector {
  private bgm: HTMLAudioElement | null = null;
  private voice: HTMLAudioElement | null = null;
  private sfx = new Set<HTMLAudioElement>();
  private masterVolume = 0.8;
  private muted = false;
  private activeTrackId: ChapterTwoBgmId | null = null;

  async startBgm(trackId: ChapterTwoBgmId): Promise<boolean> {
    // 用户手势调用；同一track不重建
  }

  async playVoice(lineId: ChapterTwoVoiceLineId): Promise<boolean> {
    // 停止上一句 -> BGM duck -> 播放静态文件 -> 恢复BGM
  }

  playSfx(sfxId: ChapterTwoSfxId): void {
    // 从静态清单创建短音效；ended后移出Set
  }

  setMuted(muted: boolean): void {}
  setVolume(volume: number): void {}
  setDucked(ducked: boolean): void {}
  stopAll(): void {}
}
```

### 28.2 切换BGM

```ts
const SCENE_BGM: Partial<Record<ChapterTwoSceneId, ChapterTwoBgmId>> = {
  aftermath: "room-tension",
  "hometown-map": "room-tension",
  "shield-assembly": "harpoon-crisis",
  "harpoon-rescue": "harpoon-crisis",
  "sky-death": "harpoon-crisis",
  "yes-no": "harpoon-crisis",
  "zodiac-corridor": "termination-reveal",
  "termination-reveal": "termination-reveal",
};
```

`useChapterTwoAudio()` 监听 `state.scene` 和 `state.status`：

- 场景变化时切换或交叉淡化。
- `status.animationId` 变化时按 `ANIMATION_SPECS` 播放SFX。
- 语音按钮仍需玩家点击。
- 页面卸载调用 `stopAll()`。

### 28.3 固定语音清单

文件：`app/lib/chapter-two/voice-lines.ts`

```ts
export const CHAPTER_TWO_VOICE_LINES = [
  {
    id: "c02-qixia-001",
    speakerId: "qixia",
    text: "短台词",
    sourceRef: { chapter: 11, lineStart: 1255, lineEnd: 1255 },
  },
  // ...
] as const;

export type ChapterTwoVoiceLineId =
  typeof CHAPTER_TWO_VOICE_LINES[number]["id"];
```

文件：`app/lib/chapter-two/voice-assets.ts`

```ts
export const CHAPTER_TWO_VOICE_ASSETS = {
  "c02-qixia-001": {
    src: "/audio/chapter-02/voice/c02-qixia-001.<hash>.mp3",
    sha256: "...",
    durationMs: 2600,
    speakerId: "qixia",
    voiceVersion: "qixia-locked-v2",
  },
} as const satisfies Record<ChapterTwoVoiceLineId, VoiceAsset>;
```

清单不得存放 TTS API endpoint。

### 28.4 一次性生成脚本

`scripts/render-chapter-two-voices.mjs`：

1. 读取 `CHAPTER_TWO_VOICE_LINES`。
2. 读取现有 manifest。
3. 对每句计算 `sha256(speakerId + voiceVersion + text)`。
4. 如果 line ID 已存在且输入哈希一致：跳过。
5. 如果 line ID 已存在但文本或音色变化：直接报错，要求显式创建新 line ID。
6. 只对缺失 line ID 调用语音 API。
7. 下载结果到 `public/audio/chapter-02/voice/`。
8. 计算最终 MP3 SHA-256与时长。
9. 写入静态 manifest。
10. 不保存、不打印API credential。

这样“每次点击重新生产”在代码结构上无法发生。

### 28.5 第一章远端语音本地化

`scripts/cache-locked-voice-assets.mjs`：

- 只下载 `VOICE_ASSET_URLS` 已存在的18个固定MP3。
- 不调用合成API。
- 文件名加入内容哈希。
- 更新 `voice-assets.ts` 为 `/audio/chapter-01/...`。
- 下载失败则停止发布，不切换到其他音色。

---

## 29. 第一章连接第二章的具体修改

### 29.1 `app/page.tsx`

新增：

```tsx
import Link from "next/link";
import { markChapterOneComplete } from "./lib/chapter-two/save";
```

在投票成功后：

```ts
const submitVote = () => {
  const resolution = resolveCanonicalVote(selectedTarget);
  if (resolution.isCorrect && typeof window !== "undefined") {
    markChapterOneComplete(window.localStorage);
  }
  setEndingReason(resolution.isCorrect ? "success" : "wrong-vote");
  setScreen("ending");
};
```

成功结算按钮：

```tsx
{success ? (
  <div className="ending-actions">
    <Link className="blood-button" href="/chapter/2">
      继续检查房间
    </Link>
    <button className="ghost-button" onClick={restart}>
      重新复盘
    </button>
  </div>
) : (
  <button className="blood-button" onClick={restart}>
    回到抽牌前
  </button>
)}
```

如果 `Link` 的全局样式不完整，只在现有 `.blood-button` 规则中补充 `text-decoration` 和布局；不新增第二章全局CSS。

### 29.2 直接访问第二章

`ChapterTwoGame` 挂载后：

```ts
const save = loadSoloSave(window.localStorage);
if (!save?.completedChapters.includes(1)) {
  setEntryGate("locked");
} else if (save.chapterTwo) {
  dispatch({ type: "RESTORE", state: save.chapterTwo });
}
setHydrated(true);
```

锁定页不出现第二章答案，只提供回第一章入口。

---

## 30. Selector 设计

文件：`app/lib/chapter-two/selectors.ts`

React不重复推导状态：

```ts
export interface ChapterTwoView {
  hud: {
    trialLabel: string;
    objective: string;
    clockLabel: string | null;
    questionLabel: string | null;
    daoCount: number;
    injuries: readonly InjurySummary[];
  };
  canSubmit: boolean;
  submitCostLabel: string;
  activeErrors: readonly FieldError[];
  availableActions: readonly ActionDescriptor[];
}

export function selectChapterTwoView(
  state: ChapterTwoState,
): ChapterTwoView {
  switch (state.scene) {
    case "hometown-map":
      return selectHometownView(state);
    // ...
  }
}
```

`objective` 和 `submitCostLabel` 由 selector提供，按钮旁必须显示：

- “错误 +1分钟”
- “错误 +2分钟”
- “剩余2问”
- “错误使回收危机 +1格”

---

## 31. 自动测试怎么写

### 31.1 Canon 测试

文件：`tests/chapter-two-canon.test.mjs`

必须包含：

```js
test("locks chapter two to the post-liar interview sequence", () => {
  assert.equal(CHAPTER_TWO_SCOPE.startLine, 1237);
  assert.equal(CHAPTER_TWO_SCOPE.endLine, 2927);
  assert.deepEqual(
    CHAPTER_TWO_TRIALS.map((trial) => trial.title),
    ["雨后春笋", "天降死亡", "是与非"],
  );
});
```

```js
test("keeps every canonical injury on the correct character", () => {
  const injuries = applyCanonicalHarpoonInjuries(initialCharacters());
  assert.ok(injuries.tiantian.injuries.includes("tiantian-right-palm"));
  assert.ok(injuries.han.injuries.includes("han-shoulder-harpoon"));
  assert.equal(injuries.qixia.injuries.length, 0);
});
```

```js
test("does not rewrite Zhao's work location as his hometown", () => {
  const zhao = HOMETOWN_FACTS.find((fact) => fact.characterId === "zhao");
  assert.match(zhao.wording, /江苏工作/);
});
```

### 31.2 防泄露测试

```js
test("keeps solutions out of raw observations", () => {
  const raw = CHAPTER_TWO_OBSERVATIONS
    .map((item) => `${item.observation}\n${item.note}`)
    .join("\n");

  assert.doesNotMatch(raw, /向右转一百次/);
  assert.doesNotMatch(raw, /丢掉大桌板/);
  assert.doesNotMatch(raw, /九块.*棱锥/);
  assert.doesNotMatch(raw, /站在孔洞下面才是生路/);
  assert.doesNotMatch(raw, /假如我的下一个问题是/);
});
```

面具原文本身含“雨后春笋”，因此测试不能错误禁止这个词。

### 31.3 Engine 成功路径

文件：`tests/chapter-two-engine.test.mjs`

建立 helper：

```js
function reduce(actions, initial = initialChapterTwoState()) {
  return actions.reduce(chapterTwoReducer, initial);
}
```

至少测试：

1. 保护面具 -> 地图 -> 右转 -> 九小板锥体 -> 留叉 -> 孔下方 -> 元问题 -> 四颗道。
2. 每次动画必须用正确 animation ID 才能推进。
3. 成功后角色伤情仍存在。
4. 完成时 `daoCount === 4`。
5. 完成时 `scene === "complete"`。

### 31.4 Engine 错误与死亡

逐项测试：

- 人羊死因答错，标出 `shot-reason`。
- 地点放错，标出具体角色。
- 方向选左，推进2分钟。
- 大桌板未丢弃，标出 `large-decoy`。
- 三次盾牌错误后到 1:15死亡。
- 直接拔鱼叉，危机条 +1。
- 四次救援错误，韩一墨被钉死。
- 站墙边错误，标出 `position`。
- 到 1:30仍未完成，触发死亡。
- 普通“你会拉杆吗”不构成强制逻辑。
- 用完第三问，触发 `yes-no-exhausted`。
- `RETRY_CHECKPOINT` 恢复正确伤情和座钟。

### 31.5 存档测试

文件：`tests/chapter-two-save.test.mjs`

- 空存储返回 `null`。
- 损坏JSON返回 `null`，不抛异常。
- 未知版本拒绝恢复。
- 数组去重。
- 第一章错误投票不能写完成标记。
- 第二章保存后恢复状态完全一致。
- 临时动画状态恢复时回到对应场景稳定态，避免刷新后卡在动画中。

最后一点通过 `sanitizeRestoredState()`：

```ts
if (state.status.kind === "animating") {
  return stableStateForScene(state.scene);
}
```

### 31.6 资产与语音测试

文件：`tests/chapter-two-assets.test.mjs`

- 所有 manifest 文件存在。
- 文件真实存在。
- 计算 SHA-256与 manifest 一致。
- 每个固定语音 line ID 恰好一个文件。
- 每个旧角色使用第一章相同 voice version。
- 齐夏性别仍为男。
- 乔家劲仍为固定克隆音色。
- 不存在 `/api/voice` 运行时生成调用。
- 不存在 `https://...mp3` 临时远端语音。
- BGM至少三条。
- 每个关键动画的 SFX ID均有文件。

### 31.7 渲染测试

在 `tests/rendered-html.test.mjs` 增加：

```js
test("server-renders chapter two without promoting multiplayer", async () => {
  const response = await render("/chapter/2");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /第二章/);
  assert.match(html, /四面杀机/);
  assert.doesNotMatch(html, /创建.*真人房/);
});
```

不要断言未解谜答案出现在 HTML。

---

## 32. 浏览器验收脚本

实现完成后必须在真实浏览器逐步操作，不只看构建：

### 32.1 桌面路径

1. 从第一章正确结算进入第二章。
2. 检查BGM是否由“继续检查房间”手势启动。
3. 完成地图拖拽和点击替代两种路径。
4. 故意放入大桌板，确认具体错误。
5. 重新拼锥体，确认鱼叉雨动画。
6. 故意直接拔叉，确认危机条和错误。
7. 完成留叉。
8. 故意站墙边但不确认，确认系统指出缺口。
9. 完成天降死亡。
10. 故意提交一个普通问题，确认分支图存在“不拉杆”路径。
11. 从检查点重来并完成元问题。
12. 检查长廊、生肖、人龙、四颗道和城市揭幕。

### 32.2 手机路径

尺寸至少：

- 390×844
- 412×915
- 360×800

每个尺寸检查：

- 人物头部完整。
- HUD不遮脸。
- 行动托盘不遮机关。
- 抽屉可触摸滚动。
- 地图标记可点击。
- 桌板不用精细像素拖动也能完成。
- 音量按钮可触达。
- BGM、语音、SFX都有声音。
- 地址栏伸缩时不出现黑色断层。
- 横竖屏切换后状态不丢失。

---

## 33. 具体实施批次

### Commit 1：canon 与纯类型

新增：

- `content/chapter-02-canon-audit.json`
- `app/lib/chapter-two/types.ts`
- `app/lib/chapter-two/canon.ts`
- `tests/chapter-two-canon.test.mjs`

验收：原文范围、角色、伤情、三场考验和伏笔测试通过。

### Commit 2：纯引擎

新增：

- `engine.ts`
- `selectors.ts`
- `chapter-two-engine.test.mjs`

验收：不用React即可跑通全部成功、错误、死亡和检查点。

### Commit 3：存档与第一章入口

新增/修改：

- `save.ts`
- `chapter-two-save.test.mjs`
- `app/page.tsx`

验收：第一章正确投票后可进入第二章；错误投票不能解锁；刷新可恢复。

### Commit 4：第二章骨架

新增：

- `/chapter/2` 路由
- HUD、Stage、ActionTray、Drawer、DeathOverlay
- CSS Module

只用几何占位，不接正式立绘。

验收：所有引擎状态都能在页面操作，桌面和手机不溢出。

### Commit 5：五个可玩谜题

按顺序实现：

1. 人羊死后。
2. 家乡地图。
3. 盾牌拼装。
4. 留叉救援。
5. 天降死亡。
6. 是与非。

每做完一个谜题就补齐对应 engine 和 UI测试，不等全部写完再测。

### Commit 6：正式视觉与动画

新增资产、manifest、动画配置、伤情覆盖层。

验收：官方来源记录完整；固定人物不漂移；十三项关键动画可见。

### Commit 7：静态语音与声场

先本地化第一章固定MP3，再添加第二章语音、BGM和SFX。

验收：运行时无TTS；断网仍可播放已打包音频；手机可听。

### Commit 8：揭幕、性能与上线

完成长廊、人龙、终焉之地、多层视差、保存四颗道和章节结算。

最后执行：

```powershell
npm.cmd test
npm.cmd run lint
$repo = (Resolve-Path ".").Path.Replace("\", "/")
git -c "safe.directory=$repo" diff --check
```

再做桌面、手机、Sites和Render线上实机验证。

---

## 34. 明确不采用的代码方案

- 不把第二章继续塞进 `app/page.tsx`。
- 不用几十个互相耦合的 `useState`。
- 不在React JSX里写 `if (answer === "right")`。
- 不用HTML5 Drag API承担手机交互。
- 不用单张背景图伪装全部动画。
- 不把人物姓名、伤情或谜底做成随机数。
- 不用运行时TTS。
- 不因语音失败临时替换音色。
- 不把外部临时MP3 URL当永久资产。
- 不直接复制参考网站的代码或视觉皮肤。
- 不用全局CSS类覆盖第二章。
- 不在未确认PLAN前创建这些实现文件。

---

## 35. 开发开始时的第一步

用户确认此 CODE PLAN 后，第一步不是画页面，而是：

1. 创建 `chapter-02-canon-audit.json`。
2. 创建 `types.ts` 和最小 `canon.ts`。
3. 写 `chapter-two-canon.test.mjs`。
4. 让 canon 测试通过。
5. 再开始 `engine.ts`。

这样可以防止再次出现“页面已经做了很多，但角色、台词、规则和答案全错”的情况。

---

## 36. 2026-07-29 实装与验收记录

本节记录实际完成物，不能用计划项代替已验证结果。

### 36.1 已锁定资产

- 视觉：`app/lib/chapter-two/assets.ts` 登记 16 个正式资产；所有文件均记录尺寸、SHA-256、来源类别和安全区。
- 角色：第一章九人继续使用原锁定立绘；新增 `renshe-v1`、`renlong-v1`，后续不得重新生成替换。
- 动画：`app/lib/chapter-two/animation.ts` 登记 14 个动画 ID，全部在 `CinematicOverlay.tsx` 有独立可见演出，不使用一张图冒充整个动画链。
- 声场：3 段固定 BGM、14 个固定 SFX，全部打包在 `public/audio/chapter-02/`。
- 第二章语音：23 句、23 个本地 MP3；每句绑定 line ID、speaker ID、voice version、model、输入哈希和文件哈希。
- 第一章语音：原有 18 个远端固定文件已本地化到 `public/audio/chapter-01/voice/`，不再依赖临时远端 URL。
- 齐夏：固定成年男声 `qixia-locked-v2`。
- 乔家劲：固定 `qiao-hk-clone-v1`，香港粤语男声基底合成港式普通话；不在点击时重新生成。
- 运行时：第二章页面、声场控制器和语音清单均不调用 `/api/voice` 或第三方 TTS endpoint。

### 36.2 动画状态链

实际成功链固定为：

1. `mask-writing-reveal` -> `wall-holes-open`
2. `table-turn-right` -> `table-split`
3. `shield-lock` -> `harpoon-volley` -> `rope-retract`
4. `rope-cut-release` -> `ceiling-holes-open`
5. `floor-rise` -> `floor-collapse`
6. `snake-lever` -> `corridor-doors`
7. `city-reveal`

Reducer只接受当前活动的 animation ID；跳过、自动结束和重看都不会绕过正史状态。

### 36.3 自动验收

执行结果：

```text
npm.cmd run lint  -> PASS
npm.cmd test      -> PASS
production build  -> PASS
node tests        -> 38/38 PASS
```

`tests/chapter-two-assets.test.mjs` 额外锁定：

- 16 个视觉文件的真实尺寸和 SHA-256；
- 九块桌板、九个天花孔、九条锥体棱线的数量；
- 3 个 BGM 与 14 个 SFX；
- 23 条第二章语音的一句一文件关系；
- 齐夏男声、乔家劲港普音色版本；
- 14 个动画都有可见实现；
- 运行时代码没有临时 TTS 和远端 MP3。

### 36.4 真实浏览器验收

本地 Vinext 实机验证覆盖：

- 桌面：1440×900。
- 手机：390×844、412×915、360×800。
- 三档手机均无横向溢出；人蛇/人龙与齐夏立绘头部、身体安全区可见；HUD不遮住人物。
- 手机剧情动画占满视口，但底部“跳过动画”按钮仍完整可触达。
- 面具翻转与终焉之地揭幕均在真实浏览器触发并观察到对应动画层。
- 齐夏与乔家劲固定语音按钮均进入播放状态，未出现文件载入错误。
- 最终浏览器控制台：当前本地来源 0 个 error、0 个 warning。

验收时发现 Vinext 的 `/_vinext/image` 优化端点返回 501，曾导致人物空白。正式实现已把锁定立绘和动画图设为直接读取本地原图，并加入自动测试，避免再次出现“立绘存在但页面不显示”。

### 36.5 发布门

本地完成不等于线上完成。发布顺序保持：

1. 用户确认本地版本。
2. 检查 `git diff --check`。
3. 明确提交范围后提交并推送。
4. 触发 Render 发布。
5. 在线打开 `/chapter/2`，重复立绘、语音、动画、手机滚动和版本文本验收。
6. 只有线上观察到本批新特征，才记录发布完成。

### 36.6 主页测试人员调试入口

- 主页左下角保留折叠式“测试人员调试入口”，常驻显示“普通用户请勿点击”。
- 展开后只提供“直接进入第一章”和“直接进入第二章”，不在入口中显示谜底。
- 第一章按钮重新载入第一章开场。
- 第二章按钮只在本机浏览器写入第一章完成标记，创建全新的第二章测试档，再跳转 `/chapter/2`；不会上传或覆盖服务器数据。
- 桌面和 390×844 手机视口已验收：折叠状态不产生横向溢出，展开按钮可触达。
- 实机点击第二章按钮后，页面直接进入“面具为什么没有破”，未出现章节锁定；测试后已清除验收存档。
