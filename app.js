const TOKEN = "SECURE_TOKEN_2025";
let playerPackage = "";
let playerPosition = 0;
let playerDuration = 0;
let playerTrack = "";
let scrubTrack = null;

function formatTrackTime(ms) {
  const seconds = Math.floor(ms / 1000);
  return Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
}

function renderTrack(position) {
  const seek = document.getElementById("player__seek");
  const clamped = Math.min(playerDuration, Math.max(0, position));
  seek.max = String(playerDuration || 1);
  seek.value = String(clamped);
  document.querySelector(".widget_player__track_progress").style.width =
    (playerDuration ? clamped / playerDuration * 100 : 0) + "%";
  document.querySelector(".widget_player__track_time span:first-child").textContent =
    formatTrackTime(clamped);
  document.querySelector(".widget_player__track_time span:last-child").textContent =
    formatTrackTime(playerDuration);
}

function updatePlayer(data) {
  if (typeof data === "string") {
    try { data = JSON.parse(data); } catch (_) { return; }
  }
  if (!data || !document.getElementById("player__seek")) return;

  document.querySelector(".widget_player__title").textContent = data.SongName || "—";
  document.querySelector(".widget_player__artist").textContent = data.SongArtist || "";
  const cover = document.querySelector(".widget_player__image");
  if (typeof data.SongAlbumPicture === "string") {
    cover.querySelector("img").src = data.SongAlbumPicture
      ? "data:image/png;base64," + data.SongAlbumPicture : "img.jpg";
  }
  playerPackage = typeof data.packageName === "string" ? data.packageName.trim() : "";
  cover.disabled = !playerPackage || typeof (window.androidApi || {}).runApp !== "function";

  const pos = Number(data.Trpos);
  const dur = Number(data.Trdur);
  playerDuration = Number.isFinite(dur) ? Math.max(0, Math.round(dur)) : 0;
  playerPosition = Number.isFinite(pos) ? Math.max(0, Math.round(pos)) : 0;
  playerTrack = JSON.stringify([playerPackage, data.SongName, data.SongArtist, data.SongAlbum, playerDuration]);
  document.getElementById("player__seek").disabled =
    !playerDuration || typeof (window.androidApi || {}).seekMusic !== "function";
  if (scrubTrack === null) renderTrack(playerPosition);

  const toggle = document.getElementById("player__toggle");
  const playing = data.PlayStat === "PLAY";
  toggle.classList.toggle("is-playing", playing);
  toggle.setAttribute("aria-label", playing ? "Пауза" : "Воспроизвести");
}

document.addEventListener("contextmenu", function(e){
  e.preventDefault();
});

const wallpaperMode = load("wallpaperMode");

if(wallpaperMode === "auto"){
  setWallpaperAuto();
}else{
  setWallpaperOff();
}

// ===== Android → JS =====
window.onAndroidEvent = function (type, data) {
  //console.log("AndroidEvent:", type, data);
  
  switch (type) {

    case "speed":
     /* document.getElementById("speed").innerText = data.value;
      change(data.value);
      break;
	  
	  case "rpm":
      document.getElementById("rpm").innerText = data.value;
	  */
      break;

    case "hud":
     /* if (data.naviOn || data.aradarOn) {
        document.getElementById("hud").innerText =
          `${data.turnType} → ${data.remainDist} → ${data.turnDist} m • ${data.nextRoad} • Limit ${data.speedLimit}`;
      } else {
        document.getElementById("hud").innerText = "—";
      }
	  */
      break;
	  
	  /*
	  data.turnType:
	  
	15 — Финиш маршрута (finish)
	8 — Разворот налево (U-turn left)
	19 — Разворот направо (U-turn right)
	49 — Паром / переправа (ferry)
	14 — ГАИ / контроль (GAI)
	4 — Съезд / поворот налево (take / exit left)
	5 — Съезд / поворот направо (take / exit right)
	2 — Поворот налево (turn left)
	3 — Поворот направо (turn right)
	6 — Резкий поворот налево (hard left)
	7 — Резкий поворот направо (hard right)
	55 — Выезд с кругового движения (roundabout exit)
	24 — Въезд на круговое движение (roundabout enter)
	9 — Движение прямо (go straight)
*/

    case "weather":
      //document.getElementById("weather-temp").innerText = `${data.temp} °C`;
      break;

   case "theme":
	//document.body.className = data.mode === "dark" ? "" : "light";
	//document.getElementById("theme").innerText = `Theme: ${data.mode}`;
  break;

case "musicInfo":
  updatePlayer(data);
  break;
  
  case "gps":
if (typeof data === "string")
   data = JSON.parse(data);

 if(data.heading !== undefined)
   updateCompass(data.heading);

break;
  
  
  
  //----------------------
  }
};

