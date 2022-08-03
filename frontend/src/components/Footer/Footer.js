import React from "react";
import "./Footer.css";
import { HStack, Button, Tooltip,Switch } from "@chakra-ui/react";
import { BsGithub, BsFacebook, BsTwitter, BsReddit } from "react-icons/bs";
import {FaDiscord} from "react-icons/fa";

export default function Footer({bAnimation,setBAnimation}) {
  const goTo = (link) => {
    window.location.replace(link);
  };

  return (
    <footer class="site-footer">
      <HStack>
        <div className="ftr-left">
          <p className="copyright-text">Copyright &copy; 2022</p>
        </div>
        <HStack><div>Background animations</div><Switch colorScheme='teal' isChecked={bAnimation} onChange={()=>{
          setBAnimation(!bAnimation)
        }}/></HStack>
        <div className="ftr-right">
          <HStack>
            <Tooltip label="Github" placement="top">
              <Button
                onClick={() => {
                  goTo("https://github.com/DecenterApps/ResistanceProtocol");
                }}
                className="ftr-btn ftr-raise"
                leftIcon={<BsGithub />}
              ></Button>
            </Tooltip>
            <Tooltip label="Facebook" placement="top">
              <Button
                onClick={() => {
                  goTo("https://github.com/DecenterApps/ResistanceProtocol");
                }}
                className="ftr-btn ftr-raise"
                leftIcon={<BsFacebook />}
              ></Button>
            </Tooltip>
            <Tooltip label="Twitter" placement="top">
              <Button
                onClick={() => {
                  goTo("https://github.com/DecenterApps/ResistanceProtocol");
                }}
                className="ftr-btn ftr-raise"
                leftIcon={<BsTwitter />}
              ></Button>
            </Tooltip>
            <Tooltip label="Reddit" placement="top">
              <Button
                onClick={() => {
                  goTo("https://github.com/DecenterApps/ResistanceProtocol");
                }}
                className="ftr-btn ftr-raise"
                leftIcon={<BsReddit />}
              ></Button>
            </Tooltip>
            <Tooltip label="Discord" placement="top">
              <Button
                onClick={() => {
                  goTo("https://github.com/DecenterApps/ResistanceProtocol");
                }}
                className="ftr-btn ftr-raise"
                leftIcon={<FaDiscord />}
              ></Button>
            </Tooltip>
          </HStack>
        </div>
      </HStack>
    </footer>
  );
}
