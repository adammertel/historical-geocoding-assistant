import React from "react";
import Switch from "./switch";

export default class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: this.props.defaultOpen
    };
  }

  toggleOpen() {
    this.setState({ open: !this.state.open });
  }

  renderIcon() {
    return this.props.icon ? (
      <span
        className="menu-icon icon is-small"
        style={{ color: this.props.iconColor }}
      >
        <i className={"fa fa-" + this.props.icon} />
      </span>
    ) : null;
  }

  render() {
    return (
      <div className={"menu " + (this.state.open ? "open" : "close")}>
        <div className="menu-header" onClick={this.toggleOpen.bind(this)}>
          <h4 className="menu-label">{this.props.label}</h4>
          {this.renderIcon()}
          <span className="menu-hider icon">
            <i
              className={
                this.state.open ? "fa fa-caret-down" : "fa fa-caret-right"
              }
              style={{ marginBottom: 12 }}
            />
          </span>
        </div>
        <div className="menu-content">
          {this.state.open ? this.props.children : null}
        </div>
      </div>
    );
  }
}
