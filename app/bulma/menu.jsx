import React from 'react'
import Switch from './switch'

export default class Menu extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      open: this.props.defaultOpen
    }
  }

  style () {
    return {
      marginBottom: this.state.open ? 15 : 0
    }
  }

  headerStyle () {
    return {
      display: 'inline-flex',
      cursor: 'pointer'
    }
  }

  styleContent () {
    return {
      marginLeft: 10
    }
  }

  toggleOpen () {
    this.setState({ open: !this.state.open })
  }

  renderIcon () {
    return this.props.icon
      ? <span
        className='icon is-small'
        style={{ color: this.props.iconColor, paddingBottom: 8 }}
        >
        <i className={'fa fa-' + this.props.icon} />
      </span>
      : null
  }

  renderSwitch () {
    return this.props.switch
      ? <Switch
        id={this.props.switchId}
        label={this.props.switchLabel}
        classes={this.props.switchClasses}
        checked={this.props.switchChecked}
        onChange={this.props.switchOnChange}
        />
      : null
  }

  render () {
    return (
      <div className='menu-wrapper' style={this.style()}>
        <div
          className='menu-header'
          style={this.headerStyle()}
          onClick={this.toggleOpen.bind(this)}
        >
          <h4
            className='menu-label'
            style={{ fontWeight: 800, color: 'black', marginTop: 0 }}
          >
            {this.props.label}
          </h4>
          {this.renderIcon()}
          <span className='icon'>
            <i
              className={this.state.open ? 'fa fa-caret-down' : 'fa fa-caret-right'}
              style={{ marginBottom: 12 }}
            />
          </span>
        </div>
        <div className='menu-content' style={this.styleContent()}>
          {this.state.open ? this.props.children : null}
        </div>
      </div>
    )
  }
}
