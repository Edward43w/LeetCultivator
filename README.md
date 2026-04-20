# ⚔️ Code 問仙門 · LeetCultivator

一款以**仙俠修煉**為主題的 LeetCode 刷題追蹤系統，用成長系統的方式提升練習反饋。將演算法練習轉化為修士闖關之路——每解一題即是淬煉修為，突破境界，覺醒聖體，參悟心經。

> **⚠️ 目前版本為 v1.3**  
> 已從網頁服務架構改為**本地桌面工具**，不再需要帳號/密碼/Email。直接 download、double-click 即可開始修煉。

---

## 核心功能

### 洞府主頁（Dashboard）
- 顯示當前境界（如「練氣期【七重/九重】」）及修為進度條
- 左側欄：最近修煉紀錄 + 已修煉心經（含等級進度條）
- 右側欄：修煉統計（總破陣數 / Easy / Med / Hard）、簽到日曆（可切換月份）、連續簽到天數 / 最長連續
- 中央修士動態特效：白色靈塵全洞府飄散、波紋靈環、迴旋靈環、腳下靈光
- 用服用丹藥的方式來導入「傳送修煉紀錄」Modal

### 修煉紀錄 Modal（RecordModal）
- 填寫題目名稱、題號、難度（Easy / Medium / Hard）、語言、連結、完成日期
- 選擇心經標籤（多選）
- 必填修行手札：解題思路摘要、卡關點/易錯點、複習提醒
- **本次修煉感受（下次重修時間）**：選擇這次解題的熟悉程度，決定初次出現在回爐重煉的時間
- 送出後顯示成就畫面：獲得修為、境界突破、聖體升級、心經進階

### 修為系統
| 難度 | 獲得修為 |
|------|---------|
| Easy | +10 |
| Medium | +25 |
| Hard | +50 |

修為累積達到門檻即自動**突破境界**，系統通知境界名稱。

### 境界修煉圖（RealmsPage）
- **人界**：9 大境 × 9 重天 = 共 81 層
  - 練氣期 → 築基期 → 金丹期 → 元嬰期 → 化神期 → 煉虛期 → 合體期 → 大乘期 → 渡劫期
- **仙界**：6 大境 × 3 期 = 共 18 層
  - 地仙 → 天仙 → 金仙 → 太乙金仙 → 大羅金仙 → 仙帝
- 可切換人界 / 仙界視圖；顯示已解鎖 / 當前 / 未解鎖境界與修為門檻差距

### 藏經閣心經（SutrasPage）
- 展示所有題目類型標籤（如「Array」→「萬陣心經」）
- 每個心經暫時的設計有 6 個等級，目前所有的心經都依照固定的解題數解鎖：

| 等級 | 所需破陣數 |
|------|-----------|
| 未解鎖 | 0 |
| 入門   | 1 |
| 小成   | 5 |
| 中成   | 15 |
| 大成   | 30 |
| 圓滿   | 50 |

- 點擊可開啟心經詳情 Modal（含等級光效）
- 頂部篩選：全部 / 已修行 / 未解鎖

### 修煉歷程（HistoryPage）
- 完整修煉紀錄列表，支援展開查看修行手札
- 每筆紀錄顯示**題目程度**（生疏 / 入門 / 小成 / 大成 / 圓滿）與**上次重修結果**
- **篩選**：難度 / 語言（聖體）/ 標籤（心經）
- **搜尋**：輸入題號或題目名稱即時過濾
- **編輯**：修改任何欄位；「本次修煉感受（下次重修時間）」可重新選擇，系統自動更新下次重修日期
- **刪除**：確認後刪除並對相關紀錄一併刪除（修為、心經、簽到、連續天數）

### 回爐重煉（ReviewPage）
- 列出今日（含逾期）到期的重修題目，標示**逾期天數**或**今日到期**
- 每題顯示熟練度（生疏 / 入門 / 小成 / 大成 / 圓滿）與上次重修結果
- 點擊「重修」開啟 Modal：可追加修行手札並選擇本次感受
- 感受選項決定下次重修間隔，同時調整該題的累積熟練度分數
- 完成重修後自動觸發當日簽到紀錄

#### 重修感受 × 間隔 × 熟練度調整

| 感受 | 下次重修 | 熟練度分數 |
|------|---------|-----------|
| 易忘 | 明天    | −1 |
| 尚可 | 3 天後  | +1 |
| 輕鬆 | 7 天後  | +2 |
| 精通 | 14 天後 | +3 |

#### 題目程度（累積熟練度分數換算）

| 分數 | 程度 |
|------|------|
| 0    | 生疏 |
| 1–3  | 入門 |
| 4–6  | 小成 |
| 7–9  | 大成 |
| 10+  | 圓滿 |

### 聖體系統（BodySelectionPage）
- 修士選擇主要修煉語言（C++ / Python / JavaScript / Java 等）
- 每個語言獨立追蹤解題數與等級：
  - 初成（0+）→ 小成（20+）→ 中成（60+）→ 大成（150+）→ 圓滿

### 設置（SettingsPage）
- 查看/修改 道號（暱稱）
- 更換主要聖體（語言）顯示

### 初次啟動（AuthPage）
- 僅需輸入一個**道號（暱稱）**即可建立本地修士檔案
- 之後每次開啟工具**自動進入**，無需任何登入動作
- 資料全部儲存在本機，不上傳任何伺服器

---

## 未來規劃 / Roadmap

> 以下為 MVP 後的計畫改進方向，目前尚未實作。

