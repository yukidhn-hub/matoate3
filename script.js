const target=document.getElementById("target");
const arrow=document.getElementById("arrow");
const message=document.getElementById("message");
const status=document.getElementById("status");
const start=document.getElementById("start");

let spinning=false,locked=false,audio=null;

const results=[
  {name:"あたり",text:"🎉 パンパカパーン！！ 🎉",voice:"パンパカパーン！！ おめでとう！！ 大当たりです！！",cls:"hit",image:null,pitch:1.18,rate:.9},
  {name:"あんじゅ",text:"ざんねん！はずれ～！！",voice:"ざんねん！ はずれ～！！",cls:"anju",image:"images/anju.png",pitch:1.45,rate:1.02},
  {name:"さや",text:"ごめんね！はずれなの！！",voice:"ごめんね！ はずれなの！！",cls:"saya",image:"images/saya.png",pitch:1.35,rate:.98},
  {name:"けんご",text:"おばけがでるぞ～！！",voice:"おばけがでるぞ～！！ はずれだー！！",cls:"kengo",image:"images/kengo.png",pitch:1.05,rate:1.0},
  {name:"じゅんいち",text:"あおばにいくよ！！はずれだよ！！",voice:"あおばにいくよ！！ はずれだよ！！",cls:"junichi",image:"images/junichi.png",pitch:1.15,rate:1.0}
];

function ensureAudio(){
  if(!audio) audio=new(window.AudioContext||window.webkitAudioContext)();
  if(audio.state==="suspended") audio.resume();
}

function beep(freq,duration=.12,volume=.08,delay=0,type="sine"){
  if(!audio)return;
  const o=audio.createOscillator(),g=audio.createGain();
  o.type=type;o.frequency.value=freq;o.connect(g);g.connect(audio.destination);
  const t=audio.currentTime+delay;
  g.gain.setValueAtTime(.0001,t);
  g.gain.exponentialRampToValueAtTime(volume,t+.015);
  g.gain.exponentialRampToValueAtTime(.0001,t+duration);
  o.start(t);o.stop(t+duration+.03);
}

function clap(delay=0){
  if(!audio)return;
  const buffer=audio.createBuffer(1,audio.sampleRate*.08,audio.sampleRate);
  const data=buffer.getChannelData(0);
  for(let i=0;i<data.length;i++) data[i]=(Math.random()*2-1)*(1-i/data.length);
  const src=audio.createBufferSource(),filter=audio.createBiquadFilter(),g=audio.createGain();
  src.buffer=buffer;filter.type="highpass";filter.frequency.value=1200;
  src.connect(filter);filter.connect(g);g.connect(audio.destination);
  const t=audio.currentTime+delay;
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.35,t+.005);
  g.gain.exponentialRampToValueAtTime(.0001,t+.075);src.start(t);
}

function speak(text,pitch=1,rate=1){
  if(!("speechSynthesis" in window))return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang="ja-JP";u.pitch=pitch;u.rate=rate;u.volume=1;
  speechSynthesis.speak(u);
}

function bigFanfare(){
  // 「パンパカパーン！！」っぽい明るいファンファーレ
  [523,659,784,1047,1319,1568,1760].forEach((f,i)=>beep(f,.28,.12,i*.10,"triangle"));
  [1047,1319,1568].forEach((f,i)=>beep(f,.5,.08,.75+i*.09,"square"));
  // 大きな拍手
  for(let i=0;i<18;i++)clap(.95+i*.11);
  setTimeout(()=>speak("パンパカパーン！！ おめでとう！！ 大当たりです！！",1.18,.9),650);
}

function startSpin(){
  if(locked)return;
  ensureAudio();
  spinning=true;
  target.style.transform="";
  target.classList.add("spinning");
  arrow.classList.remove("shoot");
  message.className="message";
  message.textContent="🌀 ぐるぐる～！ もう一度エンター！";
  status.textContent="🌟 もう一度エンターで、えいっ！";
  start.textContent="エンターで射る！";
  beep(330,.13,.08,0,"sine");
}

function shoot(){
  if(!spinning)return;
  ensureAudio();
  spinning=false;
  locked=true;

  const index=Math.floor(Math.random()*results.length);

  target.classList.remove("spinning");
  // 各セクターの中心を上の矢印に合わせる
  // セクター中心は -54 + 72*i 度なので、回転は 54 - 72*i 度。
  const finalRotation=54-72*index;
  target.style.transform=`rotate(${finalRotation}deg)`;

  arrow.classList.remove("shoot");
  void arrow.offsetWidth;
  arrow.classList.add("shoot");

  message.className="message";
  message.textContent="✨ えいっ！！ ✨";
  status.textContent="🎯 的に当たったよ！";
  setTimeout(()=>showResult(index),500);
}

function showResult(index){
  const r=results[index];
  message.className="message big "+r.cls;
  message.innerHTML="";

  const text=document.createElement("div");
  text.textContent=r.text;
  message.appendChild(text);

  if(r.image){
    const img=document.createElement("img");
    img.src=r.image;
    img.alt=r.name+"の演出画像";
    message.appendChild(img);
  }

  status.textContent=r.name==="あたり" ? "🎊 すごい！大あたり！ 🎊" : "🌸 また挑戦してね！";

  if(r.name==="あたり"){
    bigFanfare();
  }else{
    speak(r.voice,r.pitch,r.rate);
  }

  setTimeout(()=>{
    message.className="message";
    message.textContent="エンターキーを押してスタート！";
    status.textContent="🌸 準備OKだよ！ 🌸";
    start.textContent="エンターでスタート！";
    locked=false;
    arrow.classList.remove("shoot");
    target.style.transform="";
  },5000);
}

document.addEventListener("keydown",e=>{
  if(e.key!=="Enter"||e.repeat||locked)return;
  e.preventDefault();
  spinning ? shoot() : startSpin();
});

start.addEventListener("click",()=>{
  spinning ? shoot() : startSpin();
});
