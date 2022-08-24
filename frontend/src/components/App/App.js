import "./App.scss";
import MainContent from "../MainContent/MainContent";
import { BrowserRouter as Router } from "react-router-dom";

function App() {
  return (
    <Router>
      <div className="app">
        <MainContent></MainContent>
      </div>
    </Router>
  );
}

export default App;
