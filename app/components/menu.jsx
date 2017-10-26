import React from 'react';
import { observer } from 'mobx-react';

import Base from './../base';
import Switch from './switch';


@observer
export default class Menu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      open: this.props.defaultOpen
    }
  }

  style() {
    return {
      marginBottom: 15
    }
  }

  headerStyle() {
    return {
      display: 'inline-flex',
      cursor: 'pointer'
    }
  }

  styleContent() {
    return {
      marginLeft: 10
    }
  }

  toggleOpen() {
    this.setState({open: !this.state.open});
  }

  renderIcon() {
    return (
      this.props.icon ?
      (
        <span className="icon is-small" style={{color: this.props.iconColor, paddingBottom: 8}}>
          <i className={'fa fa-' + this.props.icon}></i>
        </span>
      ) : null
    )
  }

  renderSwitch() {
    return (
      this.props.switch ?
      (
        <Switch
          id={this.props.switchId}
          label={this.props.switchLabel}
          classes={this.props.switchClasses}
          checked={this.props.switchChecked}
          onChange={this.props.switchOnChange}
        />
      ) : null
    )
  }

  render() {
    const store = appStore;
    
    return (
      <div className="menu-wrapper" style={this.style()} >
        <div 
          className="menu-header" 
          style={this.headerStyle()} 
        >
          <h4 
            className="menu-label" 
            style={{fontWeight: 800, color: 'black', marginTop: 0}} 
            onClick={this.toggleOpen.bind(this)}
          >
            {this.props.label}
          </h4>
          {
            this.renderIcon()
          }
          <span className="icon" >
            <i 
              className={this.state.open ? 'fa fa-caret-down' : 'fa fa-caret-right'} 
              style={{marginBottom: 15}}
            />
          </span>
        </div>
        <div className="menu-content" style={this.styleContent()}>
        {
          this.state.open ? this.props.children : null
        }
        </div>
      </div>
    )
  }
}