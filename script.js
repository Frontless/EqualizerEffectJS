import {color_table} from "./COLOR_TABLE.js"; //html에서 script type을 module로 해줘야함


const clsPlayButton = document.querySelector(".clsPlayButton");
const clsStopButton = document.querySelector(".clsStopButton");
const clsPlayVolume = document.querySelector(".clsPlayVolume");
const clsAudio = document.querySelector(".clsAudio");
const clsMusicTitle = document.querySelector(".clsMusicTitle");
const clsPlayCurrentTime = document.querySelector(".clsPlayCurrentTime");
const clsCanvas = document.querySelector(".clsCanvas");
const CanvasContext = clsCanvas.getContext("2d");
const clsPlayCurrentTimeSpan = document.querySelector(".clsPlayCurrentTimeSpan");
const IntervalStep = 10;
const SecPerMin = 60;
const AnalyserFFTSize = 2048; // 32, 128 , 512 , 1024 최대 2048
const DurationPerMin = "";
let IsStopAudio = false;
let MaxDuration = 0;

clsCanvas.width = document.getElementsByClassName("clsCanvas")[0].offsetWidth;
clsCanvas.height = document.getElementsByClassName("clsCanvas")[0].offsetHeight;

// AudioContext 컨텍스트 생성
const audioContext = new AudioContext();

// AudioDestinationNode// audioContext.destination 기본출력은 스피커이다.
const audioDestination = audioContext.destination;
// MediaElementAudioSourceNode
// AudioContext.createMediaElementSource 에 audio tag 를 전달하고, MediaElementAudioSourceNode 생성한다.
const audioSourceNode = audioContext.createMediaElementSource(clsAudio);

// 볼륨을 제어할 GainNode 를 생성
const gainNode = audioContext.createGain();

// 오디오를 분석할 analyser 를 생성
const analyser = audioContext.createAnalyser();
analyser.minDecibels = -128;
analyser.maxDecibels = -10;
analyser.smoothingTimeConstant = 0.8;

// MediaElementAudioSourceNode 에 GainNode 를 연결
// MediaElementAudioSourceNode 에 Analyser 를 연결
// MediaElementAudioSourceNode 의 출력으로 AudioContext.destination 를 연결한다.
audioSourceNode.connect(gainNode).connect(analyser).connect(audioDestination);


analyser.fftSize = AnalyserFFTSize; // FFT의 크기를 2048로 한다.
const bufferLength = analyser.frequencyBinCount; // 시각화를 하기 위한 데이터의 갯수
let dataArray = new Uint8Array(bufferLength);   // 데이터를 담을 bufferLength 크기의 Unit8Array의 배열을 생성
const DefaultColors = color_table('#ffffff','#ecf0f1',bufferLength);//color_table('#34495e','#ecf0f1',bufferLength);

const GetAudioAnalysisDataAtTime = setInterval(() => {    
    // analyser.getByteFrequencyData(dataArray); // 시간기반의 데이터를 Unit8Array배열로 전달
    // analyser.getByteTimeDomainData(dataArray);
    analyser.getByteFrequencyData(dataArray); // 시간기반의 데이터를 Unit8Array배열로 전달
    //console.log(dataArray);
}, IntervalStep); 
function FrequencyEffect(index, array){
    CanvasContext.fillStyle = DefaultColors[index]; 
    CanvasContext.fillRect((clsCanvas.width/bufferLength)*index,clsCanvas.height,clsCanvas.width/bufferLength,-(array[index]/clsCanvas.height)*clsCanvas.height);     
    CanvasContext.shadowBlur =40;
    CanvasContext.shadowColor = "#ffffff";
}
const DrawAudioFrequency = setInterval(() => {
    CanvasContext.clearRect(0, 0, clsCanvas.width, clsCanvas.height);
    dataArray.forEach(function(element, index, array){
        FrequencyEffect(index, array);    
    });
    
}, IntervalStep);

