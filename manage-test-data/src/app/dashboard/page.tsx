/* eslint-disable react/jsx-key */
"use client";
import { IPage } from "@/interface/IPage";
import { Report } from "@prisma/client";
import axios from "axios";
import { Button, FileInput, Label, ListGroup, Modal, TextInput, Toast } from "flowbite-react";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import "./page.scss";
export default function Page({ params }: IPage) {
  //#region useStatet
  const currentDay = moment().format("YYYY-MM-DD");
  const [selectedDate, setSelectedDate] = useState(
    currentDay
  );
  const [stackMessage, setStackMessage] = useState(
    '',
  );
  const [selectedSystem, setSelectedSystem] = useState(
    "mac" as "win" | "mac" | "wuo"
  );
  const [historyList, setHistoryList] = useState([] as Report[]);

  const [currentReports, setCurrentReports] = useState([] as Report[])
  const [totalRecord, setTotalRecord] = useState({} as Report);
  const [isShowModal, setIsShowModel] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdatetHistoryList, setIsUpdateHistoryList] = useState(0);
  const [haveReportsToday, setHaveReportsToday] = useState(true);
  const [sortTable, setSorttable] = useState<any>({
    productName: false,
    time: false,
    buildStatus: false,
    log: false,
  });
  //#endregion useState
  //#region variable zone
  //#endregion
  //#region  useRef
  const dateRefModal = useRef<HTMLInputElement>(null);
  const fileWindowRefModal = useRef<HTMLInputElement>(null);
  const fileMacRefModal = useRef<HTMLInputElement>(null);
  const fileWUORefModal = useRef<HTMLInputElement>(null);
  //#endregion

  useEffect(() => {
    console.log('get history list');
    setIsLoading(true);

    axios.get("/api/history-list", {
      params: {
        system: selectedSystem
      }
    }).then((res: { data: any; }) => {
      let historyList: Report[] = res.data.history;
      let dateArr: any[] = [];
      for (let i = 2022; i < 2100; i++) {
        dateArr.push(i);
      }
      // historyList.sort(a,b) => {
      //   if(a.)
      // });
      historyList.sort((a, b) => {
        const sub = a.date.substring(0, 4);
        if (dateArr.includes(sub)) {
          return 0;
        }
        return -1;
      });
      const ticketReport = historyList.filter(r => {
        const sub = r.date.substring(0, 4);
        if (dateArr.includes(sub)) {
          return false;
        }
        return true;
      });
      const realReport = historyList.filter(r => {
        const sub = r.date.substring(0, 4);
        if (dateArr.includes(sub)) {
          return true;
        }
        return false;
      });

      historyList = [...realReport, ...ticketReport];
      setHistoryList(historyList);
      setIsLoading(false);
      if (historyList.length === 0) {
        setCurrentReports([]);
        return;
      }
      setSelectedDate(res.data.history[0].date);
    });

  }, [isUpdatetHistoryList, selectedSystem]);

  useEffect(() => {
    if (!stackMessage) return;
    setTimeout(() => {
      setStackMessage('');
    }, 2000);

  }, [stackMessage])

  const onCommentChange = (item: Report) => {
    const reports = [...currentReports];
    reports.find(r => r.id === item.id)!.comment = item.comment;
    setCurrentReports(reports);
    axios
      .post("api/report/", {
        id: item.id,
        comment: item.comment,
      })
      .then((res: { data: { message: any; }; }) => {
        setStackMessage(res.data.message);
      });
    console.log('on comment change', item);
  };

  const sortData = (field: string) => {
    const tmp = currentReports.slice(0).sort((report1: any, reprot2: any) => {

      if (sortTable[field]) {
        return report1[field] > reprot2[field] ? 1 : -1
      } else {
        return report1[field] > reprot2[field] ? -1 : 1
      }
    });

    setSorttable({
      ...sortTable,
      [field]: !sortTable[field]
    })
    setCurrentReports(tmp);
  }


  const executeImport = () => {
    // allow fileNull
    let date = dateRefModal.current?.value as string;
    date = moment(date).format('YYYY-MM-DD');
    const fileWindow: File | null = fileWindowRefModal.current!.files ? fileWindowRefModal.current!.files[0] : null;
    const fileMac: File | null = fileMacRefModal.current!.files ? fileMacRefModal.current!.files[0] : null;
    const fileWUO: File | null = fileWUORefModal.current!.files ? fileWUORefModal.current!.files[0] : null;
    let pattern = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
    let result = pattern.test(date);
    if (!result) {
      alert('Please input the correct date with the format "YYYY-MM-DD"');
      return;
    }
    var bodyFormData = new FormData();
    bodyFormData.append('date', date);
    fileWindow && bodyFormData.append('fileWindow', fileWindow);
    fileMac && bodyFormData.append('fileMac', fileMac);
    fileWUO && bodyFormData.append('fileWUO', fileWUO);
    setIsLoading(true);
    axios({
      method: "post",
      url: "/api/execute",
      data: bodyFormData,
      headers: { "Content-Type": "multipart/form-data" },
    })
      .then(function (response) {
        //handle success
        console.log(response);
        setStackMessage(response.data.message);
        setIsShowModel(false);
        setIsUpdateHistoryList(isUpdatetHistoryList + 1);
        setIsLoading(false);
      })
      .catch(function (response) {
        //handle error
        console.log(response);
        setIsShowModel(true);
        setIsLoading(false);
      });
  };

  const onSearchDateChange = (event: any) => {
    const date: string = moment(event.target.value).format('YYYY-MM-DD');
    setSelectedDate(date);
  }

  const executeDelete = () => {
    const date = dateRefModal.current?.value as string;
    let pattern = /^[0-9]{4}-[0-9]{2}-[0-9]{2}$/;
    let result = pattern.test(date);
    if (!result) {
      alert('Please input the correct date with the format "YYYY-MM-DD"');
      return;
    }
    setIsLoading(true);
    axios.delete('/api/execute', {
      params: {
        date: date
      }
    })
      .then(function (response) {
        //handle success
        console.log(response);
        setStackMessage(response.data.message);
        setIsShowModel(false);
        setIsUpdateHistoryList(isUpdatetHistoryList + 1);
        setIsLoading(false);
      })
      .catch(function (response) {
        //handle error
        console.log(response);
        setIsShowModel(false);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    const params = {
      system: selectedSystem,
      date: selectedDate,
    };
    // Use axios.get() to make the GET request with the query parameters
    axios
      .get("/api/report", { params })
      .then((response: { data: any; }) => {
        let reports: Report[] = response.data.reportBySystem;
        const totalRecord: Report = reports.find(re => re.isSumarry) || {} as Report;
        reports = reports.filter(re => !re.isSumarry);
        setCurrentReports(reports);
        setTotalRecord(totalRecord);
        console.log('get detail report', response.data);
        if (selectedDate === currentDay) {
          setHaveReportsToday(!!reports.length);
        }
      })
      .catch((error: any) => {
        console.error(error);
      });
  }, [selectedSystem, selectedDate, isUpdatetHistoryList]);

  // call api get list history,

  return (
    <>
      <div className="dashboard-page-component container mx-auto mt-10">
        <div className={`${isLoading ? 'flex' : 'hidden'} custom-spiner`}>
          <svg fill="none" viewBox="0 0 100 101" className="inline animate-spin text-gray-200 fill-blue-600 dark:text-gray-600 w-6 h-6 block root-spnier"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"></path><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"></path></svg>
        </div>
        <h1 className={`${haveReportsToday ? "hidden" : "flex"} items-center justify-center text-red-400`}> Did you forget to insert the test data for {currentDay}? If not, please click
          <Button className="ml-2" onClick={() => { setIsShowModel(true); dateRefModal.current!.value = currentDay; }}>
            here
          </Button>
        </h1>
        <Toast className={stackMessage ? 'custom-toast' : 'hidden'}>
          <div className={` inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-500 dark:bg-green-800 dark:text-green-200`}>
            <svg aria-hidden="true" className="w-5 h-5 text-blue-600 dark:text-blue-500" focusable="false" data-prefix="fas" data-icon="paper-plane" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path fill="currentColor" d="M511.6 36.86l-64 415.1c-1.5 9.734-7.375 18.22-15.97 23.05c-4.844 2.719-10.27 4.097-15.68 4.097c-4.188 0-8.319-.8154-12.29-2.472l-122.6-51.1l-50.86 76.29C226.3 508.5 219.8 512 212.8 512C201.3 512 192 502.7 192 491.2v-96.18c0-7.115 2.372-14.03 6.742-19.64L416 96l-293.7 264.3L19.69 317.5C8.438 312.8 .8125 302.2 .0625 289.1s5.469-23.72 16.06-29.77l448-255.1c10.69-6.109 23.88-5.547 34 1.406S513.5 24.72 511.6 36.86z"></path></svg>
          </div>
          <div className="ml-3 text-sm font-normal">
            {stackMessage}
          </div>
          <Toast.Toggle />
        </Toast>

        <div className="content-wrapper flex">
          <div className="list-history-container">
            <div className="w-48 mr-3">
              <div>History list</div>
              <TextInput
                id="search"
                type="date"
                className="my-2"
                onChange={onSearchDateChange}
              />
              <div className="scrollable">
                <ListGroup>
                  {
                    historyList.map(value =>
                      <ListGroup.Item
                        key={value.id}
                        active={selectedDate === value.date}
                        onClick={(() => { setSelectedDate(value.date) })}
                      >
                        {value.date}
                      </ListGroup.Item>
                    )
                  }
                  {historyList.length === 0 && <ListGroup.Item>No Data</ListGroup.Item>}
                </ListGroup>
              </div>

            </div>
          </div>
          <div className="flex flex-col flex-1">
            <h2>Dashboard AutoPatching</h2>
            <div className="summary">
              <p>{totalRecord.date}</p>
              <p>Total products: {currentReports.length}</p>
              <p>Total runtime: {totalRecord.time} hour</p>
            </div>
            <div className="table-wrapper">
              <div className="wrap-button">
                <a className={`${selectedSystem === 'mac' ? 'bg-blue-600' : 'bg-gray-700'} button`} onClick={() => { setSelectedSystem(('mac')) }}>
                  Mac
                </a>
                <a className={`${selectedSystem === 'win' ? 'bg-blue-600' : 'bg-gray-700'} button`} onClick={() => { setSelectedSystem(('win')) }}>
                  Win
                </a>
                <a className={`${selectedSystem === 'wuo' ? 'bg-blue-600' : 'bg-gray-700'} button`} onClick={() => { setSelectedSystem(('wuo')) }}>
                  WUO
                </a>
              </div>

              <h3>Summary Report</h3>
              <table className="sortable">
                <thead>
                  <tr>
                    <th style={{ width: 30 }}>Total Test Success</th>
                    <th style={{ width: 30 }}>Total Test Fail</th>
                    <th >Product Fail List</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="centerCell">{currentReports.filter(re => re.buildStatus === 'Build Passed').length}</td>
                    <td className="centerCell">{currentReports.filter(re => re.buildStatus === 'Build Failed').length}</td>
                    <td className="centerCell fail-list" >
                      {currentReports.filter(re => re.buildStatus !== 'Build Passed').map((re) =>
                        <span key={re.id} className="mr-1">{re.productName},</span>
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
              <br />
              <h3>Detail Report</h3>
              <table className="sortable">
                <thead>
                  <tr>
                    <th onClick={() => { sortData('productName') }}>Test Suite Name</th>
                    <th onClick={() => { sortData('time') }}>Time</th>
                    <th onClick={() => { sortData('buildStatus') }}>Status</th>
                    <th onClick={() => { sortData('productName') }}>Log</th>
                    <th onClick={() => { sortData('comment') }}>Comment</th>
                  </tr>
                </thead>
                <tbody>
                  {
                    currentReports.map(report =>
                      <tr key={report.id}>

                        <td className="centerCell">{report.productName}</td>
                        <td className="centerCell">{report.time}</td>

                        <td className={`centerCell ${report.buildStatus === 'Build Passed' ? 'test-result-step-result-cell-ok' : 'test-result-step-result-cell-failure'}`}>
                          {report.buildStatus}
                        </td>
                        <td>
                          <a href={report.filePath} target="_blank">
                            Log {report.productName}
                          </a>
                        </td>
                        <td>
                          <input
                            className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                            type="text"
                            defaultValue={report.comment}
                            onBlur={(event) => onCommentChange({ id: report.id, comment: event.target.value } as Report)}
                            placeholder="Input comment here"
                          />
                        </td>
                      </tr>
                    )
                  }
                  {currentReports.length === 0 &&
                    <tr>
                      <td colSpan={5}>No Data</td>
                    </tr>
                  }

                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
      <>
        <Modal
          dismissible
          show={isShowModal}
          onClose={() => setIsShowModel(false)}
        >
          <Modal.Header>
            Scriping insert/delete data
          </Modal.Header>
          <Modal.Body>
            <div className="space-y-6">
              <form className="flex flex-col gap-4">
                <div>
                  <div className="mb-2 block">
                    <Label
                      htmlFor="date"
                      value="Date"
                    />
                  </div>
                  <TextInput
                    id="date"
                    type="date"
                    ref={dateRefModal}
                    required={true}
                  />
                </div>
                <div id="fileUpload">
                  <div className="mb-2 block">
                    <Label
                      htmlFor="file1"
                      value="Window csv"
                    />
                  </div>
                  <FileInput
                    id="file1"
                    accept='.csv'
                    ref={fileWindowRefModal}
                  />
                </div>
                <div id="fileUpload">
                  <div className="mb-2 block">
                    <Label
                      htmlFor="file2"
                      value="Mac csv"
                    />
                  </div>
                  <FileInput
                    id="file2"
                    accept='.csv'
                    ref={fileMacRefModal}
                  />
                </div>
                <div id="fileUpload">
                  <div className="mb-2 block">
                    <Label
                      htmlFor="file3"
                      value="WUO csv"
                    />
                  </div>
                  <FileInput
                    id="file3"
                    accept='.csv'
                    ref={fileWUORefModal}
                  />
                </div>
                <Button type="button" onClick={executeImport}>
                  Execute Inset
                </Button>

                <Button type="button" onClick={executeDelete}>
                  Execute Delete
                </Button>
              </form>
            </div>
          </Modal.Body>
        </Modal>
      </>


      <div id="execute-icon" className={` h-[45px] w-[45px] fixed bottom-5 right-5 cursor-pointer`} onClick={() => { setIsShowModel(true); dateRefModal.current!.value = '' }}>
        <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" version="1.1" id="Capa_1" viewBox="0 0 50 50" xmlSpace="preserve">
          <circle style={{ fill: "#43B05C" }} cx="25" cy="25" r="25" />
          <line style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", strokeMiterlimit: 10 }} x1="25" y1="13" x2="25" y2="38" />
          <line style={{ fill: "none", stroke: "#FFFFFF", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", strokeMiterlimit: 10 }} x1="37.5" y1="25" x2="12.5" y2="25" />
        </svg>
      </div>
    </>
  );
}