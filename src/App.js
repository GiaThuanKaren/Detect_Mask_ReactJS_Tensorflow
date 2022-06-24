import logo from "./logo.svg";
import "./App.css";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as Knnclassifier from "@tensorflow-models/knn-classifier";
import { useEffect, useRef } from "react";
const WEAR_MASK_LABLE = "WEAR_MASK_LABLE";
const NOT_WEAR_MASK_LABLE = "NOT_WEAR_MASK_LABLE";
const TIME_TRAIN_PER_SEC = 50;
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
  const Train = async function (lable) {
    console.log(`Tranning for ${lable}`)
    for (let i = 0; i < TIME_TRAIN_PER_SEC; i++) {
      console.log(
        `Progress ${parseInt(((i + 1) / TIME_TRAIN_PER_SEC) * 100)} %`
      );
      await Tranning(lable);
    }
  };

  const Tranning = function (lable) {
    return new Promise(async (resolve) => {
      const embeding = modelmobilenet.current.infer(Video.current, true);
      classifier.current.addExample(embeding, lable);
      await sleep(100);
      resolve();
    });
  };
  const RunPrediction = async function () {
    const embeding = modelmobilenet.current.infer(Video.current, true);
    const result = await classifier.current.predictClass(embeding);
    console.log(result)
    console.log(`Lable ${result.label}`)
    console.log(`Confidences ${result.confidences}`)

    await sleep(200);
    RunPrediction();
  };
  const sleep = function (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };
  const init = async function () {
    console.log("Init...");
    await setUpCam();
    console.log("Set up cam success");
    classifier.current = Knnclassifier.create();
    modelmobilenet.current = await mobilenet.load();
    console.log("Loaded Data From Tensorflow Success")
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
        <button
          className="btn"
          onClick={() => {
            Train(WEAR_MASK_LABLE);
          }}
        >
          Train 1
        </button>
        <button
          className="btn"
          onClick={() => {
            Train(NOT_WEAR_MASK_LABLE);
          }}
        >
          Train 2
        </button>
        <button className="btn" onClick={()=>{
          RunPrediction();
        }}>Run</button>
      </div>
    </div>
  );
}

export default App;
