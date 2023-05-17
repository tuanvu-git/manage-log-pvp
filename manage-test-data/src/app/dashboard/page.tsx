// "use client";
import { Metadata } from "next";
// import { useState } from "react";

// export const metadata: Metadata = {
//   title: 'Next.js',
// };

import "./page.scss";
import { IPage } from "@/interface/IPage";
export default function Page({ params }: IPage) {
  console.log("aa", params?.abc);

  return (
    <div className="dashboard-page-component">
      <h1 className="d-none"> are You forgot insert data test today? </h1>
      <div className="list-history-container">
        <div className="w-48 text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white">
          <a
            aria-current="true"
            className="block w-full px-4 py-2 text-white bg-blue-700 border-b border-gray-200 rounded-t-lg cursor-pointer dark:bg-gray-800 dark:border-gray-600"
          >
            2023-20-20
          </a>
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
