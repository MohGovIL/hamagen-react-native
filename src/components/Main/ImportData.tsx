import {WebView} from "react-native-webview"
import {Text} from "react-native";
import React, {useState, useRef, useEffect} from "react"
import { insertHistoricDB } from "../../services/SampleService";
import { checkSickPeople } from "../../services/Tracker";

function makeScript(daysAgo = 14){
    return `
    (function(){
        function xmlcoords_to_json(data){
            const dm = new DOMParser();
            const xml = dm.parseFromString(data, "application/xml");
            return Array.from(xml.querySelectorAll("Placemark")).map(x=> { 
                let pos = x.querySelector("Point,LineString");
                return {
                    type: pos.tagName.toLowerCase(), data: pos.querySelector("coordinates").textContent, timespan:[
                            new Date(x.querySelector("TimeSpan>begin").textContent).getTime(),
                            new Date(x.querySelector("TimeSpan>end").textContent).getTime()
                        ]
                }
            })
        }
        let days = Array.from(new Array(${daysAgo})).map((x,i)=> new Date(new Date().getTime() - (i+1) * 60 *60 * 24 * 1000) ).map(x=> ({m:x.getMonth(), d: x.getDate(), y: x.getYear() + 1900 }) )
        Promise.all(
            days.map(d=>{ 
                let exp = "1i" + d.y + "!2i" + d.m + "!3i" + d.d;
                return fetch("https://www.google.com/maps/timeline/kml?authuser=0&pb=!1m8!1m3!" + exp + "!2m3!" + exp)
                .then(x=>x.text())
                .then(xmlcoords_to_json)
            })
        )
        .then(x=> x.reduce((acc,next)=> acc.concat(next)))
        .then(x=> window.ReactNativeWebView.postMessage(JSON.stringify(x) ))
        .then(()=> document.location = "https://accounts.google.com/logout?continue=https://www.google.com") 
    })()
    `
}

type GoogleDataPoint = {
    type: "point" | "linestring"
    data: string
    timespan: [number, number]
}

const WebViewCollector = ({onDataCollected } : {onDataCollected: (data:GoogleDataPoint[])=> void }) =>{
    const [webviewState, setWebviewState] = useState<any>({});
    const [importData, setImportData] = useState<string | undefined>(undefined);
    const webviewRef = useRef<WebView>(null);
    const isInHomepage:boolean =webviewState?.url?.startsWith('https://www.google.com') ?? false;
    const isInLogin:boolean = (webviewState?.url?.startsWith('https://accounts.google.com') ?? false) && !importData;
    const url = 'https://accounts.google.com/Login?continue=https://www.google.com'
    const script = makeScript();

    return <WebView onMessage={({nativeEvent})=>{
        if (nativeEvent.data){
            setImportData(nativeEvent.data);
        }
    }} 
    ref={webviewRef}
    style={{height: '100%', width: '100%', flex: 1, opacity: isInLogin ? 1 : 0.1 }}
    source={{
        uri: url
        }}
        startInLoadingState={true}
        javaScriptEnabled={true}
        onLoadEnd={()=>{
            if (isInHomepage){
                if (!importData){
                    webviewRef.current?.injectJavaScript(script);
                } else{
                    onDataCollected(JSON.parse(importData))
                }
            }
        }}
    onNavigationStateChange={setWebviewState}
    ></WebView>
}

function getDatePoints(begin:number, end:number, resolution = 30 * 60 * 1000){
    let points = [];
    for (let i = begin; i< end; i = i + resolution){
        points.push(new Date(i))
    }
    points.push(new Date(end));
    return points;
}

function interpolate(data: GoogleDataPoint[]): {coords: {latitude:number, longitude:number}, timestamp: Date}[] {
    return data.reduce((acc, next)=>{
        const time = getDatePoints(next.timespan[0], next.timespan[1]);
        if (next.type === "point"){
            let [longitude, latitude] = next.data.split(",").map(parseFloat);
            return acc.concat(time.map(x=> ({
                timestamp: x,
                coords: {
                    longitude,
                    latitude
                }
            })))
        }
        if (next.type === "linestring"){
            let coords= next.data.split(" ").map(x=> x.split(",").map(parseFloat)).filter(x=> x[0] !== NaN && x[0] !== undefined && x[1] !== NaN && x[1] !== undefined);
            let step = time.length / coords.length
            return acc.concat(coords.map(([longitude, latitude],i)=>({
                timestamp: time[Math.floor(i* step)],
                coords:{
                    longitude,
                    latitude
                } 
            })))
        }
        return acc;
    },[] as {coords: {latitude:number, longitude:number}, timestamp: Date}[])
}

export default function ImportData(){
    const [screen, setScreen] = useState("intro")
    const [data, setData] = useState<GoogleDataPoint[]>([])
    useEffect(()=>{
        if (data.length === 0) return;
        if (screen !== "intro") return;
        
        let interpolated = interpolate(data);
        let samples = interpolated.map(x=>({
            timestamp : x.timestamp.getTime(),
            coords: {
                accuracy: 50,
                longitude: x.coords.longitude,
                latitude: x.coords.latitude
            }
        }))
       
        insertHistoricDB(samples).then(()=>{
            setScreen("done")
            checkSickPeople(true)
        }, ex=> console.log(ex));
    }, [data])
    if (screen === "done"){
        return <Text>{data.length} items were collected</Text>
    }
    if (screen === "intro"){
        return <WebViewCollector onDataCollected={d=> {
            setData(d);
            
        }} />
    }
}