clsMusicTitle.innerText = `${ExtractedMusicTitle()}`;

function CalMinSecPerDuration(Duration){
    let Min = "";
    let Sec = "";
    let StringDurationFomat = "";

    let value = Math.floor(Duration / SecPerMin);
    let reminder = Math.floor( Duration % SecPerMin );

    if(value > 0){
        
        Min = value > 9 ? `${value}` : `0${value}`;
        Sec = reminder > 9 ? `${reminder}` : `0${reminder}`;      
        
    }
    else{
        Min = `00`;
        Sec = reminder > 9 ? `${reminder}` : `0${reminder}`;
    }
    StringDurationFomat = `${Min}:${Sec}`
    return StringDurationFomat
}

const GetDuration = setInterval(() => {
    MaxDuration = audioSourceNode.mediaElement.duration;
    if(MaxDuration>0){
        clsPlayCurrentTimeSpan.innerText = `00:00 | ${CalMinSecPerDuration(MaxDuration)}`;        
        StopInterval(GetDuration);
        console.log("Found duration");
    }
}, 1); 

const CreateAudioBuffer = setInterval(() => {
    if(MaxDuration>0){
        const AudioBuffer = audioContext.createBuffer(audioDestination.channelCount,MaxDuration,audioContext.sampleRate);
        StopInterval(CreateAudioBuffer);
        console.log("Create audio buffer");
    }
}, 1);

function ExtractedMusicTitle(){

    const ExtractHTMLFromEle = audioSourceNode.mediaElement.outerHTML.split('"');
    const ExtractTitle = ExtractHTMLFromEle[1].split('/');
    const FindExt = ExtractTitle[2].split('.');
    const MusicExt = `.${FindExt[FindExt.length-1]}`;    
    const RemoveExt = ExtractTitle[2].replace(MusicExt, ''); 
    
    return RemoveExt;
}
function ClickPlayButton(event){    
    IsStopAudio
    ?(clsAudio.play(), IsStopAudio = false, audioContext.resume())
    :(audioContext.state === "running"?(audioContext.suspend()):audioContext.resume());
    
    console.log(audioContext.state);
}
function InputPlayVolume(event){
    gainNode.gain.value = event.target.value;
    console.log(event.target.value);
}
function ClickStopButton(event){

    clsAudio.pause();
    clsAudio.currentTime = 0;
    clsPlayCurrentTime.value = 0;
    clsPlayCurrentTimeSpan.innerText = `${CalMinSecPerDuration(clsAudio.currentTime)} | ${CalMinSecPerDuration(MaxDuration)}`;
    IsStopAudio = true;
    audioContext.suspend();

    console.log(audioContext.state);
}
function InputCurrentTime(event){
    clsAudio.pause();
    clearInterval(GetCurrentTime);
    clsAudio.currentTime = (clsPlayCurrentTime.value / 100) * MaxDuration;
    console.log(clsAudio.currentTime);    
    clsAudio.play();
    setInterval(GetCurrentTime, 1);

}

function EventListener(){
    clsPlayButton.addEventListener("click", ClickPlayButton);
    clsPlayVolume.addEventListener("input", InputPlayVolume);
    clsStopButton.addEventListener("click", ClickStopButton);
    clsPlayCurrentTime.addEventListener("input", InputCurrentTime);

}

function GetCurrentTime(){
    clsPlayCurrentTime.value = (clsAudio.currentTime / MaxDuration) * 100;

    clsPlayCurrentTimeSpan.innerText = `${CalMinSecPerDuration(clsAudio.currentTime)} | ${CalMinSecPerDuration(MaxDuration)}`;
    //console.log(clsAudio.currentTime);
}

function StopInterval(Func){
    clearInterval(Func); 
}
function init(){

    clsAudio.play();
    gainNode.gain.value = clsPlayVolume.value;
    clsPlayCurrentTime.value = 0;
    setInterval(GetCurrentTime, 1);
    EventListener();
}
init();