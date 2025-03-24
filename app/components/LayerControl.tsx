import React, { useState, useEffect } from "react";
import { observer } from "mobx-react-lite";
import { Menu, MenuLabel, MenuList, MenuItem } from "./ui";

interface LayerControlProps {
  // Add any props if needed
}

const LayerControl: React.FC<LayerControlProps> = observer(() => {
  const store = (window as any).store;
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({
    basemaps: true,
    overlays: true,
  });

  const toggleMenu = (menu: string) => {
    setOpenMenus({
      ...openMenus,
      [menu]: !openMenus[menu],
    });
  };

  useEffect(() => {
    if ((window as any).map) {
      // Add your map initialization logic here if needed
    }
  }, []);

  if (!store.shouldRenderApp) {
    return null;
  }

  const basemaps = (window as any).basemaps || [];
  const overlays = (window as any).overlaymaps || {};

  return (
    <div className="layercontrol-wrapper">
      <div className="menu-wrapper">
        <Menu className={openMenus.basemaps ? "open" : ""}>
          <div
            className="menu-header"
            onClick={() => toggleMenu("basemaps")}
            title="Toggle visibility">
            <i
              className={`fa fa-caret-${
                openMenus.basemaps ? "down" : "right"
              } menu-hider`}></i>
            <MenuLabel>Basemaps</MenuLabel>
          </div>
          {openMenus.basemaps && (
            <div className="menu-content">
              <MenuList>
                {Object.keys(basemaps).map((bmKey) => {
                  const bm = basemaps[bmKey];
                  return (
                    <MenuItem key={bmKey}>
                      <label className="checkbox">
                        <input
                          type="radio"
                          name="basemap"
                          checked={store.basemap === bmKey}
                          onChange={() => store.changeBasemap(bmKey)}
                        />
                        {bm.name}
                      </label>
                    </MenuItem>
                  );
                })}
              </MenuList>
            </div>
          )}
        </Menu>

        <Menu className={openMenus.overlays ? "open" : ""}>
          <div
            className="menu-header"
            onClick={() => toggleMenu("overlays")}
            title="Toggle visibility">
            <i
              className={`fa fa-caret-${
                openMenus.overlays ? "down" : "right"
              } menu-hider`}></i>
            <MenuLabel>Overlays</MenuLabel>
          </div>
          {openMenus.overlays && (
            <div className="menu-content">
              <MenuList>
                {Object.keys(overlays).map((ovKey) => {
                  const ov = overlays[ovKey];
                  return (
                    <MenuItem key={ovKey}>
                      <label className="checkbox">
                        <input
                          type="checkbox"
                          checked={store.overlays?.includes(ovKey)}
                          onChange={() => store.toggleOverlay(ovKey)}
                        />
                        {ov.name}
                      </label>
                    </MenuItem>
                  );
                })}
              </MenuList>
            </div>
          )}
        </Menu>
      </div>
    </div>
  );
});

export default LayerControl;
