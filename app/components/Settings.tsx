import React, { useState } from "react";
import { observer } from "mobx-react-lite";
import { Menu, MenuLabel, Button, Switch, Input } from "./ui";

interface SettingsProps {
  // Add any props if needed
}

const Settings: React.FC<SettingsProps> = observer(() => {
  const store = (window as any).store;
  const [menuStates, setMenuStates] = useState({
    general: true,
    appearance: true,
    advanced: true,
  });

  const toggleMenu = (menu: string) => {
    setMenuStates((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  return (
    <div className="panel">
      <div className="button-row right">
        <Button
          onClick={() => store.toggleSettings()}
          variant="outline"
          size="sm">
          <i className="fa fa-arrow-left"></i> Back
        </Button>
      </div>

      <h3 className="text-lg font-semibold mb-4">Settings</h3>

      <Menu className={menuStates.general ? "open" : ""}>
        <div
          className="menu-header"
          onClick={() => toggleMenu("general")}
          title="Toggle visibility">
          <i
            className={`fa fa-caret-${
              menuStates.general ? "down" : "right"
            } menu-hider`}></i>
          <MenuLabel>General</MenuLabel>
        </div>
        {menuStates.general && (
          <div className="menu-content">
            <div className="field">
              <label className="label">Auto-zoom to suggestions</label>
              <Switch
                checked={store.autoZoom}
                onCheckedChange={(checked) => store.setAutoZoom(checked)}
              />
            </div>
            <div className="field">
              <label className="label">Display suggestion markers</label>
              <Switch
                checked={store.showMarkers}
                onCheckedChange={(checked) => store.setShowMarkers(checked)}
              />
            </div>
            <div className="field">
              <label className="label">Auto-search on next place</label>
              <Switch
                checked={store.autoSearch}
                onCheckedChange={(checked) => store.setAutoSearch(checked)}
              />
            </div>
          </div>
        )}
      </Menu>

      <Menu className={menuStates.appearance ? "open" : ""}>
        <div
          className="menu-header"
          onClick={() => toggleMenu("appearance")}
          title="Toggle visibility">
          <i
            className={`fa fa-caret-${
              menuStates.appearance ? "down" : "right"
            } menu-hider`}></i>
          <MenuLabel>Appearance</MenuLabel>
        </div>
        {menuStates.appearance && (
          <div className="menu-content">
            <div className="field">
              <label className="label">Theme</label>
              <div className="select">
                <select
                  value={store.theme}
                  onChange={(e) => store.setTheme(e.target.value)}>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
            <div className="field">
              <label className="label">Marker size</label>
              <div className="select">
                <select
                  value={store.markerSize}
                  onChange={(e) => store.setMarkerSize(e.target.value)}>
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </Menu>

      <Menu className={menuStates.advanced ? "open" : ""}>
        <div
          className="menu-header"
          onClick={() => toggleMenu("advanced")}
          title="Toggle visibility">
          <i
            className={`fa fa-caret-${
              menuStates.advanced ? "down" : "right"
            } menu-hider`}></i>
          <MenuLabel>Advanced</MenuLabel>
        </div>
        {menuStates.advanced && (
          <div className="menu-content">
            <div className="field">
              <label className="label">API Key (if required)</label>
              <Input
                type="password"
                value={store.apiKey || ""}
                onChange={(e) => store.setApiKey(e.target.value)}
              />
            </div>
            <div className="field">
              <label className="label">Max suggestions</label>
              <Input
                type="number"
                min="1"
                max="20"
                value={store.maxSuggestions.toString()}
                onChange={(e) =>
                  store.setMaxSuggestions(parseInt(e.target.value, 10))
                }
              />
            </div>
            <div className="button-row">
              <Button
                onClick={() => store.resetSettings()}
                variant="destructive"
                size="sm">
                Reset to Defaults
              </Button>
            </div>
          </div>
        )}
      </Menu>
    </div>
  );
});

export default Settings;
