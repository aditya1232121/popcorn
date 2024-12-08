import React from "react";
import ReactDOM from "react-dom/client";
 import './index.css';
import App from './App';
import Starrating from "./starrating";

const root = ReactDOM.createRoot(document.getElementById("root")); // Corrected createRoot spelling
root.render(
  <React.StrictMode>
     <App /> */
    <Starrating maxRating={10} messages={["okay", "good", "amazing"]} />
  </React.StrictMode>
);