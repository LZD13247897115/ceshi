# Git 命令速查手册（超详细版）

---

## 一、配置命令

### 全局配置（只用配一次）

```bash
# 设置用户名（会显示在提交记录里）
git config --global user.name "你的名字"

# 设置邮箱
git config --global user.email "your@email.com"

# 设置默认编辑器（解决 Vim 问题）
git config --global core.editor "code --wait"        # VS Code
git config --global core.editor "notepad"           # Windows 记事本
git config --global core.editor "vim"               # Vim

# 设置默认分支名为 main（新版 Git）
git config --global init.defaultBranch main

# 查看所有配置
git config --list

# 查看某个配置
git config user.name
```

### 查看配置

```bash
git config --list              # 列出所有配置
git config --global --list     # 只看全局配置
git config --local --list      # 只看当前仓库配置
```

---

## 二、仓库操作

### 创建仓库

```bash
# 方式 1：本地初始化（从零开始）
git init

# 方式 2：克隆远程仓库（从已有项目开始）
git clone https://github.com/用户名/仓库名.git

# 克隆到指定文件夹
git clone https://github.com/用户名/仓库名.git 文件夹名

# 克隆指定分支
git clone -b 分支名 https://github.com/用户名/仓库名.git
```

### 查看仓库信息

```bash
git status                      # 查看工作区状态（最常用！）
git log                         # 查看提交历史
git log --oneline              # 简洁版（一行一个提交）
git log --oneline --graph      # 带分支图
git log --oneline --graph --all # 显示所有分支的图
git log -5                     # 只看最近 5 条
git log --author="张三"        # 只看某人的提交
git log --since="2024-01-01"   # 只看某日期之后的
git log --grep="feat:"         # 搜索提交信息包含"feat:"的

git remote -v                  # 查看远程仓库地址
git branch -a                  # 查看所有分支（本地+远程）
git branch -vv                 # 查看分支及对应的远程分支
```

---

## 三、文件操作

### 添加文件到暂存区

```bash
git add 文件名                  # 添加单个文件
git add 文件夹名/                # 添加整个文件夹
git add .                       # 添加所有修改（最常用）
git add *.js                    # 添加所有 js 文件
git add -A                      # 添加所有修改、删除、新增
git add -p                      # 交互式选择（部分添加）
```

### 撤销添加

```bash
git restore --staged 文件名     # 从暂存区撤回（保留修改）
git restore --staged .          # 撤回所有暂存
```

### 查看文件差异

```bash
git diff                        # 查看工作区和暂存区的差异
git diff --staged               # 查看暂存区和上次提交的差异
git diff 文件名                 # 查看某个文件的差异
git diff 分支A 分支B            # 查看两个分支的差异
git diff 提交ID1 提交ID2        # 查看两次提交的差异
```

---

## 四、提交命令

### 提交代码

```bash
git commit -m "提交说明"         # 标准提交
git commit -m "feat: 新增登录"   # 带类型的提交（规范）
git commit -am "提交说明"        # 自动 add 所有修改过的文件（不包括新增）
```

### 修改最后一次提交

```bash
git commit --amend              # 修改最后一次提交的说明
git commit --amend --no-edit    # 不改说明，只把新修改加进去
git commit --amend -m "新说明"  # 修改说明
```

> ⚠️ **注意**：如果已经 push 到远程，amend 后需要强制推送 `git push --force`

---

## 五、分支操作（重点！）

### 查看分支

```bash
git branch                      # 查看本地分支
git branch -a                   # 查看所有分支（本地+远程）
git branch -r                   # 只看远程分支
git branch -vv                  # 查看分支及最新提交
git branch --merged             # 查看已合并到当前分支的分支
git branch --no-merged          # 查看未合并的分支
```

### 创建分支

```bash
git branch 新分支名             # 创建分支（不切换）
git checkout -b 新分支名        # 创建并切换（常用）
git checkout -b 新分支名 起点分支 # 从指定分支创建
git switch -c 新分支名          # 新版命令（创建并切换）
```

### 切换分支

```bash
git checkout 分支名             # 切换分支
git checkout -                  # 切换到上一个分支
git switch 分支名               # 新版命令
git switch -                    # 切换到上一个分支
```