document.addEventListener("DOMContentLoaded", function () {

  const btn = document.getElementById("btnClose");

  if (btn) {
    btn.addEventListener("click", function () {
      if (window.androidApi && window.androidApi.onClose) {
        window.androidApi.onClose(TOKEN);
      }
    });
  }

  const btns = document.getElementById("btnSettings");

  if (btns) {
    btns.addEventListener("click", function () {
      if (window.androidApi && window.androidApi.onSettings) {
        window.androidApi.onSettings(TOKEN);
      }
    });
  }

  const btnWallpaper = document.getElementById("btnWallpaper");

  if(btnWallpaper){
    btnWallpaper.addEventListener("click", function () {
        toggleWallpaper();
    });
  }

    updateWallpaperButton();

	const player__prev = document.getElementById("player__prev");

  if (player__prev) {
    player__prev.addEventListener("click", function () {
		//console.log("Android result:", "res");
      if (window.androidApi && window.androidApi.runEnum) {
       window.androidApi.runEnum(TOKEN,"MEDIA_PREV");
		//console.log("Android result:", res);
      }
    });
  }
  const player__next = document.getElementById("player__next");

  if (player__next) {
    player__next.addEventListener("click", function () {
      if (window.androidApi && window.androidApi.runEnum) {
        window.androidApi.runEnum(TOKEN,"MEDIA_NEXT");
      }
    });
  }
  
  document.getElementById("player__toggle").addEventListener("click", () => {
    if (window.androidApi && window.androidApi.runEnum) {
      const result = window.androidApi.runEnum(TOKEN, "MEDIA_PLAY_PAUSE");
      if (result) {
        try {
          if (JSON.parse(result).error === "unknown_enum") {
            const playing = document.getElementById("player__toggle").classList.contains("is-playing");
            window.androidApi.runEnum(TOKEN, playing ? "MEDIA_PAUSE" : "MEDIA_PLAY");
          }
        } catch (_) {}
      }
    }
  });

  document.querySelector(".widget_player__image").addEventListener("click", () => {
    if (playerPackage && window.androidApi && window.androidApi.runApp) {
      window.androidApi.runApp(TOKEN, playerPackage);
    }
  });

  const seek = document.getElementById("player__seek");
  seek.addEventListener("input", () => {
    if (scrubTrack === null) scrubTrack = playerTrack;
    renderTrack(Number(seek.value));
  });
  seek.addEventListener("change", () => {
    const position = Number(seek.value);
    if (!seek.disabled && (scrubTrack === null || scrubTrack === playerTrack)
        && Number.isFinite(position) && typeof (window.androidApi || {}).seekMusic === "function") {
      if (window.androidApi.seekMusic(TOKEN, Math.round(position))) playerPosition = position;
    }
    scrubTrack = null;
    renderTrack(playerPosition);
  });
  seek.addEventListener("pointercancel", () => {
    scrubTrack = null;
    renderTrack(playerPosition);
  });

  /*

  -------------------------------------------------
  window.androidApi.runEnum(TOKEN,"MEDIA_PAUSE");
  -------------------------------------------------


  GO_TO_PP, Вывести приложение на приборку
  RUN_BLACK, Черный экран
  OPEN_SHTORKA, Открыть шторку
  CLOSE_SHTORKA, Закрыть шторку
  VIBOR_VODITEL, Выбрать водителя
  GO_TO_GU, Вывести приложение на ГУ
  RUN_START_APP_MENU, Меню запуска установленных приложений
  GLOBAL_BACK, Глобальная кнопка назад
  GLOBAL_HOME, Глобальная кнопка домой
  TOGGLE_GU_PP, Переключить приложение на ГУ/Приборку
  RUN_FUN_CAR, Быстрый доступ к функциям авто
  TOGGLE_GU_PP_CPP, Переключить ПП Штатно/Карты/Приборка
  GO_CPP_TO_PP, Включить колодцы на Приборке
  TOGGLE_CPP_PP, Переключить Карты/Приборка
  MEDIA_PLAY, Медиа плей
  MEDIA_PAUSE, Медиа пауза
  MEDIA_NEXT, Медиа следующий трек
  MEDIA_BLACK, Медиа предыдущий трек
  VIEW_ALL_MESSAGE, Посмотреть все сообщения с телефона
  b_fiksik_on, Включить голограмму фиксика (голосовой помощник)
  b_fiksik_off, Отключить голограмму фиксика (голосовой помощник)
  heat_seat_l_0, Выключить подогрев водительского сиденья
  heat_seat_l_1, Включить подогрев водительского сиденья ур. 1
  heat_seat_l_2, Включить подогрев водительского сиденья ур. 2
  heat_seat_l_3, Включить подогрев водительского сиденья ур. 3
  vent_seat_l_0, Выключить вентиляцию водительского сиденья
  vent_seat_l_1, Включить вентиляцию водительского сиденья ур. 1
  vent_seat_l_2, Включить вентиляцию водительского сиденья ур. 2
  vent_seat_l_3, Включить вентиляцию водительского сиденья ур. 3
  heat_seat_r_0, Выключить подогрев пассажирского сиденья
  heat_seat_r_1, Включить подогрев пассажирского сиденья ур. 1
  heat_seat_r_2, Включить подогрев пассажирского сиденья ур. 2
  heat_seat_r_3, Включить подогрев пассажирского сиденья ур. 3
  vent_seat_r_0, Выключить вентиляцию пассажирского сиденья
  vent_seat_r_1, Включить вентиляцию пассажирского сиденья ур. 1
  vent_seat_r_2, Включить вентиляцию пассажирского сиденья ур. 2
  vent_seat_r_3, Включить вентиляцию пассажирского сиденья ур. 3
  heat_wheel_on, Включить подогрев руля
  heat_wheel_off, Выключить подогрев руля
  heat_windshield_on, Включить подогрев лобового стекла
  heat_windshield_off, Выключить подогрев лобового стекла
  heat_rearwindow_on, Включить обогрев заднего стекла
  heat_rearwindow_off, Выключить обогрев заднего стекла
  heat_zad_seat_l_0, Выключить обогрев заднего левог сиденья
  heat_zad_seat_l_1, Включить обогрев заднего левог сиденья ур. 1
  heat_zad_seat_l_2, Включить обогрев заднего левог сиденья ур. 2
  heat_zad_seat_l_3, Включить обогрев заднего левог сиденья ур. 3
  heat_zad_seat_r_off, Выключить обогрев заднего правого сиденья
  heat_zad_seat_r_1, Включить обогрев заднего правого сиденья ур. 1
  heat_zad_seat_r_2, Включить обогрев заднего правого сиденья ур. 2
  heat_zad_seat_r_3, Включить обогрев заднего правого сиденья ур. 3
  voditel_seat_1, Водитель 1
  voditel_seat_2, Водитель 2
  voditel_seat_3, Водитель 3
  */
  

const slots = document.querySelectorAll(".app_slot");
const picker = document.getElementById("app_picker");

let currentSlot = null;

// загрузка сохранённых приложений
slots.forEach(slot => {

  const id = slot.dataset.slot;
  const saved = load("app_slot_" + id);

  if(saved){
    slot.innerHTML = `<img src="data:image/png;base64,${saved.icon}">`;
  }

});


slots.forEach(slot => {
  let pressTimer = null;
  let longPress = false;

  function openPicker() {
    currentSlot = slot.dataset.slot;

    picker.classList.remove("hidden");
    picker.classList.add("app_picker_open");

    showAppPickerLoading();

    setTimeout(() => {
      buildAppPicker();
    }, 10);
  }
  function showAppPickerLoading() {
    picker.innerHTML = `
      <div class="app_picker_loading">
        <div class="app_picker_spinner"></div>
        <div class="app_picker_loading_text">Загрузка приложений...</div>
      </div>
    `;
  }

  function startPress(e) {
    longPress = false;

    if(e) e.preventDefault();

    clearTimeout(pressTimer);
    pressTimer = setTimeout(() => {
      longPress = true;
      openPicker();
    }, 700);
  }

  function endPress(e) {
    clearTimeout(pressTimer);

    if (longPress) {
      if (e) e.preventDefault();
      return;
    }

    const id = slot.dataset.slot;
    const app = load("app_slot_" + id);

    if (!app) {
      openPicker();
      return;
    }

    window.androidApi.runApp(TOKEN, app.package);
  }

  function cancelPress() {
    clearTimeout(pressTimer);
  }


  slot.addEventListener("touchstart", startPress);
  slot.addEventListener("touchend", endPress);
  slot.addEventListener("touchcancel", cancelPress);


  slot.addEventListener("mousedown", startPress);
  slot.addEventListener("mouseup", endPress);
  slot.addEventListener("mouseleave", cancelPress);
});


function buildAppPicker() {
  picker.innerHTML = "";

  const apps = JSON.parse(window.androidApi.getUserApps(TOKEN));

  apps.forEach(app => {
    const item = document.createElement("div");
    item.className = "app_item";

    item.innerHTML = `
      <img src="data:image/png;base64,${app.icon}">
      <span>${app.name}</span>
    `;

    item.addEventListener("click", () => {
      save("app_slot_" + currentSlot, {
        package: app.package,
        name: app.name,
        icon: app.icon
      });

      const slot = document.querySelector(`.app_slot[data-slot="${currentSlot}"]`);

      slot.innerHTML = `
        <img src="data:image/png;base64,${app.icon}">
      `;

      closePicker();
    });

    picker.appendChild(item);
  });
}

function closePicker() {
  picker.classList.remove("app_picker_open");

  setTimeout(() => {
    picker.classList.add("hidden");
  }, 220);
}

document.addEventListener("click", (e) => {
  if (
    !picker.classList.contains("hidden") &&
    !picker.contains(e.target) &&
    !e.target.closest(".app_slot")
  ) {
    closePicker();
  }
});




// ===== Debug =====
  console.log("androidApi =", window.androidApi);


  if (window.androidApi && window.androidApi.onJsReady) {
    window.androidApi.onJsReady(TOKEN);
  }
});




