import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import "./MainContent.css";
import Dashboard from "../Dashboard/Dashboard";
import { Button, Progress } from "@chakra-ui/react";
import CDPs from "../CDPs/CDPs";
import animations from "../../utils/animations";

export default function MainContent({ onJoin, show }) {
  const intl = useIntl();

  const [join, setJoin] = useState(false);
  const [bAnimation, setBAnimation] = useState(true);
  const [loading, setLoading] = useState(true);

  const joinTheFight = () => {
    setJoin(true);
    onJoin(true);
  };

  useEffect(() => {
    animations.animateBackground();
  }, []);

  useEffect(() => {
    if (bAnimation) animations.animateBackground();
  }, [bAnimation]);

  return (
    <div className="app">
      {bAnimation && <canvas id="canvas" className="canvas"></canvas>}
      <div className="test-center">
        <div className={join ? "container2" : "container1"}>
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
              {!join && (
                <>
                  <h1>Resistance</h1>
                  <Button
                    variant="ghost"
                    className="btn"
                    onClick={joinTheFight}
                  >
                    Fight the inflation
                  </Button>
                </>
              )}
              {loading && join && (
                <>
                  <h1>Loading...</h1>
                  <Progress size="xs" isIndeterminate className="progress"/>
                </>
              )}
            </div>
          </div>
          <div className="center-div">
            {join && (
              <>
                {show === "Dashboard" && (
                  <Dashboard
                    bAnimation={bAnimation}
                    setBAnimation={setBAnimation}
                    parentSetLoading={setLoading}
                  />
                )}
                {show === "CDPs" && (
                  <CDPs
                    bAnimation={bAnimation}
                    setBAnimation={setBAnimation}
                  ></CDPs>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
