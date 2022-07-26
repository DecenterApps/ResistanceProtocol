import "./App.scss";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Test from "../Test";
import Homepage from "../Homepage/Homepage";
import { useState } from "react";
import { IntlProvider } from "react-intl";
import messages from './messages';

function App() {
  const [locale, setLocale] = useState("en");
  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      <div className="app">
        <Router>
          <div>
            <Routes>
              <Route exact path="/" element={<Homepage />}></Route>
              <Route exact path="/test" element={<Test />}></Route>
            </Routes>
          </div>
        </Router>
      </div>
    </IntlProvider>
  );
}

export default App;