document.querySelectorAll(".app_item").forEach(item =>{

  item.addEventListener("click", ()=>{

    const pkg = item.dataset.app;
    const name = item.innerText;

    save("app_slot_" + currentSlot,{
      package: pkg,
      name: name
    });

    const slot = document.querySelector(
      `.app_slot[data-slot="${currentSlot}"]`
    );

    slot.innerText = name;

    picker.classList.add("hidden");

  });

});


function updateCompass(deg){

  const arrow = document.getElementById("compass_arrow");
  const degText = document.getElementById("compass_deg");

  if(!arrow || !degText) return;

  arrow.style.transform =
    `translate(-50%,-48%) rotate(${deg}deg)`;

  degText.innerText = Math.round(deg) + "°";
}

function save(key,value){
  localStorage.setItem(key, JSON.stringify(value));
}

function load(key){
  const v = localStorage.getItem(key);
  return v ? JSON.parse(v) : null;
}

function setWallpaper(url){

  document.body.style.backgroundImage = `url("${url}")`;

  //save("wallpaper", url);
}

async function setWallpaperAuto(){
  const w = window.innerWidth;
  const h = window.innerHeight;
  //const url = `https://picsum.photos/${w}/${h}?r=${Date.now()}`; //https://holy-river-ca66.woha-woha.workers.dev/
  //const url = `http://holy-river-ca66.woha-woha.workers.dev/${w}/${h}`;
  const url = `https://jcartools.ru/run/picsum_proxy.php?${w}/${h}`;
  try {
    const res = await fetch(url, { cache:"no-store" });
    if(!res.ok){
      throw new Error("HTTP error " + res.status);
    }
    const type = res.headers.get("content-type") || "";
    if(!type.startsWith("image")){
      throw new Error("Not image");
    }
    const blob = await res.blob();
    if(blob.size < 10000){
      throw new Error("Too small");
    }
    const base64 = await new Promise(resolve=>{
      const r = new FileReader();
      r.onloadend = ()=> resolve(r.result);
      r.readAsDataURL(blob);
    });
    document.body.style.backgroundImage = `url("${base64}")`;
    save("wallpaperMode","auto");
    save("wallpaperImage", base64);
  } catch(e){
    console.log("Wallpaper load failed:", e);
    const old = load("wallpaperImage");
    if(old){
      document.body.style.backgroundImage = `url("${old}")`;
    } else {
      document.body.style.backgroundColor = "#000";
    }
  }
}

function setWallpaperOff(){

  document.body.style.backgroundImage = "none";
  document.body.style.backgroundColor = "#0F0D13";

  save("wallpaperMode","off");
}

function toggleWallpaper(){

  const mode = load("wallpaperMode");

   if(mode === "auto"){
      save("wallpaperMode","off");
      updateWallpaperButton();
      setWallpaperOff();
    }else{
      save("wallpaperMode","auto");
      updateWallpaperButton();
      setWallpaperAuto();
    }

}

function updateWallpaperButton(){

  const btn = document.getElementById("btnWallpaper");
  const mode = load("wallpaperMode");

  btn.classList.toggle("active", mode === "auto");

}
