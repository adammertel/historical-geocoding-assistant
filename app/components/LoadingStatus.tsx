import React from "react";
import { observer } from "mobx-react-lite";
import { Message } from "./ui";

interface LoadingStatusProps {
  // Add any props if needed
}

const LoadingStatus: React.FC<LoadingStatusProps> = observer(() => {
  const store = (window as any).store;

  let loadingText = "";
  switch (store.loadingStatus) {
    case "config":
      loadingText = "Loading configuration";
      break;
    case "signing":
      loadingText = "Connecting to Google API";
      break;
    case "loading spreadsheet":
      loadingText = "Loading your spreadsheet";
      break;
    case "prompting table":
      loadingText = "Please select a table";
      break;
    default:
      loadingText = "Loading...";
  }

  return (
    <div
      className="loading-status"
      style={{
        zIndex: 1000,
        width: "100%",
        textAlign: "center",
        position: "absolute",
        top: "40%",
      }}>
      <Message>{loadingText}</Message>
    </div>
  );
});

export default LoadingStatus;