> ⚠️ **切换前必须工作区干净！** 有未提交的修改会报错

### 合并分支

```bash
git checkout master             # 先切到要合并到的分支
git merge feature/login         # 把 feature/login 合并进来

# 合并时保留分支历史（产生合并提交）
git merge --no-ff feature/login

# 合并时快进（不产生合并提交，历史是一条线）
git merge --ff-only feature/login
```

### 删除分支

```bash
git branch -d 分支名            # 删除已合并的分支
git branch -D 分支名            # 强制删除（未合并的也能删）
git push origin --delete 分支名 # 删除远程分支
git push origin :分支名          # 同上（老语法）
```

### 重命名分支

```bash
git branch -m 旧名 新名         # 重命名
```

---

## 六、远程操作（重点！）

### 查看远程仓库

```bash
git remote -v                   # 查看所有远程仓库
git remote show origin          # 查看 origin 的详细信息
```

### 添加/删除远程仓库

```bash
git remote add origin 地址       # 添加远程仓库（通常叫 origin）
git remote add upstream 地址     # 添加上游仓库（fork 项目用）
git remote remove origin         # 删除远程仓库
git remote rename old new        # 重命名远程仓库
git remote set-url origin 新地址 # 修改远程仓库地址
```

### 拉取代码

```bash
git fetch                       # 下载远程所有分支的更新（不合并）
git fetch origin                # 下载 origin 的更新
git fetch upstream              # 下载 upstream 的更新

git pull                        # fetch + merge（拉取并合并当前分支）
git pull origin master          # 拉取 origin 的 master 分支
git pull --rebase               # fetch + rebase（保持历史干净）

# 等价于：
git fetch origin
git merge origin/master
```

### 推送代码

```bash
git push                        # 推送到默认远程分支
git push origin master          # 推送到 origin 的 master
git push -u origin master       # 第一次推送，建立追踪关系
git push origin 分支名          # 推送指定分支
git push --all origin          # 推送所有分支
git push --force               # 强制推送（⚠️ 危险！）
git push --force-with-lease    # 相对安全的强制推送
```

---

## 七、撤销与回退（救命命令！）

### 撤销工作区的修改

```bash
git restore 文件名              # 撤销某个文件的修改（恢复到上次提交）
git restore .                   # 撤销所有修改
git checkout -- 文件名         # 老语法（同上）
```

> ⚠️ **危险！修改会丢失，无法恢复！**

### 撤销暂存区的文件

```bash
git restore --staged 文件名     # 从暂存区撤回（保留工作区修改）
git restore --staged .        # 撤回所有暂存
git reset HEAD 文件名          # 老语法（同上）
```

### 回退到指定版本

```bash
# 方式 1：soft（保留修改到暂存区）
git reset --soft HEAD~1         # 回退 1 次提交，修改还在暂存区

# 方式 2：mixed（保留修改到工作区，默认）
git reset --mixed HEAD~1        # 回退 1 次提交，修改在工作区
git reset HEAD~1                # 同上（简写）

# 方式 3：hard（彻底丢弃修改，⚠️ 危险！）
git reset --hard HEAD~1         # 回退 1 次提交，修改完全丢失

# 回退到指定提交
git reset --hard 提交ID          # 回退到某个提交
```

### 查看所有操作记录（用于找回）

```bash
git reflog                      # 查看所有 HEAD 变动记录
git reflog --all                # 查看所有分支的变动
```

> 💡 **救命用法**：即使 `git reset --hard` 了，也能用 `reflog` 找回！

---

## 八、暂存（Stash）

### 临时保存修改

```bash
git stash                       # 暂存所有修改（工作区变干净）
git stash push -m "说明"         # 带说明的暂存
git stash push 文件名            # 只暂存某个文件
git stash -u                      # 暂存包括未跟踪的新文件
git stash -a                      # 暂存所有（包括忽略的文件）
```

### 查看暂存列表

```bash
git stash list                  # 查看所有暂存
git stash show                  # 查看最新暂存的详情
git stash show -p               # 查看最新暂存的差异
```

### 恢复暂存

