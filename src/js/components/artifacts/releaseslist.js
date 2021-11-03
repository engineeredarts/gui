import React, { useState, useRef, useEffect } from 'react';
import pluralize from 'pluralize';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import InfiniteLoader from 'react-window-infinite-loader';

// material ui
import { Button, ButtonGroup, ListItem, ListItemText, Menu, MenuItem, TextField, Typography } from '@material-ui/core';
import { ArrowDropDown as ArrowDropDownIcon, KeyboardArrowRight as KeyboardArrowRightIcon, Sort as SortIcon } from '@material-ui/icons';

import Loader from '../common/loader';
import { SORTING_OPTIONS } from '../../constants/appConstants';
import { useDebounce } from '../../utils/debouncehook';

const sortingOptions = {
  Name: 'Name',
  modified: 'Date modified'
};

const buttonStyle = { border: 'none', textTransform: 'none' };

const ReleaseListItem = ({ data, index, style }) => {
  const { onSelect, releases, selectedRelease } = data;
  const release = releases[index];
  let isSelected = index === 0;
  isSelected = release && selectedRelease ? release.Name === selectedRelease.Name : isSelected;
  return (
    <ListItem button className={`repository-list-item ${isSelected ? 'active' : ''}`} onClick={() => onSelect(release)} style={style}>
      {!release?.Name ? (
        <Loader show />
      ) : (
        <ListItemText>
          <div className="flexbox">
            <div className="inline-block">
              <Typography variant="subtitle2">{release.Name}</Typography>
              <Typography variant="body2" className="muted">{`${release.Artifacts.length} ${pluralize('Artifact', release.Artifacts.length)}`}</Typography>
            </div>
            <KeyboardArrowRightIcon className={isSelected ? '' : 'indicator'} />
          </div>
        </ListItemText>
      )}
    </ListItem>
  );
};

const listItemSize = 63;

export const ReleasesList = ({ loading, onSelect, releasesListState, releases, selectedRelease, setReleasesListState }) => {
  const [anchorEl, setAnchorEl] = useState();
  const [visibleSection, setVisibleSection] = useState({});
  const [refreshTrigger, setRefreshTrigger] = useState(false);
  const outerRef = useRef();

  const {
    searchTerm,
    sort: { attribute, direction },
    searchTotal,
    total
  } = releasesListState;

  const debouncedVisibleSection = useDebounce(visibleSection, 300);

  useEffect(() => {
    setReleasesListState({ visibleSection: debouncedVisibleSection });
  }, [refreshTrigger, debouncedVisibleSection]);

  const searchUpdated = ({ target: { value } }) => {
    setReleasesListState({ page: 1, searchTerm: value, visibleSection: {} });
  };

  const handleToggle = event => {
    const anchor = anchorEl ? null : event?.currentTarget.parentElement;
    setAnchorEl(anchor);
  };

  const handleSortSelection = ({ target }) => {
    setReleasesListState({ page: 1, sort: { attribute: target.getAttribute('value') }, visibleSection: {} });
    handleToggle();
  };

  const handleSortDirection = () => {
    const changedDirection = direction === SORTING_OPTIONS.asc ? SORTING_OPTIONS.desc : SORTING_OPTIONS.asc;
    setReleasesListState({ page: 1, sort: { direction: changedDirection }, visibleSection: {} });
    handleToggle();
  };

  const loadMoreItems = () => setRefreshTrigger(!refreshTrigger);

  const onScroll = ({ scrollOffset }, height) => {
    if (!outerRef.current) {
      return;
    }
    const start = Math.max(1, Math.round(scrollOffset / listItemSize));
    const end = start + Math.round(height / listItemSize);
    setVisibleSection({ start, end });
  };

  const isItemLoaded = index => !!releases[index]?.Name;

  const itemCount = (searchTerm ? searchTotal : total) || releases.length;
  return (
    <div className="repository-list flexbox column">
      <div className="flexbox center-aligned">
        <h3>Releases</h3>
        <TextField placeholder="Filter" className="search" onChange={searchUpdated} style={{ marginLeft: 30, marginTop: 0 }} value={searchTerm} />
      </div>
      {searchTerm && searchTotal !== total ? <p className="muted">{`Filtered from ${total} ${pluralize('Release', total)}`}</p> : <div />}
      <ButtonGroup className="muted" size="small">
        <Button onClick={handleSortDirection} endIcon={<SortIcon className={`sortIcon ${direction === SORTING_OPTIONS.desc}`} />} style={buttonStyle}>
          {sortingOptions[attribute]}
        </Button>
        <Button size="small" onClick={handleToggle} style={buttonStyle}>
          <ArrowDropDownIcon />
        </Button>
      </ButtonGroup>
      <Menu id="sorting-menu" anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={handleToggle} variant="menu">
        {Object.entries(sortingOptions).map(([value, title]) => (
          <MenuItem key={`sorting-option-${value}`} onClick={handleSortSelection} style={buttonStyle} value={value}>
            {title}
          </MenuItem>
        ))}
      </Menu>

      {loading ? (
        <Loader show={loading} />
      ) : !itemCount ? (
        <p className="margin-top muted align-center margin-right">There are no Releases {!searchTotal && total ? `for ${searchTerm}` : 'yet'}</p>
      ) : (
        // the wrapping <div /> is needed to allow the AutoSizer to properly autosize the release list,
        // otherwise it would traverse to the closest relative containing div, resulting in a false size/ potentially hidden list items
        <div className="relative">
          <AutoSizer>
            {({ height, width }) => (
              <InfiniteLoader isItemLoaded={isItemLoaded} itemCount={itemCount} loadMoreItems={loadMoreItems}>
                {({ onItemsRendered, ref }) => (
                  <FixedSizeList
                    outerRef={outerRef}
                    height={height}
                    width={width}
                    itemSize={listItemSize}
                    itemCount={itemCount}
                    itemData={{ onSelect, releases, selectedRelease }}
                    overscanCount={5}
                    onItemsRendered={onItemsRendered}
                    onScroll={e => onScroll(e, height)}
                    ref={ref}
                  >
                    {ReleaseListItem}
                  </FixedSizeList>
                )}
              </InfiniteLoader>
            )}
          </AutoSizer>
        </div>
      )}
    </div>
  );
};

export default ReleasesList;