### 聖體系統擴充
- **MVP 現況**：目前僅支援 4 種語言（聖體），且所有聖體共用同一套外觀。
- **後續規劃**：
  - 為各聖體設計獨立外觀（至少 4 種以上風格的修士造型）
  - 或在境界提升時獲得新外觀獎勵
  - 開放用戶**自訂新增語言（聖體）**，不再受限於預設 4 種

### 修為難度系統
- **MVP 現況**：Easy +10 / Medium +25 / Hard +50，數值為初步估算，境界門檻也僅作概略規劃。
- **後續規劃**：
  - 新增全局**修煉難度設定**（易 / 中 / 難），讓用戶自選挑戰強度
  - 不同難度下修為增益倍率不同，境界突破所需修為隨之調整
  - 重新校正各境界門檻數值，讓成長曲線更符合直覺

### 心經動態成長機制
- **MVP 現況**：所有心經（Tag）統一使用相同題數門檻升級（1 / 5 / 15 / 30 / 50），未考慮各 Tag 實際題目數量差異。
- **後續規劃**：
  - 根據 LeetCode 各 Tag 的實際題目總數，**動態計算**各心經的升級門檻（例如題目多的 Tag 門檻高，題目少的 Tag 門檻低）
  - 或開放用戶 / 管理者自訂各心經的成長曲線

---

## 🛠️ 技術架構

### 前端
| 技術 | 說明 |
|------|------|
| React 19 | UI 框架 |
| React Router 7 | 路由管理 |
| TypeScript 5.8 | 型別安全 |
| Vite 6 | 建置工具 |
| Tailwind CSS 4 | 樣式 |
| Framer Motion 12 | 動畫 |
| Zustand 5 | 全域狀態 |
| Lucide React | 圖示 |

### 後端
| 技術 | 說明 |
|------|------|
| Express 4 | HTTP 伺服器（內嵌於 Electron） |
| Prisma 5 | ORM |
| SQLite | 本地資料庫（零設定） |

### 桌面殼層
| 技術 | 說明 |
|------|------|
| Electron 41 | 桌面視窗 |
| electron-builder | 打包成 .exe / .dmg |

---

## 🗃️ 資料庫

```
User                  使用者（道號、修為、當前境界、主聖體）
RealmLevel            境界等級（名稱、修為門檻、界別）
BodyType              聖體類型（程式語言）
UserBodyType          使用者聖體進度（解題數、等級）
Tag                   題目標籤 / 心經
ProblemLog            修煉紀錄（題目、難度、語言、日期、熟練度分數、下次重修日期）
CultivationNote       修行手札（思路、卡關點、複習提醒）
ProblemLogTag         紀錄 ← → 心經（多對多）
UserTagProgress       使用者心經掌握進度
DailyCheckin          每日簽到紀錄（含重修觸發）
UserProgressSummary   聚合統計（總解題數、連續天數）
ReviewHistory         重修歷史紀錄（每次重修結果）
```

---

## 🚀 快速啟動（開發模式）

**前置需求**：Node.js 18+、npm

```bash
# 1. clone 專案
git clone https://github.com/Edward43w/LeetCultivator.git
cd LeetCultivator

# 2. 安裝依賴
npm install

# 3. 初始化資料庫（建表 + 寫入預設境界 & 心經）
npm run init:local

# 4. 啟動開發伺服器（瀏覽器預覽，port 3000）
npm run dev
```

瀏覽器開啟 `http://localhost:3000`，第一次進入輸入道號即可開始修煉。

---

## 🖥️ Electron 桌面模式

### 開發測試（Electron 視窗）

```bash
# 建置前端 + 編譯 Electron main，再開 Electron 視窗
npm run electron:dev
```

### 打包成桌面安裝檔

```bash
# 輸出到 release/ 資料夾
# Windows → release/*.exe（NSIS 安裝精靈）
# macOS   → release/*.dmg
npm run electron:build
```

### 使用者資料位置

| 平台 | 資料庫路徑 |
|------|-----------|
| Windows | `%APPDATA%\Code問仙門\leet-cultivator.db` |
| macOS | `~/Library/Application Support/Code問仙門/leet-cultivator.db` |
| Linux | `~/.config/Code問仙門/leet-cultivator.db` |

> 版本更新後**資料不會遺失**，Electron 啟動時自動套用尚未執行的 migration，無需手動操作。

---

## 📁 專案結構

```
src/
├── pages/
│   ├── AuthPage.tsx           # 首次啟動道號設定
│   ├── Dashboard.tsx          # 主洞府（3 欄格局）
│   ├── BodySelectionPage.tsx  # 初始聖體選擇
│   ├── RealmsPage.tsx         # 境界修煉圖
│   ├── SutrasPage.tsx         # 藏經閣心經
│   ├── HistoryPage.tsx        # 修煉歷程
│   ├── ReviewPage.tsx         # 回爐重煉（重修系統）
│   └── SettingsPage.tsx       # 設置
├── components/
│   ├── Layout.tsx             # 側邊導航
│   ├── RecordModal.tsx        # 修煉紀錄 Modal
│   ├── CultivatorImage.tsx    # 洞府動態特效
│   └── BackgroundParticles.tsx
├── store/
│   └── authStore.ts           # Zustand 狀態（userId）
└── lib/
    ├── api.ts                 # API 請求封裝（x-user-id header）
    └── realmDisplay.ts        # 境界顯示工具

server.ts                      # Express API（全部後端邏輯）
electron/
└── main.ts                    # Electron 主程序
prisma/
├── schema.prisma              # 資料庫結構定義
└── migrations/                # Migration 歷史紀錄（版本遷移用）
app/applet/prisma/
└── seed.ts                    # 預設境界 & 心經資料（含於 init:local）
```

---



