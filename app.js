const API_URL = "https://cwa-weather-back.zeabur.app/api/weather/newtaipei";

// Icon: sweet pink vibe
function getWeatherIcon(weather) {
  if (!weather) return "🎀";
  if (weather.includes("晴")) return "🌤️";
  if (weather.includes("多雲")) return "⛅";
  if (weather.includes("陰")) return "☁️";
  if (weather.includes("雨")) return "🌧️";
  if (weather.includes("雷")) return "⛈️";
  return "🎀";
}

function getAdvice(rainProb, maxTemp) {
  const rain = parseInt(rainProb, 10);
  const maxT = parseInt(maxTemp, 10);

  let rainIcon = "🌂";
  let rainText = "安心出門，不用帶傘";
  if (rain > 30) {
    rainIcon = "☂️";
    rainText = "甜蜜備傘，浪漫不怕雨";
  }

  let clothIcon = "👗";
  let clothText = "輕甜穿搭，舒適自信";
  if (maxT >= 28) {
    clothIcon = "👒";
    clothText = "清爽短袖，輕盈出發";
  } else if (maxT <= 20) {
    clothIcon = "🧥";
    clothText = "加件外套，暖暖更貼心";
  }

  return { rainIcon, rainText, clothIcon, clothText };
}

function getTimePeriod(startTime) {
  const hour = new Date(startTime).getHours();
  if (hour >= 5 && hour < 11) return "早晨";
  if (hour >= 11 && hour < 14) return "中午";
  if (hour >= 14 && hour < 18) return "下午";
  if (hour >= 18 && hour < 23) return "晚上";
  return "深夜";
}

function renderWeather(data) {
  const forecasts = data.forecasts || [];
  if (!forecasts.length) return;

  const current = forecasts[0];
  const others = forecasts.slice(1);
  const advice = getAdvice(current.rain, current.maxTemp);
  const period = getTimePeriod(current.startTime);
  const avgTemp = Math.round((parseInt(current.maxTemp, 10) + parseInt(current.minTemp, 10)) / 2);

  // Hero
  document.getElementById('heroCard').innerHTML = `
    <div class="hero-card">
      <div class="hero-period">${period}</div>
      <div class="hero-temp-container">
        <div class="hero-icon">${getWeatherIcon(current.weather)}</div>
        <div class="hero-temp">${avgTemp}°</div>
      </div>
      <div class="hero-desc">${current.weather}</div>

      <div class="advice-grid">
        <div class="advice-item">
          <div class="advice-icon">${advice.rainIcon}</div>
          <div class="advice-text">${advice.rainText}</div>
          <div class="advice-meta">降雨率 ${current.rain}</div>
        </div>
        <div class="advice-item">
          <div class="advice-icon">${advice.clothIcon}</div>
          <div class="advice-text">${advice.clothText}</div>
          <div class="advice-meta">最高溫 ${current.maxTemp}°</div>
        </div>
      </div>
    </div>
  `;

  // Forecast cards
  const scrollContainer = document.getElementById('futureForecasts');
  scrollContainer.innerHTML = '';
  const todayDate = new Date().getDate();

  others.forEach(f => {
    let p = getTimePeriod(f.startTime);
    const fDate = new Date(f.startTime);
    if (fDate.getDate() !== todayDate) p = "明天" + p;

    scrollContainer.innerHTML += `
      <div class="mini-card">
        <div class="mini-time">${p}</div>
        <div class="mini-icon">${getWeatherIcon(f.weather)}</div>
        <div class="mini-temp">${f.minTemp}° - ${f.maxTemp}°</div>
        <div class="mini-rain">💧${f.rain}</div>
      </div>
    `;
  });

  // Update date
  const now = new Date();
  const month = now.getMonth() + 1;
  const date = now.getDate();
  const dayIndex = now.getDay();
  const days = ["週日", "週一", "週二", "週三", "週四", "週五", "週六"];
  document.getElementById('updateTime').textContent = `${month}月${date}日 ${days[dayIndex]}`;
}

// ----- Carousel Control -----
let slideIndex = 1;

function moveSlide(n) {
  showSlide(slideIndex += n);
}

function showSlide(n) {
  const slides = document.getElementsByClassName("carousel-slide");
  if (!slides.length) return; // guard when slides not rendered yet
  if (n > slides.length) slideIndex = 1;
  if (n < 1) slideIndex = slides.length;

  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }
  slides[slideIndex - 1].style.display = "block";
}

async function fetchWeather() {
  try {
    const delayPromise = new Promise(resolve => setTimeout(resolve, 1500));
    const fetchPromise = fetch(API_URL).then(res => res.json());
    const [_, json] = await Promise.all([delayPromise, fetchPromise]);

    if (json.success) {
      renderWeather(json.data);
      document.getElementById('loading').style.display = 'none';
      document.getElementById('mainContent').style.display = 'block';
      // init carousel after content is visible
      slideIndex = 1;
      showSlide(slideIndex);
    } else {
      throw new Error("API Error");
    }
  } catch (e) {
    console.error(e);
    alert("天氣資料讀取失敗，泡泡被風吹散了，再試一次吧！");
  }
}

document.addEventListener("DOMContentLoaded", fetchWeather);
