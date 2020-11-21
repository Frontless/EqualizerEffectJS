import {color_table} from "./COLOR_TABLE.js"; //html에서 script type을 module로 해줘야함


const clsPlayButton = document.querySelector(".clsPlayButton");
const clsStopButton = document.querySelector(".clsStopButton");
const clsPlayVolume = document.querySelector(".clsPlayVolume");
const clsSideListButton = document.querySelector(".clsSideListButton");
const clsSideListMenu = document.querySelector(".clsSideListMenu");
const clsAudio = document.querySelector(".clsAudio");
const clsMusicTitle = document.querySelector(".clsMusicTitle");
const clsPlayCurrentTime = document.querySelector(".clsPlayCurrentTime");
const clsClose = document.querySelector(".clsClose");
const clsFlex = document.querySelector(".clsFlex");
const clsLoadMusicFile = document.querySelector(".clsLoadMusicFile");
const clsCanvas = document.querySelector(".clsCanvas");
const clsMusicListInMenu = document.querySelector(".clsMusicListInMenu");
const clsMusicList_ul = document.querySelector(".clsMusicList_ul");
const idMusicListInMenu = document.getElementById("idMusicListInMenu");
const CanvasContext = clsCanvas.getContext("2d");
const clsPlayCurrentTimeSpan = document.querySelector(".clsPlayCurrentTimeSpan");

const IntervalStep = 10;
const SecPerMin = 60;
const MUSICLIST_HEIGH = 50;
const AnalyserFFTSize = 2048; // 32, 128 , 512 , 1024 최대 2048
const DurationPerMin = "";
const MusicRoot = "./music/";
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
    CanvasContext.shadowBlur = 40;
    CanvasContext.shadowColor = "#ffffff";
}
const DrawAudioFrequency = setInterval(() => {
    CanvasContext.clearRect(0, 0, clsCanvas.width, clsCanvas.height);
    dataArray.forEach(function(element, index, array){
        FrequencyEffect(index, array);    
    });
    
}, IntervalStep);



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
        //clsPlayCurrentTimeSpan.innerText = `00:00 | ${CalMinSecPerDuration(MaxDuration)}`;        
        clsPlayCurrentTimeSpan.innerText = `${CalMinSecPerDuration(clsAudio.currentTime)} | ${CalMinSecPerDuration(MaxDuration)}`

        console.log("Found duration");
    }
}, 100); 

function ActiveSideList(){
    clsSideListMenu.style.right = "0px";
    
    
}
function  InactiveSideList(){
    clsSideListMenu.style.right = "-500px";
}
function RemoveFileExt(FileName){
    const FindExt = FileName.split('.');
    // console.log(FindExt);
    // const MusicExt = `.${FindExt[FindExt.length-1]}`;

    // const RemoveExt = ExtractTitle[2].replace(MusicExt, ''); 
    return FindExt[0]
}
function ExtractedMusicTitle(){

    const ExtractHTMLFromEle = audioSourceNode.mediaElement.outerHTML.split('"');
    console.log(ExtractHTMLFromEle);
    const ExtractTitle = ExtractHTMLFromEle[1].split('/');
    
    return RemoveFileExt(ExtractTitle[2]);
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
function ClickSideListButton(){
    ActiveSideList();
}

const FileNameArr = ["./music/(No Copyright) Epic Cinematic Dramatic Adventure Trailer.mp3",
"./music/(No Copyright) Epicness Cinematic Dramatic Trailer.mp3",
"./music/Nazar Rybak - The Epic Mind [Epic Orchestral Cinematic][MFY - No Copyright Music].mp3",
"./music/Trailer Epic Action (Royalty Free Music Licensing).mp3"];


function ClickLoadMusicFile(){

    LoadMusicFile();
}
function DesignMusicList(FileName, index){
    const li = document.createElement("li");

    li.id = `idMusicList_li${index}`;
    li.style.height = `${38}px`;
    li.style.width = "98%";
    li.style.border = "1px solid";
    li.style.paddingTop = `${38/2}px`
    li.style.textAlign = "center";
    li.style.marginBottom = "5px";
    li.style.cursor = "pointer";
    li.innerHTML = FileName;

    clsMusicList_ul.style.height = `${MUSICLIST_HEIGH}px`;
    clsMusicList_ul.style.width = "98%";
    clsMusicList_ul.appendChild(li);
}
function SetMusicListName(FileName, index){
    DesignMusicList(FileName, index);
    const a = `${String(RemovePX(clsMusicListInMenu.style.height) + MUSICLIST_HEIGH)}px`;    
    clsMusicListInMenu.style.height = a;
}
function RemovePX(style){
    return parseInt(style.replace('px',''));
}
function ClearMusicList(){
    while(clsMusicList_ul.hasChildNodes()){
        clsMusicList_ul.removeChild(clsMusicList_ul.firstChild);
    }
}
function UploadFileToLS(){
    localStorage.setItem();
}

function LoadMusicFile(){
    // const input = document.createElement("input");
    // let FileNameArr = new Array();
    
    // input.type = "file";
    // input.accept = "mp3/plain"; // 확장자가 xxx, yyy 일때, ".xxx, .yyy"
    // input.multiple = true;
    
    // input.click();
    // input.onchange = function (event) {
        
    //     if(event.target.files.length>0){
    //         ClearMusicList();
    //         for(let i=0; i<event.target.files.length; i++){
    //             FileNameArr.push(RemoveFileExt(event.target.files[i].name));
    //             SetMusicListName(FileNameArr[i], i);

    //             //localStorage.setItem(FileNameArr[i],event.target.files[i]);

    //             document.getElementById(`idMusicList_li${i}`).addEventListener("click",ClickMusicList_li);
    //         }
    //     }
    // };

    //return FileNameArr;
    while(clsMusicList_ul.hasChildNodes()){
        clsMusicList_ul.removeChild(clsMusicList_ul.firstChild);
    }
    console.log(clsMusicList_ul.hasChildNodes());
    if(!clsMusicList_ul.hasChildNodes()){
        for(let i=0; i<FileNameArr.length; i++){
            RemoveFileExt(FileNameArr[i]);
            SetMusicListName(FileNameArr[i], i);
            document.getElementById(`idMusicList_li${i}`).addEventListener("click",ClickMusicList_li);
        }    
    }
    
    return FileNameArr;
}
function ClickMusicList_li(event){
    // console.log(`${MusicRoot}${event.target.innerText}.mp3`);
    // clsAudio.src = `${MusicRoot}${event.target.innerText}.mp3`
    console.log(`${event.target.innerText}`);
    clsAudio.src = `${event.target.innerText}`

    ClickStopButton();
    ClickPlayButton();
    ViewPlayingMusicTitle();
    
}
function ViewPlayingMusicTitle(){
    clsMusicTitle.innerText = `${ExtractedMusicTitle()}`;
}
function EventListener(){
    clsPlayButton.addEventListener("click", ClickPlayButton);
    clsPlayVolume.addEventListener("input", InputPlayVolume);
    clsStopButton.addEventListener("click", ClickStopButton);
    clsPlayCurrentTime.addEventListener("input", InputCurrentTime);
    clsSideListButton.addEventListener("click", ClickSideListButton);
    clsClose.addEventListener("click",InactiveSideList);
    clsLoadMusicFile.addEventListener("click",ClickLoadMusicFile);
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
    ViewPlayingMusicTitle();
}
init();