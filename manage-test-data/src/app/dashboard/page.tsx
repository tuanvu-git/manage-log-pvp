"use client";
import { IPage } from "@/interface/IPage";
import { Report } from "@prisma/client";
import axios from "axios";
import { ListGroup } from "flowbite-react";
import moment from "moment";
import { useEffect, useState } from "react";
import "./page.scss";
export default function Page({ params }: IPage) {
  console.log(params);
  const [selectedDate, setSelectedDate] = useState(
    moment().format("yyyy-mm-dd")
  );
  const [stackMessage, setStackMessage] = useState(
    '',
  );
  const [selectedSystem, setSelectedSystem] = useState(
    "window" as "window" | "mac" | "wuo"
  );
  const [historyList, setHistoryList] = useState([] as Report[]);
  
  useEffect(() => {
    axios.get("/api/history-list").then((res) => {
      setHistoryList(res.data);
    });
  }, []);

  useEffect(()=> {
   if(!stackMessage) return;
   alert(stackMessage);
  }, [stackMessage])

  const onCommentChange = (item: Report) => {
    axios
      .post("/report/" + item.id + "/", {
        id: item.id,
        comment: item.comment,
      })
      .then((res) => {
        setStackMessage(res.data.message);
      });
  };
  
  const onSelectedSystem = (system:string) => {
    
  };

  useEffect(() => {
    const params = {
      system: selectedSystem,
      date: selectedDate,
    };

    // Use axios.get() to make the GET request with the query parameters
    axios
      .get("/report", { params })
      .then((response) => {
        console.log(response.data);
      })
      .catch((error) => {
        console.error(error);
      });
  }, [selectedSystem, selectedDate]);

  // call api get list history,

  return (
    <div className="dashboard-page-component">
      <h1 className="hidden"> are You forgot insert data test today? </h1>
      <div className="list-history-container">
        <div className="w-48">
          <ListGroup>
            <ListGroup.Item
              onClick={() => {
                console.log("TODO");
              }}
              active={true}
              href="/list-group"
            >
              Profile
            </ListGroup.Item>
            <ListGroup.Item href="/list-group">Download</ListGroup.Item>
          </ListGroup>
        </div>
      </div>
      <div className="content-wrapper">
        <h2>Dashboard AutoPatching</h2>
        <div className="summary">
          <p>2023-03-01 13:36:06 +0700</p>
          <p>Total products: 193</p>
          <p>Total runtime: 0:1:26 hour</p>
        </div>
        <div className="table-wrapper">
          <div className="wrap-button">
            <a href="/mac" className="button">
              Mac
            </a>
            <a href="/win" className="button">
              Window
            </a>
            <a href="/wuo" className="button">
              WUO
            </a>
            <a href="/win/old" className="button">
              History
            </a>
          </div>

          <h3>Summary Report</h3>
          <table className="sortable">
            <thead>
              <tr>
                <th>Total Test Success</th>
                <th>Total Test Fail</th>
                <th>Product Fail List</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="centerCell">193</td>
                <td className="centerCell">0</td>
                <td className="centerCell"></td>
              </tr>
            </tbody>
          </table>
          <br />
          <h3>Detail Report</h3>
          <table className="sortable">
            <thead>
              <tr>
                <th>Test Suite Name</th>
                <th>Time</th>
                <th>Status</th>
                <th>Log</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="centerCell">7zip_x86</td>
                <td className="centerCell">0:2 minute</td>
                <td className="centerCell test-result-step-result-cell-ok">
                  Build Passed
                </td>
                <td>
                  <a href="./7zip_x86.json.log" target="blank">
                    Log 7zip_x86
                  </a>
                </td>
                <td>
                  <input
                    className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                    type="text"
                    placeholder="Comment whatever you want to memo"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
