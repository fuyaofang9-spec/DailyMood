import { useState, useRef, useCallback } from "react";

const MOCK_DATA = {
  date: "今天",
  mood: "今天你同理心非常强，会乐于助人，而你所释放出的善意，最终也会回馈给你，是价值感满满的一天。",
  advice: "及时回馈、见想见的人",
  avoid: "弯腰驼背、不懂珍惜",
  luckyColor: "碧青",
  luckyColorHex: "#7DD8C6",
  luckyJewelry: "祖母绿",
  luckyJewelryHex: "#50C878",
  luckyTime: "17-19点",
  luckyDirection: "正西",
  luckyNumbers: ["1", "2"],
  luckyFood: "烤冷面",
  luckyItem: "解压玩具",
  luckyFlower: "勿忘我",
};

const OUTFIT_SUGGESTIONS = {
  碧青: {
    top: "碧青色棉麻衬衫 / 薄荷绿针织开衫",
    bottom: "白色阔腿裤 / 浅灰直筒裤",
    shoes: "白色小皮鞋 / 银色乐福鞋",
    bag: "米白色托特包",
    desc: "清透感穿搭，与今日幸运色「碧青」共振",
  },
  玫红: {
    top: "玫瑰红丝绸衬衫 / 粉红针织背心",
    bottom: "黑色直筒裙 / 深蓝牛仔裤",
    shoes: "裸粉色高跟鞋 / 红色芭蕾鞋",
    bag: "枣红色链条包",
    desc: "热烈感穿搭，与幸运色「玫红」相呼应",
  },
  金黄: {
    top: "金棕色缎面衬衫 / 焦糖色针织衫",
    bottom: "卡其色阔腿裤 / 驼色半裙",
    shoes: "棕色切尔西靴 / 金色凉鞋",
    bag: "焦糖色皮质手提包",
    desc: "温暖丰盛感，与幸运色「金黄」同频",
  },
};

const DEFAULT_OUTFIT = OUTFIT_SUGGESTIONS["碧青"];

function parseTimeRange(timeStr) {
  const match = timeStr.match(/(\d+)-(\d+)/);
  if (match) return { start: parseInt(match[1]), end: parseInt(match[2]) };
  return { start: 17, end: 19 };
}

function generateSchedule(data) {
  const { luckyTime, luckyFood, luckyDirection, luckyItem } = data;
  const { start, end } = parseTimeRange(luckyTime);

  return [
    {
      id: 1,
      time: "07:30",
      emoji: "🌅",
      title: "晨间启动",
      desc: "穿上今日幸运色系穿搭，拍一张镜子自拍，开启好运频道",
      category: "morning",
      editable: true,
    },
    {
      id: 2,
      time: "08:00",
      emoji: "🌿",
      title: "佩戴幸运饰品",
      desc: `今日幸运配饰：${data.luckyJewelry}色系首饰，戴上它出门能量满满`,
      category: "morning",
      editable: true,
    },
    {
      id: 3,
      time: "09:00",
      emoji: "📋",
      title: "整理今日优先事项",
      desc: "同理心强的你，今日适合处理需要倾听和沟通的任务",
      category: "work",
      editable: true,
    },
    {
      id: 4,
      time: "12:00",
      emoji: "🍜",
      title: `午餐：尝试${luckyFood}`,
      desc: `今日幸运食物是「${luckyFood}」，可以去附近找找`,
      category: "meal",
      editable: true,
    },
    {
      id: 5,
      time: "14:00",
      emoji: "🤝",
      title: "联系一位想念的人",
      desc: "今日建议「见想见的人」，发一条消息或打个电话吧",
      category: "social",
      editable: true,
    },
    {
      id: 6,
      time: `${start}:00`,
      emoji: "⭐",
      title: `幸运时辰：${luckyTime}`,
      desc: `这是今天能量最强的时段，适合做重要决定、谈重要的事`,
      category: "peak",
      editable: true,
    },
    {
      id: 7,
      time: `${Math.floor((start + end) / 2)}:30`,
      emoji: "🧭",
      title: `朝${luckyDirection}方向散步`,
      desc: `散步时朝「${luckyDirection}」方向走，感受今日幸运气场`,
      category: "activity",
      editable: true,
    },
    {
      id: 8,
      time: "19:30",
      emoji: "🌸",
      title: `${luckyFlower || "勿忘我"}能量补充`,
      desc: `可以买一束${data.luckyFlower || "勿忘我"}，或者搜索花语感受今日花卉能量`,
      category: "evening",
      editable: true,
    },
    {
      id: 9,
      time: "21:00",
      emoji: "🎯",
      title: `玩${luckyItem || "解压玩具"}放松`,
      desc: `今日幸运随身物「${luckyItem || "解压玩具"}」，晚间解压好选择`,
      category: "evening",
      editable: true,
    },
    {
      id: 10,
      time: "22:30",
      emoji: "📖",
      title: "今日复盘",
      desc: "记录今天做了哪些善意的事，感恩日记写一条",
      category: "night",
      editable: true,
    },
  ];
}

