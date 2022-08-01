import React from "react";
import { useState, useEffect } from "react";
import Sidebar from "../Sidebar/Sidebar";
import MainContent from "../MainContent/MainContent";
import "./Homepage.scss";
import { useWeb3React } from "@web3-react/core";
import MyModal from "../MyModal";

export default function Homepage() {
  const [openModal, setOpenModal] = useState(false);
  const [contract, setContract] = useState();
  const { library, chainId, account, deactivate, active } = useWeb3React();
  const [join,setJoin]=useState(false)

  const closeModal = () => {
    setOpenModal(false);
  };

  const refreshState = () => {
    window.localStorage.setItem("provider", undefined);
  };

  const disconnect = () => {
    refreshState();
    deactivate();
  };

  useEffect(() => {
    if (library) {
      //const contract1 = new library.eth.Contract();
      //setContract(contract1);
    }
  }, [library]);
  return (
    <div className={`app `}>
        <MyModal open={openModal} handleClose={closeModal}></MyModal>
      {join && <Sidebar
        onOpenModal={setOpenModal}
        onDisconnect={disconnect}
      />}
      <MainContent onJoin={setJoin}/>
    </div>
  );
}
