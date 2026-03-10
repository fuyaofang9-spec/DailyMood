import { useState, useRef, useEffect } from "react";

// ── 常量 ──────────────────────────────────────────────────────────────────────
const MOCK_DATA = {
  mood:"今天你同理心非常强，会乐于助人，而你所释放出的善意，最终也会回馈给你，是价值感满满的一天。",
  advice:"及时回馈、见想见的人", avoid:"弯腰驼背、不懂珍惜",
  luckyColor:"碧青", luckyColorHex:"#7DD8C6",
  luckyJewelry:"祖母绿", luckyJewelryHex:"#50C878",
  luckyTime:"17-19点", luckyDirection:"正西",
  luckyNumbers:["1","2"], luckyFood:"烤冷面",
  luckyItem:"解压玩具", luckyFlower:"勿忘我",
};

const WEATHER_CODES = {
  0:"晴天",1:"晴转多云",2:"多云",3:"阴天",45:"雾",48:"浓雾",
  51:"小毛毛雨",53:"毛毛雨",55:"大毛毛雨",61:"小雨",63:"中雨",65:"大雨",
  71:"小雪",73:"中雪",75:"大雪",80:"阵雨",81:"中阵雨",82:"强阵雨",
  85:"阵雪",86:"强阵雪",95:"雷雨",96:"雷雨伴冰雹",99:"强雷雨",
};
const WMO_EMOJI = c => c===0?"☀️":c<=2?"⛅":c<=3?"☁️":c<=48?"🌫️":c<=67?"🌧️":c<=77?"❄️":c<=82?"🌦️":"⛈️";

function getSeason(month, lat) {
  const n = lat >= 0;
  if ([12,1,2].includes(month))  return n?"冬季":"夏季";
  if ([3,4,5].includes(month))   return n?"春季":"秋季";
  if ([6,7,8].includes(month))   return n?"夏季":"冬季";
  return n?"秋季":"春季";
}

// 幸运方位 → 搜索偏移（粗略）
const DIR_OFFSET = {
  "正东":{dlat:0,dlon:0.01},"正西":{dlat:0,dlon:-0.01},
  "正南":{dlat:-0.01,dlon:0},"正北":{dlat:0.01,dlon:0},
  "东南":{dlat:-0.007,dlon:0.007},"西南":{dlat:-0.007,dlon:-0.007},
  "东北":{dlat:0.007,dlon:0.007},"西北":{dlat:0.007,dlon:-0.007},
};

function parseTimeRange(str="") {
  const m = str.match(/(\d+)[^\d]+(\d+)/);
  return m?{start:parseInt(m[1]),end:parseInt(m[2])}:{start:17,end:19};
}

function isWeekend() {
  const d = new Date().getDay();
  return d===0||d===6;
}

function buildSchedule(d) {
  const {start,end} = parseTimeRange(d.luckyTime);
  const mid = Math.floor((start+end)/2);
  return [
    {id:1, time:"07:30", emoji:"🌅", title:"晨间启动",               desc:`穿上${d.luckyColor}色系穿搭，拍一张镜子自拍，开启好运频道`, cat:"morning"},
    {id:2, time:"08:00", emoji:"💎", title:"佩戴幸运饰品",            desc:`今日幸运配饰：${d.luckyJewelry}色系首饰，戴上它出门能量满满`, cat:"morning"},
    {id:3, time:"09:00", emoji:"📋", title:"整理今日优先事项",         desc:"同理心强的你，今日适合处理需要倾听与沟通的任务", cat:"work"},
    {id:4, time:"12:00", emoji:"🍜", title:`午餐：${d.luckyFood}`,    desc:`今日幸运食物「${d.luckyFood}」，附近推荐正在加载...`, cat:"meal", linkedPOI:"food"},
    {id:5, time:"14:00", emoji:"🤝", title:"联系一位想念的人",         desc:"今日建议「见想见的人」，发一条消息或打个电话", cat:"social"},
    {id:6, time:`${start}:00`, emoji:"⭐", title:`黄金时辰 ${d.luckyTime}`, desc:"今天能量最强的时段，适合做重要决定或谈重要的事", cat:"peak"},
    {id:7, time:`${mid}:30`,   emoji:"🧭", title:`朝${d.luckyDirection}散步`, desc:`朝「${d.luckyDirection}」方向，推荐地点加载中...`, cat:"activity", linkedPOI:"walk"},
    {id:8, time:"19:30", emoji:"🌸", title:`${d.luckyFlower}能量`,    desc:`可以买一束${d.luckyFlower}，或搜索花语感受今日花卉能量`, cat:"evening"},
    {id:9, time:"21:00", emoji:"🎯", title:`玩${d.luckyItem}放松`,    desc:`今日幸运随身物「${d.luckyItem}」，晚间解压好选择`, cat:"evening"},
    {id:10,time:"22:30", emoji:"📖", title:"今日复盘",                desc:"记录今天做了哪些善意的事，感恩日记写一条", cat:"night"},
  ];
}

const CAT = {
  morning:{bg:"#FFF9E6",dot:"#F5A623"}, work:{bg:"#EBF4FF",dot:"#4A90D9"},
  meal:{bg:"#FFF0E6",dot:"#FF6B35"},    social:{bg:"#F0FFF4",dot:"#2ECC71"},
  peak:{bg:"#FFF0FF",dot:"#9B59B6"},    activity:{bg:"#E6FFFA",dot:"#1ABC9C"},
  evening:{bg:"#FFF5F5",dot:"#E74C3C"}, night:{bg:"#F0F0FF",dot:"#5B5EA6"},
};

const FORM_FIELDS = [
  ["mood","今日运势描述","textarea"],["advice","建议","text"],["avoid","避免","text"],
  ["luckyColor","幸运颜色（如：碧青）","text"],["luckyColorHex","幸运颜色色码","color"],
  ["luckyJewelry","幸运配饰（如：祖母绿）","text"],
  ["luckyTime","幸运时辰（如：17-19点）","text"],["luckyDirection","幸运方位（如：正西）","text"],
  ["luckyNumbers","幸运数字（逗号分隔）","text"],["luckyFood","幸运食物","text"],
  ["luckyItem","幸运随身物","text"],["luckyFlower","幸运花","text"],
];

const BG   = "linear-gradient(135deg,#E0F7F4 0%,#EBF4FF 55%,#FFF0FF 100%)";
const FONT = "'PingFang SC','Hiragino Sans GB',sans-serif";
const EMPTY_FORM = {mood:"",advice:"",avoid:"",luckyColor:"",luckyColorHex:"#7DD8C6",luckyJewelry:"",luckyJewelryHex:"#50C878",luckyTime:"",luckyDirection:"",luckyNumbers:"",luckyFood:"",luckyItem:"",luckyFlower:""};

const DEFAULT_PROFILE = {
  workName:"", workLat:"", workLon:"",
  homeName:"", homeLat:"", homeLon:"",
};

// ── API helpers ───────────────────────────────────────────────────────────────
async function callClaude(messages, max_tokens=1200) {
  const res = await fetch("/api/claude", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens,messages}),
  });
  if(!res.ok) {
    const err = await res.json().catch(()=>({}));
    throw new Error(`Claude API ${res.status}: ${err.error?.message || JSON.stringify(err)}`);
  }
  const j = await res.json();
  return (j.content||[]).map(b=>b.text||"").join("").trim();
}

