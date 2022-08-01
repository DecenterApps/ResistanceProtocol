import React from "react";
import "./Dashboard.css";
import {
  Flex,
  Spacer,
  Box,
  Grid,
  HStack,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from "@chakra-ui/react";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

export default function Dashboard() {
  const data = [{ name: "Page A", uv: 400, pv: 2400, amt: 2400 }];

  return (
    <div className="dashboard">
      <Box>
        <HStack spacing="10vw" marginTop={"5vh"}>
          <Box w="30vw" h="25vh" bg="teal.500" marginLeft={"5vw"}>
            <HStack>
              <StatGroup>
                <Stat>
                  <StatLabel>ETH price</StatLabel>
                  <StatNumber>1,750$</StatNumber>
                  <StatHelpText>
                    <StatArrow type="increase" />
                    7.36%
                  </StatHelpText>
                </Stat>
              </StatGroup>
              <LineChart
                width={600}
                height={300}
                data={data}
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <Line type="monotone" dataKey="uv" stroke="#8884d8" />
                <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
              </LineChart>
            </HStack>
          </Box>
          <Box w="30vw" h="20vh" bg="teal.500" marginRight={"5vw"} />
        </HStack>
      </Box>
    </div>
  );
}
