import logo from "./logo.svg";
import "./App.css";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";
import * as Knnclassifier from "@tensorflow-models/knn-classifier";
import { useEffect, useRef, useState } from "react";
const WEAR_MASK_LABLE = "WEAR_MASK_LABLE";
const NOT_WEAR_MASK_LABLE = "NOT_WEAR_MASK_LABLE";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Legend,
  Bar,
} from "recharts";
const WEARING_NOT_CORRECT = "WEARING_NOT_CORRECT";
const TIME_TRAIN_PER_SEC = 100;
function App() {
  const [Index, SetIndex] = useState(0);
  const [percent, Setpercent] = useState(0);
  const [labelArr, SetlabelArr] = useState([]);
  const [result, SetResult] = useState([]);
  const [textLable, SetTextLable] = useState("");
  const Video = useRef();
  const inputEle = useRef();
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
    console.log(`Tranning for ${lable}`);
    for (let i = 0; i < TIME_TRAIN_PER_SEC; i++) {
      console.log(
        `Progress ${parseInt(((i + 1) / TIME_TRAIN_PER_SEC) * 100)} %`
      );
      await Tranning(lable);
    }

    SetIndex((prev) => prev + 1);
    console.log(`Tranning done for ${lable}`);
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
    // console.log(result);
    // console.log(`Lable ${result.label}`);
    // console.log(`Confidences `, );
    console.log();
    SetResult([{ result: result.label, ...result.confidences }]);
    await sleep(400);
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
    console.log("Loaded Data From Tensorflow Success");
  };
  const ShowOnChart = function () {};

  useEffect(() => {
    init();

    //clean up
    return () => {};
  }, []);
  const data = [
    {
      name: "Confidences",
      pv: 50,
      uv: 40,
    },
  ];
  // console.log(textLable)
  return (
    <div className="main">
      <div className="VideoBtnSection">
        <video ref={Video} className="video" autoPlay />
        <div className="control">
          <label>
            {labelArr.length> 0 && Index< labelArr.length
              ? " Trainning for " + labelArr[Index]?.text
              : ""}
          </label>
          {labelArr.length > 0 ? (
            <button
              className="btn"
              onClick={() => {
                if (labelArr.length > 0) {
                  // const ele = .shift();
                  Train(labelArr[Index].text);
                  //
                } else alert("Không có gì để tranning .. Vui lòng add Sample");
              }}
            >
              Tranning {labelArr.length> 0 && Index< labelArr.length  ? labelArr[Index].text : ""}
            </button>
          ) : (
            ""
          )}
        </div>

        <input
          ref={inputEle}
          value={textLable}
          onChange={(e) => {
            SetTextLable(e.target.value);
          }}
        />
        <button
          onClick={() => {
            SetTextLable("");
            inputEle.current.focus();
            SetlabelArr((prev) => [
              ...prev,
              {
                text: textLable,
                color: "#" + Math.floor(Math.random() * 16777215).toString(16),
              },
            ]);
          }}
        >
          Add Label
        </button>
        <button
          className="btn"
          onClick={() => {
            RunPrediction();
          }}
        >
          Run
        </button>
      </div>

      <div>
        <BarChart width={730} height={250} data={result}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          {labelArr.length > 0
            ? labelArr.map((item, idx) => {
                return <Bar dataKey={item.text} fill={item.color} />;
              })
            : ""}
        </BarChart>
      </div>
    </div>
  );
}

export default App;