// Compress image to JPEG under 1MB before sending to API
async function compressImage(file, maxSizeKB=900) {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      let {width, height} = img;
      // Scale down if too large
      const maxDim = 1200;
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(maxDim/width, maxDim/height);
        width = Math.round(width * ratio);
        height = Math.round(height * ratio);
      }
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      // Try quality 0.85 first, then reduce if needed
      let quality = 0.85;
      const tryCompress = () => {
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        const base64 = dataUrl.split(",")[1];
        const sizeKB = (base64.length * 3/4) / 1024;
        if (sizeKB > maxSizeKB && quality > 0.3) {
          quality -= 0.15;
          tryCompress();
        } else {
          resolve({ base64, mimeType: "image/jpeg" });
        }
      };
      tryCompress();
    };
    img.onerror = () => {
      // fallback: read raw
      const reader = new FileReader();
      reader.onload = () => resolve({ base64: reader.result.split(",")[1], mimeType: file.type || "image/jpeg" });
      reader.readAsDataURL(file);
    };
    img.src = url;
  });
}

async function parseImageWithAI(file) {
  const { base64, mimeType } = await compressImage(file);
  const text = await callClaude([{role:"user",content:[
    {type:"image",source:{type:"base64",media_type:mimeType,data:base64}},
    {type:"text",text:`分析这张测测APP截图，提取所有幸运元素。只返回JSON，无其他文字：
{"mood":"运势描述","advice":"建议","avoid":"避免","luckyColor":"颜色名","luckyColorHex":"#hex","luckyJewelry":"配饰名","luckyJewelryHex":"#hex","luckyTime":"17-19点","luckyDirection":"正西","luckyNumbers":"1,2","luckyFood":"食物","luckyItem":"随身物","luckyFlower":"花名"}`}
  ]}]);
  const clean = text.replace(/^```[a-z]*\n?/i,"").replace(/```$/,"").trim();
  return JSON.parse(clean);
}

async function fetchWeather(lat,lon) {
  const url=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weathercode,windspeed_10m,relativehumidity_2m&daily=temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=1`;
  const res=await fetch(url); if(!res.ok) throw new Error("天气获取失败");
  const j=await res.json();
  return {
    temp:Math.round(j.current.temperature_2m),
    tempMax:Math.round(j.daily.temperature_2m_max[0]),
    tempMin:Math.round(j.daily.temperature_2m_min[0]),
    code:j.current.weathercode,
    desc:WEATHER_CODES[j.current.weathercode]||"未知",
    emoji:WMO_EMOJI(j.current.weathercode),
    humidity:j.current.relativehumidity_2m,
    wind:Math.round(j.current.windspeed_10m),
  };
}

async function fetchCityName(lat,lon) {
  try {
    const res=await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=zh`);
    const j=await res.json();
    return j.address?.city||j.address?.town||j.address?.county||j.address?.state||"当前位置";
  } catch { return "当前位置"; }
}

