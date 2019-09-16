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
      <span className="menu-icon icon is-small">
        <i className={"fa fa-" + this.props.icon} />
      </span>
    ) : null;
  }

  render() {
    const classes = ["menu"];
    classes.push(this.state.open ? "open" : "close");

    if (
      this.props.additionalClasses &&
      this.props.additionalClasses.length &&
      Array.isArray(this.props.additionalClasses)
    ) {
      this.props.additionalClasses.forEach(c => classes.push(c));
    }

    return (
      <div className={classes.join(" ")}>
        <div className="menu-header" onClick={this.toggleOpen.bind(this)}>
          {this.renderIcon()}
          <h6 className="menu-label title is-6">{this.props.label}</h6>
          <span className="menu-hider icon">
            <i
              className={
                " " +
                (this.state.open ? "fa fa-caret-down" : "fa fa-caret-right")
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
