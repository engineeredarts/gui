import React from 'react';

import TablePagination from '@material-ui/core/TablePagination';
import IconButton from '@material-ui/core/IconButton';

import FirstPageIcon from '@material-ui/icons/FirstPage';
import LastPageIcon from '@material-ui/icons/LastPage';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import { TextField } from '@material-ui/core';

const defaultRowsPerPageOptions = [10, 20, 50];

const TablePaginationActions = props => {
  const { count, page, rowsPerPage, onChangePage } = props;
  const currentPage = page + 1;

  const pages = Math.ceil(count / rowsPerPage);
  return (
    <div className="flexbox">
      <IconButton onClick={() => onChangePage(1)} disabled={currentPage === 1}>
        <FirstPageIcon />
      </IconButton>
      <IconButton onClick={() => onChangePage(currentPage - 1)} disabled={currentPage === 1}>
        <KeyboardArrowLeft />
      </IconButton>
      <div className="flexbox" style={{ alignItems: 'baseline' }}>
        <TextField
          value={currentPage}
          onChange={e => onChangePage(e.target.value)}
          margin="dense"
          style={{ minWidth: '40px', maxWidth: '40px', marginRight: '10px' }}
        />{' '}
        / {pages}
      </div>
      <IconButton onClick={() => onChangePage(currentPage + 1)} disabled={currentPage >= Math.ceil(count / rowsPerPage)}>
        <KeyboardArrowRight />
      </IconButton>
      <IconButton onClick={() => onChangePage(Math.max(1, Math.ceil(count / rowsPerPage)))} disabled={currentPage >= Math.ceil(count / rowsPerPage) - 1}>
        <LastPageIcon />
      </IconButton>
    </div>
  );
};

export default class Pagination extends React.PureComponent {
  render() {
    const { className, page, onChangeRowsPerPage, ...remainingProps } = this.props;
    return (
      <TablePagination
        className={`flexbox margin-top ${className}`}
        classes={{ spacer: 'flexbox no-basis' }}
        component="div"
        labelDisplayedRows={() => ''}
        rowsPerPageOptions={defaultRowsPerPageOptions}
        onChangeRowsPerPage={e => onChangeRowsPerPage(e.target.value)}
        page={page - 1}
        ActionsComponent={TablePaginationActions}
        {...remainingProps}
      />
    );
  }
}