// 地理编码：地址 → 坐标
async function geocodeAddress(address) {
  const url=`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
  const res=await fetch(url);
  const j=await res.json();
  if(!j||!j[0]) throw new Error("找不到地址");
  return {lat:parseFloat(j[0].lat),lon:parseFloat(j[0].lon),displayName:j[0].display_name};
}

// Overpass：搜索附近 POI，带备用镜像和扩大范围
const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

async function searchNearby(lat, lon, type) {
  const foodRadius = 1500;
  const walkRadius = 2000;
  let query="";
  if(type==="food") {
    query=`[out:json][timeout:15];(node["amenity"~"restaurant|cafe|fast_food|food_court|bar|pub"](around:${foodRadius},${lat},${lon}););out 12;`;
  } else if(type==="walk") {
    query=`[out:json][timeout:15];(node["leisure"~"park|garden|playground|nature_reserve"](around:${walkRadius},${lat},${lon});way["leisure"~"park|garden|nature_reserve"](around:${walkRadius},${lat},${lon});relation["leisure"="park"](around:${walkRadius},${lat},${lon}););out center 8;`;
  }
  // Try mirrors in sequence
  for (const mirror of OVERPASS_MIRRORS) {
    try {
      const res = await fetch(mirror, {
        method:"POST", body:query,
        signal: AbortSignal.timeout(12000),
      });
      if(!res.ok) continue;
      const j = await res.json();
      const results = (j.elements||[]).filter(e=>e.tags&&e.tags.name).map(e=>({
        id:e.id,
        name:e.tags.name,
        nameEn:e.tags["name:en"]||"",
        type:e.tags.amenity||e.tags.leisure||"",
        lat:e.lat||(e.center&&e.center.lat)||lat,
        lon:e.lon||(e.center&&e.center.lon)||lon,
        cuisine:e.tags.cuisine||"",
        opening:e.tags.opening_hours||"",
      }));
      if(results.length > 0) return results;
    } catch(e) {
      continue;
    }
  }
  return [];
}

async function generateOutfitWithAI(luckyData, weatherInfo, season, cityName) {
  const isRainy=weatherInfo.code>=51, isCold=weatherInfo.temp<10, isHot=weatherInfo.temp>28;
  const prompt=`你是时尚造型师。根据以下信息生成今日穿搭，只返回JSON：
幸运色：${luckyData.luckyColor}(${luckyData.luckyColorHex})，幸运配饰：${luckyData.luckyJewelry}
城市：${cityName}，季节：${season}，气温：${weatherInfo.temp}°C(${weatherInfo.tempMin}~${weatherInfo.tempMax})，天气：${weatherInfo.desc}
要求：1.融入幸运色 2.符合${season}${weatherInfo.temp}°C ${isRainy?"下雨需防水":""} ${isCold?"注意保暖":isHot?"注意透气":""} 3.每项给2个选择用"/"分隔
{"desc":"一句话风格说明","top":"上装","bottom":"下装","shoes":"鞋子","bag":"包包","extra":"天气特别提示","jewelry":"首饰建议"}`;
  const text=await callClaude([{role:"user",content:prompt}]);
  const clean=text.replace(/^```[a-z]*\n?/i,"").replace(/```$/,"").trim();
  return JSON.parse(clean);
}

// AI 根据幸运食物匹配最相关的餐厅
async function matchFoodWithAI(luckyFood, places) {
  if(!places.length) return null;
  const list=places.map((p,i)=>`${i+1}. ${p.name}${p.cuisine?" ("+p.cuisine+")":""}`).join("\n");
  const text=await callClaude([{role:"user",content:`今日幸运食物是「${luckyFood}」。以下是附近餐厅列表，请选出最匹配或最相关的1-2家，说明推荐理由（一句话）。只返回JSON：
餐厅列表：
${list}
返回格式：{"picks":[{"index":序号,"reason":"推荐理由"}]}`}]);
  const clean=text.replace(/^```[a-z]*\n?/i,"").replace(/```$/,"").trim();
  const parsed=JSON.parse(clean);
  return parsed.picks.map(p=>({...places[p.index-1],reason:p.reason})).filter(Boolean);
}

// AI 根据幸运方位推荐散步地点
async function matchWalkWithAI(luckyDirection, places) {
  if(!places.length) return null;
  const list=places.map((p,i)=>`${i+1}. ${p.name}`).join("\n");
  const text=await callClaude([{role:"user",content:`今日幸运方位是「${luckyDirection}」。以下是附近公园/绿地列表，请选出1-2个最推荐散步的地点，说明推荐理由（一句话）。只返回JSON：
地点列表：
${list}
返回格式：{"picks":[{"index":序号,"reason":"推荐理由"}]}`}]);
  const clean=text.replace(/^```[a-z]*\n?/i,"").replace(/```$/,"").trim();
  const parsed=JSON.parse(clean);
  return parsed.picks.map(p=>({...places[p.index-1],reason:p.reason})).filter(Boolean);
}

function Spinner({size=18,color="#5B8DB8"}) {
  return <span style={{display:"inline-block",width:size,height:size,border:`2px solid ${color}33`,borderTop:`2px solid ${color}`,borderRadius:"50%",animation:"spin .7s linear infinite",flexShrink:0}}/>;
}

function POICard({poi, color, icon}) {
  if(!poi) return null;
  const mapUrl=`https://www.openstreetmap.org/?mlat=${poi.lat}&mlon=${poi.lon}&zoom=17`;
  return (
    <a href={mapUrl} target="_blank" rel="noreferrer" style={{display:"block",textDecoration:"none",background:`${color}15`,border:`1px solid ${color}44`,borderRadius:12,padding:"10px 12px",marginTop:6}}>
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:8}}>
        <div style={{flex:1}}>
          <div style={{fontSize:13,fontWeight:700,color:"#2C3E50"}}>{icon} {poi.name}</div>
          {poi.reason&&<div style={{fontSize:12,color:"#7F8C8D",marginTop:2,lineHeight:1.45}}>{poi.reason}</div>}
          {poi.cuisine&&<div style={{fontSize:11,color:"#95A5A6",marginTop:1}}>🍽 {poi.cuisine}</div>}
          {poi.opening&&<div style={{fontSize:11,color:"#95A5A6"}}>⏰ {poi.opening}</div>}
        </div>
        <span style={{fontSize:11,color:color,fontWeight:700,whiteSpace:"nowrap",marginTop:2}}>地图 →</span>
      </div>
    </a>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [screen,     setScreen]     = useState("home");
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [parsing,    setParsing]    = useState(false);
  const [parseError, setParseError] = useState(null);
  const [dragOver,   setDragOver]   = useState(false);

  // profile
  const [profile,    setProfile]    = useState(DEFAULT_PROFILE);
  const [showProfile,setShowProfile]= useState(false);
  const [profileEdit,setProfileEdit]= useState(DEFAULT_PROFILE);
  const [geocoding,  setGeocoding]  = useState(false);
  const [geoError,   setGeoError]   = useState("");

  // weather & location
  const [locStatus,  setLocStatus]  = useState("idle");
  const [weather,    setWeather]    = useState(null);
  const [cityName,   setCityName]   = useState("");
  const [season,     setSeason]     = useState("");
  const [coords,     setCoords]     = useState(null);

  // result
  const [data,        setData]        = useState(null);
  const [schedule,    setSchedule]    = useState([]);
  const [outfit,      setOutfit]      = useState(null);
  const [outfitLoading,setOutfitLoading]=useState(false);
  const [outfitError, setOutfitError] = useState(null);
  const [foodPOIs,    setFoodPOIs]    = useState(null);
  const [walkPOIs,    setWalkPOIs]    = useState(null);
  const [poisLoading, setPoisLoading] = useState(false);

  // schedule editing
  const [editId,    setEditId]    = useState(null);
  const [editTime,  setEditTime]  = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDesc,  setEditDesc]  = useState("");
  const [exportMsg, setExportMsg] = useState("");

  const fileRef = useRef();

  useEffect(()=>{ fetchLocation(); },[]);

  // load profile from sessionStorage
  useEffect(()=>{
    try {
      const saved=sessionStorage.getItem("luckyProfile");
      if(saved){const p=JSON.parse(saved);setProfile(p);setProfileEdit(p);}
    } catch{}
  },[]);

  function saveProfile() {
    setProfile(profileEdit);
    try{ sessionStorage.setItem("luckyProfile",JSON.stringify(profileEdit)); }catch{}
    setShowProfile(false);
  }

  async function geocodeAndSave(type) {
    const addr = type==="work" ? profileEdit.workName : profileEdit.homeName;
    if(!addr) return;
    setGeocoding(true); setGeoError("");
    try {
      const {lat,lon} = await geocodeAddress(addr);
      if(type==="work") setProfileEdit(p=>({...p,workLat:String(lat),workLon:String(lon)}));
      else              setProfileEdit(p=>({...p,homeLat:String(lat),homeLon:String(lon)}));
    } catch(e) { setGeoError(`无法找到「${addr}」，请换个描述`); }
    setGeocoding(false);
  }

  function fetchLocation() {
    if(!navigator.geolocation){setLocStatus("error");return;}
    setLocStatus("loading");
    navigator.geolocation.getCurrentPosition(async pos=>{
      const {latitude:lat,longitude:lon}=pos.coords;
      setCoords({lat,lon});
      try {
        const [w,city]=await Promise.all([fetchWeather(lat,lon),fetchCityName(lat,lon)]);
        const s=getSeason(new Date().getMonth()+1,lat);
        setWeather(w); setCityName(city); setSeason(s); setLocStatus("done");
      } catch { setLocStatus("error"); }
    },()=>setLocStatus("error"),{timeout:8000});
  }

  // 决定当前用哪个坐标（工作日→公司，休息日→家，fallback→GPS）
  function getActiveCoords() {
    const weekend = isWeekend();
    if(weekend && profile.homeLat && profile.homeLon)
      return {lat:parseFloat(profile.homeLat),lon:parseFloat(profile.homeLon),label:profile.homeName||"家"};
    if(!weekend && profile.workLat && profile.workLon)
      return {lat:parseFloat(profile.workLat),lon:parseFloat(profile.workLon),label:profile.workName||"公司"};
    if(coords) return {lat:coords.lat,lon:coords.lon,label:cityName};
    return null;
  }

  function setField(k,v){setForm(f=>({...f,[k]:v}));}

  async function handleFile(file) {
    if(!file) return;
    setPreviewUrl(URL.createObjectURL(file));
    setParseError(null); setParsing(true); setScreen("form");
    try {
      const parsed=await parseImageWithAI(file);
      const nums=Array.isArray(parsed.luckyNumbers)?parsed.luckyNumbers.join(","):(parsed.luckyNumbers||"");
      setForm({
        mood:parsed.mood||"",advice:parsed.advice||"",avoid:parsed.avoid||"",
        luckyColor:parsed.luckyColor||"",luckyColorHex:parsed.luckyColorHex||"#7DD8C6",
        luckyJewelry:parsed.luckyJewelry||"",luckyJewelryHex:parsed.luckyJewelryHex||"#50C878",
        luckyTime:parsed.luckyTime||"",luckyDirection:parsed.luckyDirection||"",
        luckyNumbers:nums,luckyFood:parsed.luckyFood||"",
        luckyItem:parsed.luckyItem||"",luckyFlower:parsed.luckyFlower||"",
      });
    } catch(e) { setParseError("截图识别失败——请手动填写（"+e.message+"）"); }
    setParsing(false);
  }

  function handleUseMock(){goResult({...MOCK_DATA});}

  function handleSubmit(){
    const nums=form.luckyNumbers.split(/[,，\s]+/).filter(Boolean);
    const merged={...MOCK_DATA};
    Object.entries(form).forEach(([k,v])=>{if(v!=="")merged[k]=v;});
    merged.luckyNumbers=nums.length?nums:MOCK_DATA.luckyNumbers;
    goResult(merged);
  }

  async function goResult(d) {
    setData(d); setSchedule(buildSchedule(d));
    setOutfit(null); setOutfitError(null);
    setFoodPOIs(null); setWalkPOIs(null);
    setScreen("result");

    const activeCoords = getActiveCoords();
    let w=weather, city=cityName, s=season;

    // fetch weather for active location if different from GPS
    if(activeCoords && (!w || (activeCoords.lat!==coords?.lat))) {
      try {
        [w,city]=await Promise.all([
          fetchWeather(activeCoords.lat,activeCoords.lon),
          fetchCityName(activeCoords.lat,activeCoords.lon),
        ]);
        s=getSeason(new Date().getMonth()+1,activeCoords.lat);
        setWeather(w); setCityName(activeCoords.label||city); setSeason(s);
      } catch{}
    }

    // outfit
    setOutfitLoading(true);
    try {
      if(w){
        const o=await generateOutfitWithAI(d,w,s,activeCoords?.label||city||"");
        setOutfit(o);
      } else {
        setOutfitError("未获取到天气，显示通用穿搭建议");
        setOutfit({desc:`融入幸运色「${d.luckyColor}」的今日穿搭`,top:"同色系上衣 / 基础款白T",bottom:"直筒裤 / 简约半裙",shoes:"小白鞋 / 乐福鞋",bag:"帆布包 / 手提包",extra:"请按实际天气增减",jewelry:`${d.luckyJewelry}色系首饰`});
      }
    } catch(e) {
      setOutfitError("穿搭生成失败："+e.message);
      setOutfit({desc:`融入幸运色「${d.luckyColor}」的今日穿搭`,top:"同色系上衣 / 基础款白T",bottom:"直筒裤 / 简约半裙",shoes:"小白鞋 / 乐福鞋",bag:"帆布包 / 手提包",extra:"请按实际天气增减",jewelry:`${d.luckyJewelry}色系首饰`});
    }
    setOutfitLoading(false);

    // POI search
    if(activeCoords) {
      setPoisLoading(true);
      try {
        const dirOffset = DIR_OFFSET[d.luckyDirection]||{dlat:0,dlon:0};
        const walkLat = activeCoords.lat + dirOffset.dlat;
        const walkLon = activeCoords.lon + dirOffset.dlon;

        const [foodRaw, walkRaw] = await Promise.all([
          searchNearby(activeCoords.lat, activeCoords.lon, "food", 800),
          searchNearby(walkLat, walkLon, "walk", 1200),
        ]);

        // AI matching in parallel
        const [foodMatched, walkMatched] = await Promise.all([
          foodRaw.length ? matchFoodWithAI(d.luckyFood, foodRaw) : Promise.resolve([]),
          walkRaw.length ? matchWalkWithAI(d.luckyDirection, walkRaw) : Promise.resolve([]),
        ]);

        setFoodPOIs(foodMatched);
        setWalkPOIs(walkMatched);

        // update schedule descriptions
        setSchedule(prev => prev.map(item => {
          if(item.linkedPOI==="food" && foodMatched&&foodMatched.length) {
            const names = foodMatched.map(p=>p.name).join("、");
            return {...item, desc:`今日幸运食物「${d.luckyFood}」— 附近推荐：${names}`};
          }
          if(item.linkedPOI==="walk" && walkMatched&&walkMatched.length) {
            const names = walkMatched.map(p=>p.name).join("、");
            return {...item, desc:`朝「${d.luckyDirection}」方向，推荐前往：${names}`};
          }
          return item;
        }));
      } catch(e) { console.error("POI search error",e); }
      setPoisLoading(false);
    }
  }

  function saveEdit(){
    setSchedule(s=>s.map(i=>i.id===editId?{...i,time:editTime,title:editTitle,desc:editDesc}:i));
    setEditId(null);
  }

  function exportICS(){
    const ds=new Date().toISOString().slice(0,10).replace(/-/g,"");
    const pad=n=>String(n).padStart(2,"0");
    let ics="BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//LuckyDay//CN\r\n";
    schedule.forEach((item,i)=>{
      const [h,m]=item.time.split(":").map(Number);
      const sd=item.desc.replace(/[\r\n]/g," ");
      ics+=`BEGIN:VEVENT\r\nUID:lucky-${i}-${ds}\r\nSUMMARY:${item.emoji} ${item.title}\r\nDESCRIPTION:${sd}\r\nDTSTART:${ds}T${pad(h)}${pad(m)}00\r\nDTEND:${ds}T${pad(Math.min(h+1,23))}${pad(m)}00\r\nEND:VEVENT\r\n`;
    });
    ics+="END:VCALENDAR";
    const a=document.createElement("a");
    a.href="data:text/calendar;charset=utf-8,"+encodeURIComponent(ics);
    a.download=`lucky-${ds}.ics`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setExportMsg("✅ 已下载 .ics，双击导入系统日历");
    setTimeout(()=>setExportMsg(""),5000);
  }

  function LocationBadge() {
    const ac = getActiveCoords();
    const label = ac?.label || "";
    if(locStatus==="loading") return <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#5B8DB8",background:"rgba(91,141,184,.1)",borderRadius:20,padding:"5px 12px"}}><Spinner size={12}/> 获取位置中...</div>;
    if(weather&&locStatus==="done") return <div style={{display:"flex",alignItems:"center",gap:6,fontSize:12,color:"#27AE60",background:"rgba(39,174,96,.1)",borderRadius:20,padding:"5px 12px"}}>{weather.emoji} {label||cityName} · {weather.temp}°C · {weather.desc}</div>;
    if(locStatus==="error") return <button onClick={fetchLocation} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#E67E22",background:"rgba(230,126,34,.1)",borderRadius:20,padding:"5px 12px",border:"none",cursor:"pointer"}}>📍 点击授权位置</button>;
    return <button onClick={fetchLocation} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#95A5A6",background:"rgba(0,0,0,.05)",borderRadius:20,padding:"5px 12px",border:"none",cursor:"pointer"}}>📍 获取位置天气</button>;
  }

  // ── PROFILE MODAL ─────────────────────────────────────────────────────────
  function ProfileModal() {
    return (
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:200,display:"flex",alignItems:"flex-end",justifyContent:"center"}} onClick={()=>setShowProfile(false)}>
        <div style={{background:"white",borderRadius:"24px 24px 0 0",width:"100%",maxWidth:520,padding:"24px 20px 36px",maxHeight:"85vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
            <h2 style={{margin:0,fontSize:18,fontWeight:800,color:"#2C3E50"}}>📍 我的位置设置</h2>
            <button onClick={()=>setShowProfile(false)} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#95A5A6"}}>✕</button>
          </div>
          <p style={{fontSize:13,color:"#7F8C8D",margin:"0 0 20px",lineHeight:1.6}}>
            设置后，工作日将使用公司坐标推荐附近美食和散步地点，休息日使用家的坐标。<br/>
            今天是<strong style={{color:"#5B8DB8"}}>{isWeekend()?"休息日":"工作日"}</strong>。
          </p>

          {geoError&&<div style={{background:"#FFF3E0",borderRadius:10,padding:"8px 12px",fontSize:13,color:"#E67E22",marginBottom:12}}>⚠️ {geoError}</div>}

          {[
            {type:"work",icon:"🏢",label:"公司/工作地点",namKey:"workName",latKey:"workLat",lonKey:"workLon"},
            {type:"home",icon:"🏠",label:"家/居住地点",  namKey:"homeName",latKey:"homeLat",lonKey:"homeLon"},
          ].map(({type,icon,label,namKey,latKey,lonKey})=>(
            <div key={type} style={{marginBottom:20,background:"#F8FBFF",borderRadius:14,padding:"14px 16px"}}>
              <div style={{fontWeight:700,color:"#2C3E50",fontSize:14,marginBottom:10}}>{icon} {label}</div>
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                <input
                  value={profileEdit[namKey]}
                  onChange={e=>setProfileEdit(p=>({...p,[namKey]:e.target.value}))}
                  placeholder={type==="work"?"例：北京市朝阳区望京SOHO":"例：上海市静安区南京西路"}
                  style={{flex:1,borderRadius:10,border:"1.5px solid #D5E8E4",padding:"8px 12px",fontSize:13,outline:"none"}}
                />
                <button onClick={()=>geocodeAndSave(type)} disabled={geocoding||!profileEdit[namKey]}
                  style={{padding:"8px 14px",borderRadius:10,border:"none",background:profileEdit[namKey]?"linear-gradient(135deg,#7DD8C6,#5B8DB8)":"#E0E0E0",color:"white",fontWeight:700,cursor:profileEdit[namKey]?"pointer":"not-allowed",fontSize:13,whiteSpace:"nowrap"}}>
                  {geocoding?"定位中...":"📍 定位"}
                </button>
              </div>
              {profileEdit[latKey]&&profileEdit[lonKey]&&(
                <div style={{fontSize:12,color:"#27AE60",display:"flex",alignItems:"center",gap:4}}>
                  <span>✅</span>
                  <span>已定位：{parseFloat(profileEdit[latKey]).toFixed(4)}, {parseFloat(profileEdit[lonKey]).toFixed(4)}</span>
                  <a href={`https://www.openstreetmap.org/?mlat=${profileEdit[latKey]}&mlon=${profileEdit[lonKey]}&zoom=16`} target="_blank" rel="noreferrer" style={{color:"#5B8DB8",marginLeft:4}}>查看地图 →</a>
                </div>
              )}
            </div>
          ))}

          <button onClick={saveProfile} style={{width:"100%",padding:14,borderRadius:14,border:"none",background:"linear-gradient(135deg,#7DD8C6,#5B8DB8)",color:"white",fontWeight:800,fontSize:16,cursor:"pointer",boxShadow:"0 4px 18px rgba(91,141,184,.3)"}}>
            保存设置 ✓
          </button>
        </div>
      </div>
    );
  }

  // ── HOME ─────────────────────────────────────────────────────────────────────
  if(screen==="home") return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:FONT,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:24}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      {showProfile&&<ProfileModal/>}

      <div style={{fontSize:52,marginBottom:8}}>🌟</div>
      <h1 style={{fontSize:24,fontWeight:800,color:"#2C3E50",margin:"0 0 6px"}}>幸运日程规划师</h1>
      <p style={{color:"#7F8C8D",fontSize:13,margin:"0 0 14px",textAlign:"center"}}>上传测测截图，结合天气和位置，规划专属今日方案</p>

      <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:20,flexWrap:"wrap",justifyContent:"center"}}>
        <LocationBadge/>
        <button onClick={()=>setShowProfile(true)} style={{display:"flex",alignItems:"center",gap:5,fontSize:12,color:"#9B59B6",background:"rgba(155,89,182,.1)",borderRadius:20,padding:"5px 12px",border:"none",cursor:"pointer",fontWeight:600}}>
          {(profile.workLat||profile.homeLat)?"✅":"📍"} 我的位置设置
        </button>
      </div>

      {(profile.workLat||profile.homeLat)&&(
        <div style={{background:"rgba(255,255,255,.75)",borderRadius:14,padding:"10px 16px",marginBottom:16,fontSize:12,color:"#2C3E50",border:"1px solid rgba(125,216,198,.4)",maxWidth:380,width:"100%"}}>
          <span style={{fontWeight:700}}>{isWeekend()?"🏠 今天休息日":"🏢 今天工作日"}</span>
          <span style={{color:"#7F8C8D",marginLeft:6}}>
            将使用 <strong>{isWeekend()?profile.homeName||"家":profile.workName||"公司"}</strong> 推荐附近美食和散步地点
          </span>
        </div>
      )}

      <div style={{width:"100%",maxWidth:380,display:"flex",flexDirection:"column",gap:12}}>
        <div
          onDragOver={e=>{e.preventDefault();setDragOver(true);}}
          onDragLeave={()=>setDragOver(false)}
          onDrop={e=>{e.preventDefault();setDragOver(false);handleFile(e.dataTransfer.files[0]);}}
          onClick={()=>fileRef.current.click()}
          style={{border:`2px dashed ${dragOver?"#7DD8C6":"#B0DDD6"}`,borderRadius:20,padding:"32px 24px",textAlign:"center",cursor:"pointer",background:dragOver?"rgba(125,216,198,.12)":"rgba(255,255,255,.78)",transition:"all .2s"}}
        >
          <div style={{fontSize:36,marginBottom:8}}>📸</div>
          <p style={{fontWeight:700,color:"#2C3E50",fontSize:15,margin:"0 0 4px"}}>上传测测截图</p>
          <p style={{color:"#95A5A6",fontSize:13,margin:"0 0 6px"}}>点击或拖拽图片到此处</p>
          <p style={{color:"#7DD8C6",fontSize:12,fontWeight:600,margin:0}}>✨ AI 自动识别幸运元素</p>
          <input ref={fileRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>handleFile(e.target.files[0])}/>
        </div>
        <button onClick={()=>{setForm(EMPTY_FORM);setPreviewUrl(null);setScreen("form");}} style={{padding:13,borderRadius:14,border:"1.5px solid #B0DDD6",background:"rgba(255,255,255,.85)",color:"#5B8DB8",fontWeight:700,cursor:"pointer",fontSize:14}}>✏️ 手动输入幸运元素</button>
        <button onClick={handleUseMock} style={{padding:13,borderRadius:14,border:"none",background:"linear-gradient(135deg,#7DD8C6,#5B8DB8)",color:"white",fontWeight:800,cursor:"pointer",fontSize:14,boxShadow:"0 4px 16px rgba(91,141,184,.3)"}}>🎯 使用示例数据</button>
      </div>
    </div>
  );

  // ── FORM ─────────────────────────────────────────────────────────────────────
  if(screen==="form") return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:FONT,paddingBottom:90}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{position:"sticky",top:0,zIndex:10,background:"rgba(255,255,255,.92)",backdropFilter:"blur(10px)",padding:"12px 20px",borderBottom:"1px solid rgba(125,216,198,.3)",display:"flex",alignItems:"center",gap:12}}>
        <button onClick={()=>{setScreen("home");setPreviewUrl(null);setForm(EMPTY_FORM);setParsing(false);setParseError(null);}} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#5B8DB8"}}>‹</button>
        <span style={{fontWeight:800,fontSize:17,color:"#2C3E50",flex:1}}>{parsing?"🔮 AI 识别截图中...":"✏️ 幸运元素"}</span>
        {parsing&&<Spinner/>}
      </div>
      <div style={{maxWidth:480,margin:"0 auto",padding:"16px 16px 0"}}>
        {previewUrl&&(
          <div style={{borderRadius:16,overflow:"hidden",marginBottom:16,boxShadow:"0 4px 20px rgba(0,0,0,.1)"}}>
            <img src={previewUrl} alt="截图" style={{width:"100%",maxHeight:300,objectFit:"cover",objectPosition:"top",display:"block"}}/>
            {parsing&&<div style={{background:"linear-gradient(135deg,#EBF4FF,#E0F7F4)",padding:"11px 16px",display:"flex",alignItems:"center",gap:10}}><Spinner size={14}/><span style={{fontSize:13,color:"#5B8DB8",fontWeight:600}}>AI 正在读取截图中的幸运元素...</span></div>}
            {!parsing&&!parseError&&form.luckyColor&&<div style={{background:"rgba(125,216,198,.15)",padding:"9px 16px",fontSize:13,color:"#27AE60",fontWeight:700,textAlign:"center"}}>✅ 识别完成！请确认内容后点击生成</div>}
            {parseError&&<div style={{background:"#FFF3E0",padding:"9px 16px",fontSize:13,color:"#E67E22",fontWeight:600}}>⚠️ {parseError}</div>}
          </div>
        )}
        <div style={{background:"rgba(255,255,255,.88)",borderRadius:20,padding:"20px 20px 16px",opacity:parsing?.5:1,transition:"opacity .3s"}}>
          {FORM_FIELDS.map(([key,label,type])=>(
            <div key={key} style={{marginBottom:14}}>
              <label style={{fontSize:13,color:"#7F8C8D",display:"block",marginBottom:4}}>{label}</label>
              {type==="textarea"
                ?<textarea value={form[key]} onChange={e=>setField(key,e.target.value)} disabled={parsing} rows={3} style={{width:"100%",borderRadius:10,border:`1.5px solid ${form[key]?"#7DD8C6":"#D5E8E4"}`,padding:"8px 12px",fontSize:14,resize:"none",boxSizing:"border-box",outline:"none",background:form[key]?"#F0FFFC":"white"}}/>
                :<input type={type} value={form[key]} onChange={e=>setField(key,e.target.value)} disabled={parsing} style={{width:"100%",borderRadius:10,border:`1.5px solid ${(form[key]&&type!=="color")?"#7DD8C6":"#D5E8E4"}`,padding:"8px 12px",fontSize:14,boxSizing:"border-box",outline:"none",background:(form[key]&&type!=="color")?"#F0FFFC":"white"}}/>
              }
            </div>
          ))}
        </div>
      </div>
      <div style={{position:"fixed",bottom:0,left:0,right:0,padding:"12px 16px 20px",background:"rgba(255,255,255,.93)",backdropFilter:"blur(10px)",borderTop:"1px solid rgba(125,216,198,.3)"}}>
        <div style={{maxWidth:480,margin:"0 auto"}}>
          <button onClick={handleSubmit} disabled={parsing} style={{width:"100%",padding:14,borderRadius:14,border:"none",background:parsing?"#BDC3C7":"linear-gradient(135deg,#7DD8C6,#5B8DB8)",color:"white",fontWeight:800,fontSize:16,cursor:parsing?"not-allowed":"pointer",boxShadow:parsing?"none":"0 4px 18px rgba(91,141,184,.35)"}}>
            {parsing?"识别中，请稍候...":"生成幸运日程 ✨"}
          </button>
        </div>
      </div>
    </div>
  );

  // ── RESULT ───────────────────────────────────────────────────────────────────
  const activeCoords = getActiveCoords();
  return (
    <div style={{minHeight:"100vh",background:BG,fontFamily:FONT,paddingBottom:80}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      {showProfile&&<ProfileModal/>}

      <div style={{position:"sticky",top:0,zIndex:10,background:"rgba(255,255,255,.88)",backdropFilter:"blur(12px)",padding:"12px 20px",borderBottom:"1px solid rgba(125,216,198,.3)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <button onClick={()=>setScreen("home")} style={{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#5B8DB8"}}>‹</button>
        <span style={{fontWeight:800,fontSize:17,color:"#2C3E50"}}>✨ 今日幸运日程</span>
        <button onClick={exportICS} style={{background:"linear-gradient(135deg,#7DD8C6,#5B8DB8)",color:"white",border:"none",borderRadius:20,padding:"7px 14px",fontSize:13,fontWeight:700,cursor:"pointer"}}>导入日历</button>
      </div>

      {exportMsg&&<div style={{background:"#D5F5E3",color:"#27AE60",padding:"10px 20px",textAlign:"center",fontSize:14,fontWeight:600}}>{exportMsg}</div>}

      <div style={{maxWidth:520,margin:"0 auto",padding:"16px 16px 0"}}>

        {/* Location + Weather banner */}
        <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}}>
          {weather&&(
            <div style={{flex:1,minWidth:200,background:"rgba(255,255,255,.78)",borderRadius:16,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",border:"1px solid rgba(125,216,198,.4)"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <span style={{fontSize:26}}>{weather.emoji}</span>
                <div>
                  <div style={{fontWeight:700,color:"#2C3E50",fontSize:13}}>{activeCoords?.label||cityName} · {season}</div>
                  <div style={{fontSize:11,color:"#7F8C8D"}}>{weather.desc} · {weather.tempMin}~{weather.tempMax}°C</div>
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:24,fontWeight:800,color:"#2C3E50",lineHeight:1}}>{weather.temp}°</div>
                <div style={{fontSize:10,color:"#95A5A6"}}>当前气温</div>
              </div>
            </div>
          )}
          <button onClick={()=>setShowProfile(true)} style={{background:"rgba(255,255,255,.78)",border:"1px solid rgba(155,89,182,.3)",borderRadius:16,padding:"12px 14px",cursor:"pointer",fontSize:12,color:"#9B59B6",fontWeight:700,whiteSpace:"nowrap"}}>
            {(profile.workLat||profile.homeLat)?"✅ 位置已设置":"📍 设置位置"}
            <div style={{fontSize:10,color:"#BDC3C7",marginTop:2}}>{isWeekend()?"休息日":"工作日"}</div>
          </button>
        </div>

        {/* Energy card */}
        <div style={{background:`linear-gradient(135deg,${data.luckyColorHex}22,${data.luckyJewelryHex}22)`,border:`1.5px solid ${data.luckyColorHex}55`,borderRadius:20,padding:"18px 20px",marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:"#7F8C8D",marginBottom:8,letterSpacing:1}}>TODAY'S ENERGY</div>
          <p style={{margin:"0 0 14px",color:"#2C3E50",fontSize:14,lineHeight:1.75}}>{data.mood}</p>
          <div style={{display:"flex",gap:16}}>
            <div style={{flex:1}}><span style={{fontSize:11,color:"#27AE60",fontWeight:700,background:"#EAFAF1",borderRadius:8,padding:"2px 8px"}}>✅ 建议</span><p style={{margin:"4px 0 0",fontSize:13,color:"#2C3E50"}}>{data.advice}</p></div>
            <div style={{flex:1}}><span style={{fontSize:11,color:"#E74C3C",fontWeight:700,background:"#FDEDEC",borderRadius:8,padding:"2px 8px"}}>⚠️ 避免</span><p style={{margin:"4px 0 0",fontSize:13,color:"#2C3E50"}}>{data.avoid}</p></div>
          </div>
        </div>

        {/* Lucky grid */}
        <div style={{background:"rgba(255,255,255,.82)",borderRadius:20,padding:"16px 20px",marginBottom:14}}>
          <div style={{fontSize:11,fontWeight:700,color:"#7F8C8D",marginBottom:12,letterSpacing:1}}>LUCKY ELEMENTS</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:10}}>
            {[
              {icon:"🎨",label:"幸运色", val:data.luckyColor,   color:data.luckyColorHex},
              {icon:"💎",label:"幸运饰品",val:data.luckyJewelry, color:data.luckyJewelryHex},
              {icon:"⏰",label:"幸运时辰",val:data.luckyTime},
              {icon:"🧭",label:"幸运方位",val:data.luckyDirection},
              {icon:"🔢",label:"幸运数字",val:Array.isArray(data.luckyNumbers)?data.luckyNumbers.join("·"):data.luckyNumbers},
              {icon:"🍜",label:"幸运食物",val:data.luckyFood},
              {icon:"🎯",label:"随身物",  val:data.luckyItem},
              {icon:"🌸",label:"幸运花",  val:data.luckyFlower},
            ].map(item=>(
              <div key={item.label} style={{textAlign:"center"}}>
                <div style={{width:42,height:42,borderRadius:13,background:item.color?`${item.color}33`:"#F0F0F0",border:item.color?`1.5px solid ${item.color}66`:"none",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 4px"}}>
                  {item.color?<span style={{width:18,height:18,borderRadius:"50%",background:item.color,display:"block"}}/>:<span style={{fontSize:18}}>{item.icon}</span>}
                </div>
                <div style={{fontSize:10,color:"#95A5A6",marginBottom:2}}>{item.label}</div>
                <div style={{fontSize:11,fontWeight:700,color:"#2C3E50"}}>{item.val||"—"}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Outfit */}
        <div style={{background:"rgba(255,255,255,.82)",borderRadius:20,padding:"16px 20px",marginBottom:14}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4}}>
            <div style={{fontSize:11,fontWeight:700,color:"#7F8C8D",letterSpacing:1}}>TODAY'S OUTFIT</div>
            {weather&&<div style={{fontSize:11,color:"#5B8DB8",background:"rgba(91,141,184,.1)",borderRadius:10,padding:"2px 8px"}}>{weather.emoji} {season} · {weather.temp}°C</div>}
          </div>
          {outfitLoading&&<div style={{padding:"20px 0",display:"flex",flexDirection:"column",alignItems:"center",gap:10}}><Spinner size={22}/><span style={{fontSize:13,color:"#7F8C8D"}}>AI 结合天气和幸运色生成穿搭建议...</span></div>}
          {!outfitLoading&&outfit&&(
            <>
              {outfitError&&<div style={{background:"#FFF3E0",borderRadius:10,padding:"8px 12px",fontSize:12,color:"#E67E22",marginBottom:10}}>⚠️ {outfitError}</div>}
              <p style={{fontSize:13,color:"#5B8DB8",fontStyle:"italic",margin:"0 0 12px",lineHeight:1.6,fontWeight:600}}>{outfit.desc}</p>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {[["👚","上装",outfit.top],["👖","下装",outfit.bottom],["👟","鞋子",outfit.shoes],["👜","包包",outfit.bag]].map(([ico,lbl,val])=>(
                  <div key={lbl} style={{background:`${data.luckyColorHex}18`,borderRadius:12,padding:"10px 12px"}}>
                    <div style={{fontSize:13,marginBottom:3}}>{ico} <strong style={{color:"#5B8DB8"}}>{lbl}</strong></div>
                    <div style={{fontSize:12,color:"#2C3E50",lineHeight:1.45}}>{val}</div>
                  </div>
                ))}
              </div>
              {outfit.extra&&<div style={{marginTop:8,background:"rgba(245,166,35,.12)",borderRadius:12,padding:"10px 12px",border:"1px solid rgba(245,166,35,.3)"}}><strong style={{color:"#E67E22",fontSize:13}}>🌂 今日特别提示：</strong><span style={{fontSize:13,color:"#2C3E50"}}> {outfit.extra}</span></div>}
              <div style={{marginTop:8,background:`${data.luckyJewelryHex}20`,borderRadius:12,padding:"10px 12px",border:`1px solid ${data.luckyJewelryHex}44`}}><strong style={{color:"#5B8DB8",fontSize:13}}>💎 幸运首饰：</strong><span style={{fontSize:13,color:"#2C3E50"}}> {outfit.jewelry||`${data.luckyJewelry}色系首饰`}</span></div>
            </>
          )}
        </div>

        {/* Food recommendations */}
        {activeCoords&&(
          <div style={{background:"rgba(255,255,255,.82)",borderRadius:20,padding:"16px 20px",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontSize:11,fontWeight:700,color:"#7F8C8D",letterSpacing:1}}>🍜 附近美食推荐</span>
              {poisLoading&&<Spinner size={12}/>}
            </div>
            <div style={{fontSize:12,color:"#95A5A6",marginBottom:8}}>
              基于幸运食物「{data.luckyFood}」· {activeCoords.label}附近800m
            </div>
            {poisLoading&&<div style={{fontSize:13,color:"#7F8C8D",padding:"8px 0"}}>正在搜索附近餐厅并匹配...</div>}
            {!poisLoading&&foodPOIs&&foodPOIs.length>0&&foodPOIs.map(poi=>(
              <POICard key={poi.id} poi={poi} color="#FF6B35" icon="🍽"/>
            ))}
            {!poisLoading&&foodPOIs&&foodPOIs.length===0&&(
              <div>
                <div style={{fontSize:13,color:"#95A5A6",marginBottom:10}}>附近暂未找到餐厅数据，可在地图上直接搜索：</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <a href={`https://map.baidu.com/search/${encodeURIComponent(data.luckyFood+"餐厅")}/@${activeCoords.lon},${activeCoords.lat},15z`} target="_blank" rel="noreferrer"
                    style={{flex:1,display:"block",textAlign:"center",padding:"10px",borderRadius:12,background:"rgba(255,107,53,.12)",border:"1px solid rgba(255,107,53,.3)",color:"#FF6B35",fontWeight:700,fontSize:13,textDecoration:"none"}}>
                    百度地图搜索 →
                  </a>
                  <a href={`https://uri.amap.com/search?keywords=${encodeURIComponent(data.luckyFood)}&center=${activeCoords.lon},${activeCoords.lat}&zoom=15`} target="_blank" rel="noreferrer"
                    style={{flex:1,display:"block",textAlign:"center",padding:"10px",borderRadius:12,background:"rgba(255,107,53,.08)",border:"1px solid rgba(255,107,53,.25)",color:"#FF6B35",fontWeight:700,fontSize:13,textDecoration:"none"}}>
                    高德地图搜索 →
                  </a>
                </div>
              </div>
            )}
            {!poisLoading&&!foodPOIs&&!activeCoords&&<div style={{fontSize:13,color:"#BDC3C7"}}>设置位置后可获取推荐</div>}
          </div>
        )}

        {/* Walk recommendations */}
        {activeCoords&&(
          <div style={{background:"rgba(255,255,255,.82)",borderRadius:20,padding:"16px 20px",marginBottom:14}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:8}}>
              <span style={{fontSize:11,fontWeight:700,color:"#7F8C8D",letterSpacing:1}}>🧭 散步地点推荐</span>
              {poisLoading&&<Spinner size={12}/>}
            </div>
            <div style={{fontSize:12,color:"#95A5A6",marginBottom:8}}>
              朝幸运方位「{data.luckyDirection}」· {activeCoords.label}附近1.2km
            </div>
            {poisLoading&&<div style={{fontSize:13,color:"#7F8C8D",padding:"8px 0"}}>正在搜索附近公园绿地...</div>}
            {!poisLoading&&walkPOIs&&walkPOIs.length>0&&walkPOIs.map(poi=>(
              <POICard key={poi.id} poi={poi} color="#1ABC9C" icon="🌳"/>
            ))}
            {!poisLoading&&walkPOIs&&walkPOIs.length===0&&(
              <div>
                <div style={{fontSize:13,color:"#95A5A6",marginBottom:10}}>附近暂未找到公园数据，可在地图上直接搜索：</div>
                <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                  <a href={`https://map.baidu.com/search/${encodeURIComponent("公园")}/@${activeCoords.lon},${activeCoords.lat},15z`} target="_blank" rel="noreferrer"
                    style={{flex:1,display:"block",textAlign:"center",padding:"10px",borderRadius:12,background:"rgba(26,188,156,.12)",border:"1px solid rgba(26,188,156,.3)",color:"#1ABC9C",fontWeight:700,fontSize:13,textDecoration:"none"}}>
                    百度地图搜索 →
                  </a>
                  <a href={`https://uri.amap.com/search?keywords=${encodeURIComponent("公园")}&center=${activeCoords.lon},${activeCoords.lat}&zoom=15`} target="_blank" rel="noreferrer"
                    style={{flex:1,display:"block",textAlign:"center",padding:"10px",borderRadius:12,background:"rgba(26,188,156,.08)",border:"1px solid rgba(26,188,156,.25)",color:"#1ABC9C",fontWeight:700,fontSize:13,textDecoration:"none"}}>
                    高德地图搜索 →
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {!activeCoords&&(
          <div style={{background:"rgba(255,255,255,.75)",borderRadius:20,padding:"16px 20px",marginBottom:14,border:"1.5px dashed #B0DDD6",textAlign:"center"}}>
            <div style={{fontSize:13,color:"#7F8C8D",marginBottom:10}}>📍 设置位置后，可获取附近美食和散步地点推荐</div>
            <button onClick={()=>setShowProfile(true)} style={{padding:"9px 20px",borderRadius:12,border:"none",background:"linear-gradient(135deg,#7DD8C6,#5B8DB8)",color:"white",fontWeight:700,cursor:"pointer",fontSize:13}}>设置我的位置</button>
          </div>
        )}

        {/* Schedule */}
        <div style={{background:"rgba(255,255,255,.82)",borderRadius:20,padding:"16px 20px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
            <span style={{fontSize:11,fontWeight:700,color:"#7F8C8D",letterSpacing:1}}>TODAY'S SCHEDULE</span>
            <span style={{fontSize:11,color:"#BDC3C7"}}>↑↓ 排序  ✎ 编辑  ✕ 删除</span>
          </div>
          {schedule.map((item,idx)=>{
            const c=CAT[item.cat]||CAT.work;
            if(editId===item.id) return (
              <div key={item.id} style={{background:"#FFFDE7",border:"2px solid #F5A623",borderRadius:14,padding:"12px 14px",marginBottom:10}}>
                <div style={{display:"flex",gap:8,marginBottom:8}}>
                  <input value={editTime} onChange={e=>setEditTime(e.target.value)} placeholder="时间" style={{width:70,borderRadius:8,border:"1px solid #F5A623",padding:"6px 8px",fontSize:13,outline:"none"}}/>
                  <input value={editTitle} onChange={e=>setEditTitle(e.target.value)} style={{flex:1,borderRadius:8,border:"1px solid #F5A623",padding:"6px 8px",fontSize:13,outline:"none"}}/>
                </div>
                <textarea value={editDesc} onChange={e=>setEditDesc(e.target.value)} rows={2} style={{width:"100%",borderRadius:8,border:"1px solid #F5A623",padding:"6px 8px",fontSize:12,resize:"none",boxSizing:"border-box",marginBottom:8,outline:"none"}}/>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={saveEdit} style={{flex:1,padding:8,borderRadius:8,border:"none",background:"#F5A623",color:"white",fontWeight:700,cursor:"pointer",fontSize:13}}>保存</button>
                  <button onClick={()=>setEditId(null)} style={{padding:"8px 16px",borderRadius:8,border:"1px solid #E0E0E0",background:"white",cursor:"pointer",fontSize:13}}>取消</button>
                </div>
              </div>
            );
            return (
              <div key={item.id} style={{background:c.bg,borderRadius:14,padding:"12px 14px",marginBottom:10,display:"flex",alignItems:"flex-start",gap:10}}>
                <div style={{minWidth:44,textAlign:"center",flexShrink:0}}>
                  <div style={{fontSize:20}}>{item.emoji}</div>
                  <div style={{fontSize:11,fontWeight:700,color:c.dot,marginTop:2}}>{item.time}</div>
                </div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:700,color:"#2C3E50",fontSize:14,marginBottom:2}}>{item.title}</div>
                  <div style={{fontSize:12,color:"#7F8C8D",lineHeight:1.55}}>{item.desc}</div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:2,flexShrink:0}}>
                  {[
                    ["↑",()=>{if(idx===0)return;const s=[...schedule];[s[idx-1],s[idx]]=[s[idx],s[idx-1]];setSchedule(s);},"#BDC3C7"],
                    ["✎",()=>{setEditId(item.id);setEditTime(item.time);setEditTitle(item.title);setEditDesc(item.desc);},"#5B8DB8"],
                    ["↓",()=>{if(idx===schedule.length-1)return;const s=[...schedule];[s[idx],s[idx+1]]=[s[idx+1],s[idx]];setSchedule(s);},"#BDC3C7"],
                    ["✕",()=>setSchedule(s=>s.filter(i=>i.id!==item.id)),"#E74C3C"],
                  ].map(([lbl,fn,clr])=>(
                    <button key={lbl} onClick={fn} style={{background:"none",border:"none",cursor:"pointer",fontSize:13,color:clr,padding:"2px 5px",lineHeight:1}}>{lbl}</button>
                  ))}
                </div>
              </div>
            );
          })}
          <button onClick={exportICS} style={{width:"100%",marginTop:8,padding:14,background:"linear-gradient(135deg,#7DD8C6,#5B8DB8)",color:"white",border:"none",borderRadius:14,fontSize:16,fontWeight:800,cursor:"pointer",boxShadow:"0 4px 18px rgba(91,141,184,.3)"}}>
            📅 一键导入系统日历
          </button>
          <p style={{textAlign:"center",fontSize:11,color:"#BDC3C7",margin:"8px 0 0"}}>导出 .ics 文件，支持 iPhone / Google / Outlook 日历</p>
        </div>
      </div>
    </div>
  );
}