const CATEGORY_COLORS = {
  morning: { bg: "#FFF9E6", dot: "#F5A623", label: "晨间" },
  work: { bg: "#EBF4FF", dot: "#4A90D9", label: "工作" },
  meal: { bg: "#FFF0E6", dot: "#FF6B35", label: "饮食" },
  social: { bg: "#F0FFF4", dot: "#2ECC71", label: "社交" },
  peak: { bg: "#FFF0FF", dot: "#9B59B6", label: "黄金时辰" },
  activity: { bg: "#E6FFFA", dot: "#1ABC9C", label: "活动" },
  evening: { bg: "#FFF5F5", dot: "#E74C3C", label: "晚间" },
  night: { bg: "#F0F0FF", dot: "#5B5EA6", label: "夜晚" },
};

export default function LuckyDayPlanner() {
  const [step, setStep] = useState("upload"); // upload | input | result
  const [luckyData, setLuckyData] = useState(null);
  const [schedule, setSchedule] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editTime, setEditTime] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [uploading, setUploading] = useState(false);
  const [analysisText, setAnalysisText] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [manualForm, setManualForm] = useState({
    luckyColor: "", luckyColorHex: "#7DD8C6",
    luckyJewelry: "", luckyJewelryHex: "#50C878",
    luckyTime: "", luckyDirection: "",
    luckyNumbers: "", luckyFood: "",
    luckyItem: "", luckyFlower: "",
    mood: "", advice: "", avoid: "",
  });
  const fileRef = useRef();
  const [exportMsg, setExportMsg] = useState("");
  const [dragOver, setDragOver] = useState(false);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const base64 = await new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = () => res(r.result.split(",")[1]);
        r.onerror = rej;
        r.readAsDataURL(file);
      });

      const resp = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: file.type || "image/jpeg", data: base64 } },
              { type: "text", text: `请分析这张测测APP每日心情截图，提取所有幸运元素，以JSON格式返回，只返回JSON不要其他内容：
{
  "mood": "今日运势描述",
  "advice": "建议",
  "avoid": "避免",
  "luckyColor": "幸运颜色名称",
  "luckyColorHex": "最接近的十六进制颜色代码",
  "luckyJewelry": "幸运配饰名称",
  "luckyJewelryHex": "配饰颜色的十六进制代码",
  "luckyTime": "幸运时辰如17-19点",
  "luckyDirection": "幸运方位",
  "luckyNumbers": ["数字1", "数字2"],
  "luckyFood": "幸运食物",
  "luckyItem": "幸运随身物",
  "luckyFlower": "幸运花"
}` }
            ]
          }]
        })
      });
      const d = await resp.json();
      const text = d.content?.map(i => i.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      const finalData = { ...MOCK_DATA, ...parsed };
      setLuckyData(finalData);
      setSchedule(generateSchedule(finalData));
      setStep("result");
    } catch (e) {
      console.error(e);
      // fallback to mock
      setLuckyData(MOCK_DATA);
      setSchedule(generateSchedule(MOCK_DATA));
      setStep("result");
    }
    setUploading(false);
  };

  const handleManualSubmit = () => {
    const nums = manualForm.luckyNumbers.split(/[,，\s]+/).filter(Boolean);
    const data = {
      ...MOCK_DATA,
      ...manualForm,
      luckyNumbers: nums.length ? nums : ["1", "2"],
    };
    setLuckyData(data);
    setSchedule(generateSchedule(data));
    setStep("result");
  };

  const useMockData = () => {
    setLuckyData(MOCK_DATA);
    setSchedule(generateSchedule(MOCK_DATA));
    setStep("result");
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditTime(item.time);
    setEditTitle(item.title);
    setEditDesc(item.desc);
  };

  const saveEdit = () => {
    setSchedule(s => s.map(i => i.id === editingId
      ? { ...i, time: editTime, title: editTitle, desc: editDesc }
      : i));
    setEditingId(null);
  };

  const deleteItem = (id) => setSchedule(s => s.filter(i => i.id !== id));

  const moveUp = (idx) => {
    if (idx === 0) return;
    setSchedule(s => {
      const n = [...s];
      [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]];
      return n;
    });
  };

  const moveDown = (idx) => {
    setSchedule(s => {
      if (idx === s.length - 1) return s;
      const n = [...s];
      [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]];
      return n;
    });
  };

  const exportToCalendar = () => {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, "");
    let ics = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//LuckyDayPlanner//CN\n";
    schedule.forEach((item, i) => {
      const [h, m] = item.time.split(":").map(Number);
      const startDT = `${dateStr}T${String(h).padStart(2,"0")}${String(m).padStart(2,"0")}00`;
      const endH = h + 1 > 23 ? 23 : h + 1;
      const endDT = `${dateStr}T${String(endH).padStart(2,"0")}${String(m).padStart(2,"0")}00`;
      ics += `BEGIN:VEVENT\nUID:lucky-${i}-${Date.now()}\nSUMMARY:${item.emoji} ${item.title}\nDESCRIPTION:${item.desc}\nDTSTART:${startDT}\nDTEND:${endDT}\nEND:VEVENT\n`;
    });
    ics += "END:VCALENDAR";
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lucky-day-${dateStr}.ics`;
    a.click();
    setExportMsg("✅ 日程已导出！用日历App打开 .ics 文件即可导入");
    setTimeout(() => setExportMsg(""), 4000);
  };

  const outfit = luckyData
    ? OUTFIT_SUGGESTIONS[luckyData.luckyColor] || DEFAULT_OUTFIT
    : DEFAULT_OUTFIT;

  // ─── UPLOAD SCREEN ───────────────────────────────────────────────────────────
  if (step === "upload") {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #E0F7F4 0%, #EBF4FF 50%, #FFF0FF 100%)",
        fontFamily: "'PingFang SC', 'Hiragino Sans GB', sans-serif",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "24px",
      }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>🌟</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#2C3E50", margin: 0, letterSpacing: "-0.5px" }}>
            幸运日程规划师
          </h1>
          <p style={{ color: "#7F8C8D", marginTop: 8, fontSize: 15 }}>
            上传测测每日心情截图，AI 帮你规划完美一天
          </p>
        </div>

        {!manualMode ? (
          <div style={{ width: "100%", maxWidth: 400 }}>
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]); }}
              onClick={() => fileRef.current.click()}
              style={{
                border: `2px dashed ${dragOver ? "#7DD8C6" : "#B0DDD6"}`,
                borderRadius: 20,
                padding: "40px 24px",
                textAlign: "center",
                cursor: "pointer",
                background: dragOver ? "rgba(125,216,198,0.1)" : "rgba(255,255,255,0.7)",
                transition: "all 0.2s",
                backdropFilter: "blur(8px)",
                marginBottom: 16,
              }}
            >
              {uploading ? (
                <div>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>🔮</div>
                  <p style={{ color: "#5B8DB8", fontWeight: 600 }}>AI 正在解析幸运元素...</p>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>📸</div>
                  <p style={{ fontWeight: 700, color: "#2C3E50", fontSize: 16, margin: "0 0 4px" }}>
                    上传测测截图
                  </p>
                  <p style={{ color: "#95A5A6", fontSize: 13, margin: 0 }}>
                    点击或拖拽图片到这里
                  </p>
                </>
              )}
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={(e) => handleFile(e.target.files[0])} />
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setManualMode(true)} style={{
                flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #B0DDD6",
                background: "rgba(255,255,255,0.8)", color: "#5B8DB8", fontWeight: 600,
                cursor: "pointer", fontSize: 14,
              }}>
                ✏️ 手动输入
              </button>
              <button onClick={useMockData} style={{
                flex: 1, padding: "12px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #7DD8C6, #5B8DB8)",
                color: "white", fontWeight: 700, cursor: "pointer", fontSize: 14,
              }}>
                🎯 用示例数据
              </button>
            </div>
          </div>
        ) : (
          /* Manual Input Form */
          <div style={{ width: "100%", maxWidth: 440, background: "rgba(255,255,255,0.85)", borderRadius: 20, padding: 24, backdropFilter: "blur(10px)" }}>
            <h2 style={{ margin: "0 0 20px", fontSize: 18, fontWeight: 700, color: "#2C3E50" }}>✏️ 手动输入幸运元素</h2>
            {[
              ["mood", "今日运势描述", "textarea"],
              ["advice", "建议", "text"],
              ["avoid", "避免", "text"],
              ["luckyColor", "幸运颜色", "text"],
              ["luckyColorHex", "幸运颜色代码", "color"],
              ["luckyJewelry", "幸运配饰", "text"],
              ["luckyTime", "幸运时辰 (如17-19点)", "text"],
              ["luckyDirection", "幸运方位", "text"],
              ["luckyNumbers", "幸运数字 (逗号分隔)", "text"],
              ["luckyFood", "幸运食物", "text"],
              ["luckyItem", "幸运随身物", "text"],
              ["luckyFlower", "幸运花", "text"],
            ].map(([key, label, type]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 13, color: "#7F8C8D", display: "block", marginBottom: 4 }}>{label}</label>
                {type === "textarea" ? (
                  <textarea value={manualForm[key]} onChange={e => setManualForm(f => ({ ...f, [key]: e.target.value }))}
                    rows={3} style={{ width: "100%", borderRadius: 10, border: "1.5px solid #D5E8E4", padding: "8px 12px", fontSize: 14, resize: "none", boxSizing: "border-box" }} />
                ) : (
                  <input type={type} value={manualForm[key]} onChange={e => setManualForm(f => ({ ...f, [key]: e.target.value }))}
                    style={{ width: "100%", borderRadius: 10, border: "1.5px solid #D5E8E4", padding: "8px 12px", fontSize: 14, boxSizing: "border-box" }} />
                )}
              </div>
            ))}
            <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button onClick={() => setManualMode(false)} style={{
                flex: 1, padding: 12, borderRadius: 12, border: "1.5px solid #D5E8E4",
                background: "white", color: "#7F8C8D", cursor: "pointer", fontWeight: 600,
              }}>返回</button>
              <button onClick={handleManualSubmit} style={{
                flex: 2, padding: 12, borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, #7DD8C6, #5B8DB8)",
                color: "white", fontWeight: 700, cursor: "pointer", fontSize: 15,
              }}>生成幸运日程 ✨</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── RESULT SCREEN ───────────────────────────────────────────────────────────
  const d = luckyData;
  const colorStyle = { background: d.luckyColorHex, width: 18, height: 18, borderRadius: "50%", display: "inline-block", marginRight: 6, verticalAlign: "middle" };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #E8F8F5 0%, #EBF4FF 60%, #FEF0FF 100%)",
      fontFamily: "'PingFang SC', 'Hiragino Sans GB', sans-serif",
      paddingBottom: 100,
    }}>
      {/* Header */}
      <div style={{
        background: "rgba(255,255,255,0.7)",
        backdropFilter: "blur(12px)",
        padding: "16px 20px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: "1px solid rgba(125,216,198,0.3)",
        position: "sticky", top: 0, zIndex: 100,
      }}>
        <button onClick={() => setStep("upload")} style={{
          background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#5B8DB8",
        }}>‹</button>
        <div style={{ fontWeight: 800, fontSize: 18, color: "#2C3E50" }}>✨ 今日幸运日程</div>
        <button onClick={exportToCalendar} style={{
          background: "linear-gradient(135deg, #7DD8C6, #5B8DB8)",
          color: "white", border: "none", borderRadius: 20, padding: "7px 14px",
          fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}>导入日历</button>
      </div>

      {exportMsg && (
        <div style={{ background: "#D5F5E3", color: "#27AE60", padding: "10px 20px", textAlign: "center", fontSize: 14, fontWeight: 600 }}>
          {exportMsg}
        </div>
      )}

      <div style={{ maxWidth: 520, margin: "0 auto", padding: "16px 16px 0" }}>

        {/* Today's Energy Card */}
        <div style={{
          background: `linear-gradient(135deg, ${d.luckyColorHex}22, ${d.luckyJewelryHex}22)`,
          border: `1.5px solid ${d.luckyColorHex}55`,
          borderRadius: 20, padding: "18px 20px", marginBottom: 16,
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#7F8C8D", marginBottom: 8 }}>今日能量</div>
          <p style={{ margin: "0 0 14px", color: "#2C3E50", fontSize: 15, lineHeight: 1.7 }}>{d.mood}</p>
          <div style={{ display: "flex", gap: 20 }}>
            <div>
              <span style={{ fontSize: 12, color: "#27AE60", fontWeight: 700, background: "#EAFAF1", borderRadius: 8, padding: "2px 8px" }}>✅ 建议</span>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#2C3E50" }}>{d.advice}</p>
            </div>
            <div>
              <span style={{ fontSize: 12, color: "#E74C3C", fontWeight: 700, background: "#FDEDEC", borderRadius: 8, padding: "2px 8px" }}>⚠️ 避免</span>
              <p style={{ margin: "4px 0 0", fontSize: 13, color: "#2C3E50" }}>{d.avoid}</p>
            </div>
          </div>
        </div>

        {/* Lucky Elements */}
        <div style={{ background: "rgba(255,255,255,0.8)", borderRadius: 20, padding: "16px 20px", marginBottom: 16, backdropFilter: "blur(8px)" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#7F8C8D", marginBottom: 12 }}>幸运元素</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
            {[
              { icon: "🎨", label: "幸运色", val: d.luckyColor, color: d.luckyColorHex },
              { icon: "💎", label: "幸运配饰", val: d.luckyJewelry, color: d.luckyJewelryHex },
              { icon: "⏰", label: "幸运时辰", val: d.luckyTime },
              { icon: "🧭", label: "幸运方位", val: d.luckyDirection },
              { icon: "🔢", label: "幸运数字", val: d.luckyNumbers?.join("、") },
              { icon: "🍜", label: "幸运食物", val: d.luckyFood },
              { icon: "🎯", label: "随身物", val: d.luckyItem },
              { icon: "🌸", label: "幸运花", val: d.luckyFlower },
            ].map((item) => (
              <div key={item.label} style={{ textAlign: "center" }}>
                <div style={{
                  width: 44, height: 44, borderRadius: 14,
                  background: item.color ? `${item.color}33` : "#F0F0F0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 20, margin: "0 auto 4px",
                  border: item.color ? `1.5px solid ${item.color}66` : "none",
                }}>
                  {item.color ? <span style={{ width: 20, height: 20, borderRadius: "50%", background: item.color, display: "block" }} /> : item.icon}
                </div>
                <div style={{ fontSize: 11, color: "#95A5A6", marginBottom: 2 }}>{item.label}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: "#2C3E50" }}>{item.val || "—"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Outfit Suggestion */}
        <div style={{ background: "rgba(255,255,255,0.8)", borderRadius: 20, padding: "16px 20px", marginBottom: 16, backdropFilter: "blur(8px)" }}>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
            <span style={colorStyle} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#7F8C8D" }}>今日穿搭建议（幸运色：{d.luckyColor}）</span>
          </div>
          <p style={{ fontSize: 13, color: "#7F8C8D", marginBottom: 12, fontStyle: "italic" }}>{outfit.desc}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              ["👚", "上装", outfit.top],
              ["👖", "下装", outfit.bottom],
              ["👟", "鞋子", outfit.shoes],
              ["👜", "包包", outfit.bag],
            ].map(([icon, label, val]) => (
              <div key={label} style={{ background: `${d.luckyColorHex}15`, borderRadius: 12, padding: "10px 12px" }}>
                <div style={{ fontSize: 13, marginBottom: 2 }}>{icon} <span style={{ fontWeight: 700, color: "#5B8DB8" }}>{label}</span></div>
                <div style={{ fontSize: 12, color: "#2C3E50" }}>{val}</div>
              </div>
            ))}
          </div>
          {/* Jewelry highlight */}
          <div style={{ marginTop: 10, background: `${d.luckyJewelryHex}20`, borderRadius: 12, padding: "10px 12px", border: `1px solid ${d.luckyJewelryHex}44` }}>
            <span style={{ fontSize: 13 }}>💎 </span>
            <span style={{ fontWeight: 700, color: "#5B8DB8", fontSize: 13 }}>幸运首饰：</span>
            <span style={{ fontSize: 13, color: "#2C3E50" }}>{d.luckyJewelry}色系戒指 / 耳环 / 手链，三选一即可</span>
          </div>
        </div>

        {/* Schedule */}
        <div style={{ background: "rgba(255,255,255,0.8)", borderRadius: 20, padding: "16px 20px", backdropFilter: "blur(8px)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#7F8C8D" }}>📅 今日日程（可编辑）</span>
            <span style={{ fontSize: 11, color: "#BDC3C7" }}>拖动排序 / 点击编辑</span>
          </div>

          {schedule.map((item, idx) => {
            const cat = CATEGORY_COLORS[item.category] || CATEGORY_COLORS.work;
            const isEditing = editingId === item.id;
            return (
              <div key={item.id} style={{
                background: isEditing ? "#FFFDE7" : cat.bg,
                borderRadius: 14, padding: "12px 14px", marginBottom: 10,
                border: isEditing ? "2px solid #F5A623" : "1.5px solid transparent",
                transition: "all 0.2s",
              }}>
                {isEditing ? (
                  <div>
                    <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                      <input value={editTime} onChange={e => setEditTime(e.target.value)}
                        placeholder="时间" style={{ width: 70, borderRadius: 8, border: "1px solid #F5A623", padding: "6px 8px", fontSize: 13 }} />
                      <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                        style={{ flex: 1, borderRadius: 8, border: "1px solid #F5A623", padding: "6px 8px", fontSize: 13 }} />
                    </div>
                    <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)}
                      rows={2} style={{ width: "100%", borderRadius: 8, border: "1px solid #F5A623", padding: "6px 8px", fontSize: 12, resize: "none", boxSizing: "border-box", marginBottom: 8 }} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={saveEdit} style={{ flex: 1, padding: "7px", borderRadius: 8, border: "none", background: "#F5A623", color: "white", fontWeight: 700, cursor: "pointer", fontSize: 13 }}>保存</button>
                      <button onClick={() => setEditingId(null)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #E0E0E0", background: "white", cursor: "pointer", fontSize: 13 }}>取消</button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <div style={{ minWidth: 44, textAlign: "center" }}>
                      <div style={{ fontSize: 18 }}>{item.emoji}</div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: cat.dot }}>{item.time}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: "#2C3E50", fontSize: 14, marginBottom: 2 }}>{item.title}</div>
                      <div style={{ fontSize: 12, color: "#7F8C8D", lineHeight: 1.5 }}>{item.desc}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "center" }}>
                      <button onClick={() => moveUp(idx)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#BDC3C7", padding: "2px 4px" }}>↑</button>
                      <button onClick={() => startEdit(item)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#5B8DB8", padding: "2px 4px" }}>✎</button>
                      <button onClick={() => moveDown(idx)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 14, color: "#BDC3C7", padding: "2px 4px" }}>↓</button>
                      <button onClick={() => deleteItem(item.id)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#E74C3C", padding: "2px 4px" }}>✕</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Export Button */}
          <button onClick={exportToCalendar} style={{
            width: "100%", marginTop: 8, padding: "14px",
            background: "linear-gradient(135deg, #7DD8C6 0%, #5B8DB8 100%)",
            color: "white", border: "none", borderRadius: 14,
            fontSize: 16, fontWeight: 800, cursor: "pointer",
            boxShadow: "0 4px 20px rgba(91,141,184,0.35)",
            letterSpacing: "0.5px",
          }}>
            📅 一键导入系统日历
          </button>
          <p style={{ textAlign: "center", fontSize: 11, color: "#BDC3C7", marginTop: 8 }}>
            导出 .ics 文件，支持 iPhone / Google / Outlook 日历
          </p>
        </div>
      </div>
    </div>
  );
}