```bash
git stash pop                   # 恢复最新暂存，并从列表删除
git stash apply                 # 恢复最新暂存，但保留在列表中
git stash apply stash@{1}       # 恢复指定的暂存
git stash drop stash@{0}        # 删除最新暂存
git stash clear                 # 清空所有暂存
```

---

## 九、标签操作

```bash
git tag                         # 查看所有标签
git tag v1.0.0                  # 创建轻量标签
git tag -a v1.0.0 -m "版本说明" # 创建附注标签
git tag -d v1.0.0               # 删除标签
git push origin v1.0.0          # 推送标签到远程
git push origin --tags          # 推送所有标签
git checkout v1.0.0             # 切换到标签（分离 HEAD）
```

---

## 十、高级操作

### Rebase（变基）

```bash
git rebase master               # 把当前分支变基到 master 上
git rebase -i HEAD~3            # 交互式变基最近 3 次提交

# 常用：整理提交历史
git rebase -i HEAD~5
# 然后可以：pick（保留）、squash（合并）、drop（删除）、reword（改说明）

# 变基时遇到冲突
git rebase --continue           # 解决冲突后继续
git rebase --skip               # 跳过当前提交
git rebase --abort              # 放弃变基
```

### Cherry-pick（挑拣提交）

```bash
git cherry-pick 提交ID          # 把某个提交应用到当前分支
git cherry-pick 提交A 提交B      # 挑拣多个提交
git cherry-pick -n 提交ID        # 挑拣但不自动提交
```

### Bisect（二分查找 bug）

```bash
git bisect start                # 开始二分查找
git bisect bad                  # 当前提交有 bug
git bisect good 提交ID          # 这个提交是好的
# Git 会自动 checkout 中间提交，你测试后标记 good/bad，直到找到引入 bug 的提交
git bisect reset                # 结束查找
```

---

## 十一、日常开发完整流程（对照用）

```bash
# ========== 1. 开始新功能 ==========
git checkout develop            # 切到开发分支
git pull origin develop         # 拉最新代码
git checkout -b feature/login   # 创建功能分支

# ========== 2. 开发中 ==========
# ... 写代码 ...
git add .                       # 添加修改
git commit -m "feat: 新增登录页面"

# ... 继续开发 ...
git add .
git commit -m "feat: 登录接口联调"

# ========== 3. 开发完，同步主分支最新代码 ==========
git fetch origin                # 下载远程更新
git rebase origin/develop       # 变基保持历史干净（可能冲突）

# ========== 4. 推送到远程 ==========
git push -u origin feature/login

# ========== 5. 网页上发起 Pull Request ==========

# ========== 6. 合并后清理 ==========
git checkout develop
git pull origin develop
git branch -d feature/login   # 删除本地分支
git push origin --delete feature/login  # 删除远程分支
```

---

## 十二、常见问题速查

| 问题 | 命令 |
|------|------|
| 忘记刚才改了什么 | `git status` |
| 想看某文件谁改的 | `git blame 文件名` |
| 代码冲突了 | 打开文件找 `<<<<<<<` 手动解决，然后 `git add . && git commit` |
| 进 Vim 了怎么退出 | 按 `Esc`，输入 `:q!`，回车 |
| 误删了文件（没提交） | `git restore 文件名` |
| 误删了文件（已提交） | `git checkout HEAD -- 文件名` |
| 忽略文件不生效 | `git rm -r --cached . && git add . && git commit -m "fix: 更新忽略规则"` |
| 大文件误提交 | `git filter-branch --force --index-filter 'git rm --cached --ignore-unmatch 文件名' HEAD` |
| 保存用户名密码 | `git config --global credential.helper store` |

---

## 十三、.gitignore 模板

```gitignore
# 依赖
node_modules/
vendor/

# 构建产物
dist/
build/
*.exe
*.dll

# 日志
*.log
logs/

# 环境配置（含敏感信息）
.env
.env.local
.env.production

# IDE
.idea/
.vscode/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# 临时文件
tmp/
temp/
*.tmp
```

---

> 这份手册覆盖了 **90% 的日常 Git 操作**。建议收藏，遇到问题时按 **Ctrl+F** 搜索关键词。
