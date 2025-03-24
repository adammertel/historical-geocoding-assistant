import React from "react";
import { observer } from "mobx-react-lite";

interface AppHiderProps {
  // Add any props if needed
}

const AppHider: React.FC<AppHiderProps> = observer(() => {
  const store = (window as any).store;

  return (
    <>
      {!store.isLoaded && (
        <div
          style={{
            position: "absolute",
            backgroundColor: "white",
            width: "100%",
            height: "100%",
            zIndex: 10,
          }}
        />
      )}
    </>
  );
});

export default AppHider;
