import React from 'react';
import { Link } from 'react-router-dom';
import SearchInput from 'react-search-input';
import ReactTooltip from 'react-tooltip';
import pluralize from 'pluralize';

import TextField from '@material-ui/core/TextField';
import Icon from '@material-ui/core/Icon';
import Drawer from '@material-ui/core/Drawer';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Divider from '@material-ui/core/Divider';
import Autosuggest, { defaultProps } from '@plan-three/material-ui-autosuggest';

import CloseIcon from '@material-ui/icons/Close';
import HelpIcon from '@material-ui/icons/Help';

import { CreateDeploymentForm } from '../helptips/helptooltips';

export default class ScheduleForm extends React.Component {
  constructor(props, context) {
    super(props, context);
    var disabled = false;
    var group = null;
    /* if single device */
    if (this.props.device) {
      disabled = true;
    }
    this.state = {
      disabled: disabled,
      group: group,
      showDevices: false
    };
  }

  _handleGroupValueChange(chosenRequest, index) {
    var group;
    if (index !== -1) {
      group = chosenRequest.text;
    } else {
      var result = this.props.groups.filter(o => {
        return o == chosenRequest;
      });
      group = result.length ? result[0] : null;
    }
    this.setState({ groupErrorText: group ? '' : 'Please select a group from the list' });
    this._sendUpToParent(group, 'group');
  }
  _handleGroupInputChange() {
    this.setState({ groupErrorText: 'Please select a group from the list' });
    this._sendUpToParent(null, 'group');
  }

  _handleArtifactValueChange(chosenRequest, index) {
    var artifact;
    if (index !== -1) {
      artifact = this.props.artifacts[index];
    } else {
      var result = this.props.artifacts.filter(o => {
        return o.name == chosenRequest;
      });
      artifact = result.length ? result[0] : null;
    }
    this.setState({ autoCompleteErrorText: artifact ? '' : 'Choose an Artifact to be deployed' });
    this._sendUpToParent(artifact, 'artifact');
  }
  _handleArtifactInputChange() {
    this.setState({ autoCompleteErrorText: 'Choose an Artifact to be deployed' });
    this._sendUpToParent(null, 'artifact');
  }
  _clearOnClick(ref) {
    this.refs[ref].setState({ searchText: '' });
    this.refs[ref].focus();
    this._sendUpToParent(null, ref);
  }

  _sendUpToParent(val, attr) {
    // send params to parent with dialog holder
    this.props.deploymentSettings(val, attr);
  }

  _showDevices() {
    this.setState({ showDevices: !this.state.showDevices });
  }

  searchUpdated(term) {
    this.setState({ searchTerm: term }); // needed to force re-render
  }

