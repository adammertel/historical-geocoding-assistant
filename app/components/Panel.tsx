import React from "react";
import { observer } from "mobx-react-lite";
import { Menu, MenuLabel, Button } from "./ui";
import { Sheet } from "lucide-react";

interface PanelProps {
  // Add any props if needed
}

const Panel: React.FC<PanelProps> = observer(() => {
  const store = (window as any).store;

  if (!store.shouldRenderApp) {
    return null;
  }

  console.log("store", store);

  return (
    <div className="panel">
      <div className="button-row right">
        <Button
          onClick={() => store.toggleSettings()}
          variant="outline"
          size="sm">
          <i className="fa fa-cog"></i> Settings
        </Button>
      </div>

      <Menu className="open">
        <div className="menu-header">
          <MenuLabel>Current Record</MenuLabel>
        </div>
        <div className="menu-content">
          {/* Current record information and controls */}
          <div className="suggestion-section">
            <div className="button-row">
              <Button
                onClick={() => store.prevPlace()}
                disabled={!store.canPrevPlace()}
                variant="outline"
                size="sm">
                <i className="fa fa-chevron-left"></i> Prev
              </Button>
              <Button
                onClick={() => store.nextPlace()}
                disabled={!store.canNextPlace()}
                variant="outline"
                size="sm">
                Next <i className="fa fa-chevron-right"></i>
              </Button>
              <span className="text-dimmed">
                {store.placeIndex + 1} / {store.rowsNumber}
              </span>
            </div>

            {/* Current place details */}
            <table className="table centered">
              <tbody>
                <tr>
                  <td>Name:</td>
                  <td>
                    <strong>{store.currentPlacename}</strong>
                  </td>
                </tr>
                <tr>
                  <td>Row:</td>
                  <td>{store.currentRow}</td>
                </tr>
                {/* Add more place details here */}
              </tbody>
            </table>
          </div>
        </div>
      </Menu>

      <Menu className="open">
        <div className="menu-header">
          <MenuLabel>Suggestions</MenuLabel>
        </div>
        <div className="menu-content">
          {/* Suggestions section */}
          <div className="suggestion-section">
            {store.combinedSuggestions.length > 0 ? (
              <div className="list">
                {store.combinedSuggestions.map((suggestion: any, i: number) => (
                  <div key={i} className="suggestion">
                    <Button
                      onClick={() => store.selectSuggestion(suggestion)}
                      size="sm"
                      variant="outline">
                      <i className="fa fa-check"></i>
                    </Button>
                    <span className="suggestion-label">{suggestion.name}</span>
                    {suggestion.country && (
                      <span className="suggestion-country">
                        {suggestion.country}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="notification">No suggestions found</div>
            )}
          </div>
        </div>
      </Menu>

      <Menu className="open">
        <div className="menu-header">
          <MenuLabel>Selected Location</MenuLabel>
        </div>
        <div className="menu-content">
          {/* Selected location details */}
          {store.hasLocationSelected ? (
            <>
              <table className="table centered">
                <tbody>
                  <tr>
                    <td>Name:</td>
                    <td>
                      <strong>{store.selectedLocation.name}</strong>
                    </td>
                  </tr>
                  <tr>
                    <td>Coordinates:</td>
                    <td>
                      {store.selectedLocation.lat.toFixed(4)},{" "}
                      {store.selectedLocation.lng.toFixed(4)}
                    </td>
                  </tr>
                  {/* Add more selected location details here */}
                </tbody>
              </table>
              <div className="button-row">
                <Button
                  onClick={() => store.saveLocation()}
                  variant="default"
                  size="sm">
                  <i className="fa fa-save"></i> Save & Continue
                </Button>
              </div>
            </>
          ) : (
            <div className="notification">No location selected</div>
          )}
        </div>
      </Menu>
    </div>
  );
});

export default Panel;
