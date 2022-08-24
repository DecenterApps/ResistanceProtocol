import React, { useEffect, useState } from "react";
import "./MainContent.css";
import Dashboard from "../Dashboard/Dashboard";
import { Button} from "@chakra-ui/react";
import CDPs from "../CDPs/CDPs";
import animations from "../../utils/animations";
import {
  Routes,
  Route,
  useNavigate,
} from "react-router-dom";
import WalletModal from "../WalletModal/WalletModal";
import Toolbar from "../Toolbar/Toolbar";

export default function MainContent() {
  const navigation = useNavigate();

  const [bAnimation, setBAnimation] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const joinTheFight = () => {

    navigation("dashboard");
  };

  const closeModal = () => {
    setOpenModal(false);
  };

  useEffect(() => {
    animations.animateBackground();
  }, []);

  useEffect(() => {
    if (bAnimation) animations.animateBackground();
  }, [bAnimation]);

  return (
    <div className="app">
      <WalletModal open={openModal} handleClose={closeModal}></WalletModal>
      {(window.location.href.includes("dashboard") || window.location.href.includes("cdps")) && <Toolbar onOpenModal={setOpenModal}></Toolbar>}
      {bAnimation && <canvas id="canvas" className="canvas"></canvas>}
      <div className="test-center">
        <div className={"container2"}>
          <div>
            <Routes>
              <Route
                exact
                path="/"
                element={
                  <div className="subcontainer animated bounceIn">
                    {bAnimation && (
                      <div className="content">
                        <div className="top-left"></div>
                        <div className="left-bot"></div>
                        <div className="bot-right"></div>
                        <div className="right-top"></div>
                      </div>
                    )}
                    <div className="block  style-11">
                          <h1 className="res-h1">Resistance</h1>
                          <Button
                            variant="ghost"
                            className="btn"
                            onClick={joinTheFight}
                          >
                            Fight the inflation
                          </Button>
                    </div>
                  </div>
                }
              ></Route>
              <Route
                exact
                path="/dashboard"
                element={
                  <div className="center-div">
                    <Dashboard
                      bAnimation={bAnimation}
                      setBAnimation={setBAnimation}
                    />
                  </div>
                }
              ></Route>
              <Route
                exact
                path="/cdps"
                element={
                  <div className="center-div">
                    <CDPs
                      bAnimation={bAnimation}
                      setBAnimation={setBAnimation}
                    ></CDPs>
                  </div>
                }
              ></Route>
            </Routes>
          </div>
        </div>
      </div>
    </div>
  );
}
