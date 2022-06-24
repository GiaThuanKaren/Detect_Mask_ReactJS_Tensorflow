import logo from "./logo.svg";
import "./App.css";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as Knnclassifier from "@tensorflow-models/knn-classifier";
import { useEffect, useRef } from "react";
const WEAR_MASK_LABLE="WEAR_MASK_LABLE";
const NOT_WEAR_MASK_LABLE="NOT_WEAR_MASK_LABLE";
function App() {
  const Video = useRef();
  const classifier = useRef();
  const modelmobilenet = useRef();
  const setUpCam = function () {
    return new Promise((resolve, reject) => {
      navigator.getUserMedia =
        navigator.getUserMedia ||
        navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia ||
        navigator.msGetUserMedia;

      if (navigator.getUserMedia) {
        navigator.getUserMedia(
          {
            video: true,
          },
          (stream) => {
            Video.current.srcObject = stream;
            Video.current.addEventListener("loadeddata", () => {
              resolve();
            });
          },
          (err) => reject(err)
        );
      } else {
        reject();
      }
    });
  };
  const Train=function(lable){
console.log(lable)
  }
  const init = async function () {
    console.log("Init...");
    await setUpCam();
    console.log("Set up cam success");
    classifier.current = Knnclassifier.create();
    modelmobilenet.current = await mobilenet.load();
  };

  useEffect(() => {
    init();

    //clean up
    return () => {};
  }, []);
  return (
    <div className="main">
      <video ref={Video} className="video" autoPlay />
      <div className="control">
        <button className="btn" onClick={()=>{
          Train(WEAR_MASK_LABLE)
        }}>Train 1</button>
        <button className="btn" onClick={()=>{
          Train(NOT_WEAR_MASK_LABLE)
        }}>Train 2</button>
        <button className="btn">Run</button>
      </div>
    </div>
  );
}

export default App;