  render() {
    var artifactItems = this.props.artifacts.reduce((accu, artifact, i) => {
      accu.push({
        text: artifact.name,
        value: (
          <MenuItem component={Link} to={artifact} key={i}>
            {artifact.name}
          </MenuItem>
        )
      });
      return accu;
    }, []);

    var groupItems = [];
    if (this.props.device) {
      // If single device, don't show groups
      groupItems[0] = {
        text: this.props.device.id,
        value: (
          <MenuItem component={Link} to={this.props.device.id} key={this.props.device.id}>
            {this.props.device.id}
          </MenuItem>
        )
      };
    } else {
      groupItems[0] = {
        text: 'All devices',
        value: (
          <MenuItem component={Link} to="All devices" key="All">
            All devices
          </MenuItem>
        )
      };
      groupItems = this.props.groups.reduce((accu, group, i) => {
        accu.push({
          text: decodeURIComponent(group),
          value: (
            <MenuItem component={Link} to={group} key={i}>
              {decodeURIComponent(group)}
            </MenuItem>
          )
        });
        return accu;
      }, groupItems);
    }

    var device_types = this.props.artifact ? this.props.artifact.device_types_compatible : [];
    device_types = device_types.join(', ');

    var tmpDevices = [];
    if (this.refs.search && this.props.filteredDevices) {
      var namefilter = ['id'];
      tmpDevices = this.props.filteredDevices.filter(this.refs.search.filter(namefilter));
    }

    var devices = <p>No devices</p>;

    if (tmpDevices) {
      devices = tmpDevices.map((item, index) => {
        var idFilter = `id=${item.id}`;

        return (
          <div className="hint--bottom hint--medium" style={{ width: '100%' }} aria-label={item.id} key={index}>
            <p className="text-overflow">
              <Link to={`/devices/${idFilter}`}>{item.id}</Link>
            </p>
          </div>
        );
      }, this);
    }

    var group = this.props.group && this.props.group !== 'All devices' ? `group=${encodeURIComponent(this.props.group)}` : '';
    var deviceList = (
      <div className="slider">
        <IconButton
          className="closeSlider"
          onClick={() => this._showDevices()}
          style={{
            borderRadius: '30px',
            fontSize: '16px',
            width: '40px',
            height: '40px',
            position: 'absolute',
            left: '-18px',
            backgroundColor: 'rgba(255,255,255,1)'
          }}
        >
          <CloseIcon />
        </IconButton>
        <SearchInput style={{ marginBottom: '8px' }} className="search" ref="search" onChange={term => this.searchUpdated(term)} placeholder="Search devices" />
        {devices}
        <p className={tmpDevices.length ? 'hidden' : 'italic'}>No devices in this group match the device type or search term.</p>
        <Divider />
        <p>
          <Link to={`/devices/${group}`}>{group ? 'Go to group' : 'Go to devices'}></Link>
        </p>
      </div>
    );

    var devicesLength = this.props.deploymentDevices ? this.props.deploymentDevices.length : '0';

    return (
      <div style={{ overflow: 'visible', height: '400px' }}>
        <Drawer
          ref="devicesNav"
          docked={false}
          opensecondary="true"
          style={this.state.showDevices ? { overflow: 'visible' } : { overflow: 'hidden' }}
          open={this.state.showDevices}
          overlayStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
          onRequestChange={() => this._showDevices()}
          width={320}
        >
          {deviceList}
        </Drawer>

        <form>
          <div style={{ display: 'block', marginBottom: '15px' }}>
            <Autosuggest
              ref="artifact"
              helperText="Select target artifact"
              suggestions={artifactItems}
              onNewRequest={(request, index) => this._handleArtifactValueChange(request, index)}
              onChange={() => this._handleArtifactInputChange()}
              label="Select target artifact"
              fuzzySearchOpts={{
                ...defaultProps.fuzzySearchOpts,
                keys: ['text']
              }}
              openOnFocus={true}
              listStyle={{ overflow: 'auto', maxHeight: '360px' }}
              errorStyle={{ color: 'rgb(171, 16, 0)' }}
              errorText={this.state.autoCompleteErrorText}
              onClick={() => this._clearOnClick('artifact')}
            />
            <TextField
              disabled={true}
              placeholder="Device types"
              label="Device types"
              value={device_types}
              underlineDisabledStyle={{ borderBottom: 'none' }}
              style={{ verticalAlign: 'top', width: '400px' }}
              multiLine
              errorStyle={{ color: 'rgb(171, 16, 0)' }}
              className={this.props.artifact ? 'margin-left' : 'hidden'}
            />

            <p className={artifactItems.length ? 'hidden' : 'info'} style={{ marginTop: '0' }}>
              <Icon className="material-icons" style={{ marginRight: '4px', fontSize: '18px', top: '4px', color: 'rgb(171, 16, 0)' }}>
                error_outline
              </Icon>
              There are no artifacts available. <Link to="/artifacts">Upload one to the repository</Link> to get started.
            </p>
          </div>

          <div style={{ display: 'block' }}>
            <div className={this.state.disabled ? 'hidden' : 'inline-block'}>
              <Autosuggest
                ref="group"
                helperText="Select target group"
                suggestions={groupItems}
                onNewRequest={(...args) => this._handleGroupValueChange(...args)}
                onUpdateInput={() => this._handleGroupInputChange()}
                label="Select target group"
                fuzzySearchOpts={{
                  ...defaultProps.fuzzySearchOpts,
                  keys: ['text']
                }}
                openOnFocus={true}
                listStyle={{ overflow: 'auto', maxHeight: '360px' }}
                errorStyle={{ color: 'rgb(171, 16, 0)' }}
                errorText={this.state.groupErrorText}
                disabled={!this.props.hasDevices}
                onClick={() => this._clearOnClick('group')}
              />

              <p className={this.props.hasDevices ? 'hidden' : 'info'} style={{ marginTop: '0' }}>
                <Icon className="material-icons" style={{ marginRight: '4px', fontSize: '18px', top: '4px', color: 'rgb(171, 16, 0)' }}>
                  error_outline
                </Icon>
                There are no connected devices.{' '}
                <span className={this.props.hasPending ? null : 'hidden'}>
                  <Link to="/devices/pending">Accept pending devices</Link> to get started.
                </span>
              </p>
            </div>

            <div style={{ width: '100%' }} className={this.state.disabled ? 'inline-block' : 'hidden'}>
              <TextField
                style={{ width: '100%' }}
                value={this.props.device ? this.props.device.device_id : ''}
                ref="device"
                label="Device"
                disabled={this.state.disabled}
                underlineDisabledStyle={{ borderBottom: 'none' }}
                errorStyle={{ color: 'rgb(171, 16, 0)' }}
              />
            </div>

            {this.props.showHelptips && (this.props.hasDevices && (this.props.artifacts || []).length) ? (
              <div style={{ position: 'relative' }}>
                <div
                  id="onboard-13"
                  className={this.props.hasDeployments ? 'tooltip help' : 'tooltip help highlight'}
                  data-tip
                  data-for="create-deployment1-tip"
                  data-event="click focus"
                  style={{ top: '-75px', left: '45%' }}
                >
                  <HelpIcon />
                </div>
                <ReactTooltip id="create-deployment1-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
                  <CreateDeploymentForm />
                </ReactTooltip>
              </div>
            ) : null}
          </div>

          <div className="margin-top">
            <p className={tmpDevices ? null : 'hidden'}>
              {this.props.filteredDevices ? this.props.filteredDevices.length : '0'} of {devicesLength} {pluralize('devices', devicesLength)} will be updated.{' '}
              <span onClick={() => this._showDevices()} className={this.state.disabled ? 'hidden' : 'link'}>
                View the devices
              </span>
            </p>
            <p className={this.props.hasDevices && artifactItems.length ? 'info' : 'hidden'}>
              <Icon className="material-icons" style={{ marginRight: '4px', fontSize: '18px', top: '4px' }}>
                info_outline
              </Icon>
              The deployment will skip any devices that are already on the target artifact version, or that have a different device type.
            </p>
          </div>
        </form>
      </div>
    );
  }
}
