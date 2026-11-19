// 副業司令塔ウィジェット (Scriptable / ListWidget Medium想定)
// データ: GitHub tact317/mugi-feeds の status.json（状態コードのみ）
// 部署名・状態ラベルの対応付けはこのスクリプト内だけで行う。
const FEED_URL = "https://raw.githubusercontent.com/tact317/mugi-feeds/main/status.json";
const BOARD_URL = "https://muse.ai/library/artifacts/fu-ye-si-ling-ta-bodo";

const DEPTS = [
  { code: "HQ",    name: "統括・動画",   icon: "🐷" },
  { code: "TOOLS", name: "ツール制作",   icon: "🦝" },
  { code: "GAME",  name: "ゲーム制作",   icon: "🦊" },
  { code: "SALES", name: "販売・収益化", icon: "🐱" },
  { code: "BRAND", name: "ブランド",     icon: "🦉" },
  { code: "IDEA",  name: "アイデア量産", icon: "🐝" },
];
const STATUS = {
  working:       { label: "仕事中",       color: "#34d399" },
  resting:       { label: "おやすみ中",   color: "#8b93a7" },
  waiting_owner: { label: "マスター待ち", color: "#f5a623" },
};

async function loadFeed() {
  try {
    const req = new Request(FEED_URL);
    req.timeoutInterval = 10;
    return await req.loadJSON();
  } catch (e) {
    return null;
  }
}

function fmtTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return hh + ":" + mm;
}

async function buildWidget() {
  const feed = await loadFeed();
  const w = new ListWidget();
  w.backgroundColor = new Color("#0b1220");
  w.setPadding(12, 14, 12, 14);
  w.url = BOARD_URL;

  const head = w.addStack();
  head.centerAlignContent();
  const title = head.addText("副業司令塔");
  title.textColor = new Color("#f5c86b");
  title.font = Font.boldSystemFont(14);
  head.addSpacer();
  const upd = head.addText(feed ? "更新 " + fmtTime(feed.updated) : "取得失敗");
  upd.textColor = new Color("#8b93a7");
  upd.font = Font.systemFont(10);
  w.addSpacer(8);

  const states = feed && feed.s ? feed.s : {};
  for (const d of DEPTS) {
    const st = STATUS[states[d.code]] || { label: "—", color: "#8b93a7" };
    const row = w.addStack();
    row.centerAlignContent();
    const dot = row.addText("●");
    dot.textColor = new Color(st.color);
    dot.font = Font.systemFont(11);
    row.addSpacer(6);
    const nm = row.addText(d.icon + " " + d.name);
    nm.textColor = new Color("#e8ecf4");
    nm.font = Font.systemFont(12);
    row.addSpacer();
    const lb = row.addText(st.label);
    lb.textColor = new Color(st.color);
    lb.font = Font.boldSystemFont(11);
    w.addSpacer(4);
  }

  const next = new Date(Date.now() + 30 * 60 * 1000);
  w.refreshAfterDate = next;
  return w;
}

const widget = await buildWidget();
if (config.runsInWidget) {
  Script.setWidget(widget);
} else {
  widget.presentMedium();
}
Script.complete();
