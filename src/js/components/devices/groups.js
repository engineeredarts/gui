import React from 'react';
import ReactTooltip from 'react-tooltip';

// material ui
import { Divider, List, ListItem, ListItemIcon, ListItemText, ListSubheader } from '@material-ui/core';
import { Add as AddIcon, Help as HelpIcon } from '@material-ui/icons';

import { AddGroup } from '../helptips/helptooltips';

export const Groups = ({ acceptedCount, changeGroup, groups, openGroupDialog, selectedGroup, showHelptips }) => {
  const { dynamic: dynamicGroups, static: staticGroups } = Object.entries(groups)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .reduce(
      (accu, [groupname, group], index) => {
        const isSelected = groupname === selectedGroup ? { backgroundColor: '#e7e7e7' } : {};
        const groupItem = (
          <ListItem classes={{ root: 'grouplist' }} button key={groupname + index} style={isSelected} onClick={() => changeGroup(groupname)}>
            <ListItemText primary={decodeURIComponent(groupname)} />
          </ListItem>
        );
        if (group.filters.length > 0) {
          accu.dynamic.push(groupItem);
        } else {
          accu.static.push(groupItem);
        }
        return accu;
      },
      { dynamic: [], static: [] }
    );

  return (
    <div>
      <div className="muted margin-bottom-small">Groups</div>
      <List>
        <ListItem classes={{ root: 'grouplist' }} button key="All" style={!selectedGroup ? { backgroundColor: '#e7e7e7' } : {}} onClick={() => changeGroup()}>
          <ListItemText primary="All devices" />
        </ListItem>
        <Divider />
        {!!dynamicGroups.length && <ListSubheader key="dynamic-groups-sub">Dynamic</ListSubheader>}
        {dynamicGroups}
        {!!staticGroups.length && <ListSubheader key="static-groups-sub">Static</ListSubheader>}
        {staticGroups}
        <ListItem
          button
          classes={{ root: 'grouplist' }}
          disabled={!acceptedCount}
          style={acceptedCount ? {} : { color: '#d4e9e7' }}
          onClick={acceptedCount ? () => openGroupDialog() : x => x}
        >
          <ListItemIcon>
            <AddIcon />
          </ListItemIcon>
          <ListItemText primary="Create a group" />
        </ListItem>
      </List>

      {showHelptips && acceptedCount && groups.length <= 1 ? (
        <div>
          <div id="onboard-5" className="tooltip help" data-tip data-for="groups-tip" data-event="click focus" style={{ bottom: '-10px' }}>
            <HelpIcon />
          </div>
          <ReactTooltip id="groups-tip" globalEventOff="click" place="bottom" type="light" effect="solid" className="react-tooltip">
            <AddGroup />
          </ReactTooltip>
        </div>
      ) : null}
    </div>
  );
};

export default Groups;
