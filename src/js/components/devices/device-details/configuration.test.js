import React from 'react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import thunk from 'redux-thunk';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { defaultState, undefineds } from '../../../../../tests/mockData';
import Configuration, { ConfigEditingActions, ConfigUpdateFailureActions, ConfigEmptyNote, ConfigUpdateNote, ConfigUpToDateNote } from './configuration';

const mockStore = configureStore([thunk]);

describe('tiny components', () => {
  [ConfigEditingActions, ConfigUpdateFailureActions, ConfigUpdateNote, ConfigEmptyNote, ConfigUpToDateNote].forEach(async Component => {
    it(`renders ${Component.displayName || Component.name} correctly`, () => {
      const { baseElement } = render(
        <Component
          isAccepted={true}
          isSetAsDefault={true}
          isUpdatingConfig={true}
          onCancel={jest.fn}
          onSetAsDefaultChange={jest.fn}
          onSubmit={jest.fn}
          setShowLog={jest.fn}
          updated_ts="testgroup"
        />
      );
      const view = baseElement.firstChild;
      expect(view).toMatchSnapshot();
      expect(view).toEqual(expect.not.stringMatching(undefineds));
    });
  });
});

describe('Configuration Component', () => {
  let store;
  beforeEach(() => {
    store = mockStore({ ...defaultState });
  });
  const reportedTime = '2019-01-01T09:25:01.000Z';
  it('renders correctly', async () => {
    const { baseElement } = render(
      <Provider store={store}>
        <Configuration
          device={{
            ...defaultState.devices.byId.a1,
            config: {
              configured: { uiPasswordRequired: true, foo: 'bar', timezone: 'GMT+2' },
              reported: { uiPasswordRequired: true, foo: 'bar', timezone: 'GMT+2' },
              updated_ts: defaultState.devices.byId.a1.updated_ts,
              reported_ts: reportedTime
            }
          }}
          abortDeployment={jest.fn}
          applyDeviceConfig={jest.fn}
          getDeviceLog={jest.fn}
          getSingleDeployment={jest.fn}
          saveGlobalSettings={jest.fn}
          setDeviceConfig={jest.fn}
        />
      </Provider>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });

  it('works as expected', async () => {
    const applyMock = jest.fn().mockRejectedValueOnce().mockResolvedValueOnce({});
    const submitMock = jest.fn().mockResolvedValueOnce({}).mockResolvedValueOnce({});
    let device = {
      ...defaultState.devices.byId.a1,
      config: {
        configured: {},
        reported: {},
        updated_ts: defaultState.devices.byId.a1.updated_ts,
        reported_ts: reportedTime
      }
    };
    let ui = (
      <MemoryRouter>
        <Provider store={store}>
          <Configuration
            device={device}
            abortDeployment={jest.fn}
            applyDeviceConfig={applyMock}
            getDeviceLog={jest.fn}
            getSingleDeployment={jest.fn}
            saveGlobalSettings={jest.fn}
            setDeviceConfig={submitMock}
          />
        </Provider>
      </MemoryRouter>
    );
    const { rerender } = render(ui);
    expect(screen.queryByRole('button', { name: /import configuration/i })).not.toBeInTheDocument();
    while (screen.queryByRole('button', { name: /edit/i })) {
      userEvent.click(screen.getByRole('button', { name: /edit/i }));
      await waitFor(() => rerender(ui));
    }
    expect(screen.getByRole('button', { name: /import configuration/i })).toBeInTheDocument();
    expect(document.querySelector('.MuiFab-root')).toBeDisabled();
    userEvent.type(screen.getByPlaceholderText(/key/i), 'testKey');
    userEvent.type(screen.getByPlaceholderText(/value/i), 'testValue');
    expect(document.querySelector('.MuiFab-root')).not.toBeDisabled();
    userEvent.click(screen.getByRole('checkbox', { name: /save/i }));
    await act(async () => await userEvent.click(screen.getByRole('button', { name: /save/i })));
    await waitFor(() => rerender(ui));

    expect(screen.getByText(/Configuration could not be updated on device/i)).toBeInTheDocument();
    act(() => userEvent.click(screen.getByRole('button', { name: /Retry/i })));
    await waitFor(() => rerender(ui));
    expect(submitMock).toHaveBeenLastCalledWith(defaultState.devices.byId.a1.id, { testKey: 'testValue' });
    expect(applyMock).toHaveBeenLastCalledWith(defaultState.devices.byId.a1.id, { retries: 0 }, true, { testKey: 'testValue' });
    device.config = {
      configured: { test: true, something: 'else', aNumber: 42 },
      reported: { test: true, something: 'else', aNumber: 42 },
      updated_ts: defaultState.devices.byId.a1.updated_ts,
      reported_ts: reportedTime
    };
    ui = (
      <Provider store={store}>
        <Configuration
          device={device}
          abortDeployment={jest.fn}
          applyDeviceConfig={applyMock}
          getDeviceLog={jest.fn}
          getSingleDeployment={jest.fn}
          saveGlobalSettings={jest.fn}
          setDeviceConfig={submitMock}
        />
      </Provider>
    );
    await waitFor(() => rerender(ui));
    while (screen.queryByText(/show more/i)) {
      userEvent.click(screen.getByText(/show more/i));
      await waitFor(() => rerender(ui));
    }

    expect(screen.getByText(/aNumber/i)).toBeInTheDocument();
    userEvent.click(screen.getByRole('button', { name: /edit/i }));
    await waitFor(() => rerender(ui));
    userEvent.type(screen.getByDisplayValue('something'), 'testKey');
    userEvent.type(screen.getByDisplayValue('else'), 'testValue');
    act(() => userEvent.click(screen.getByRole('button', { name: /Cancel/i })));
    await waitFor(() => rerender(ui));
    expect(screen.queryByText(/key/i)).not.toBeInTheDocument();

    // userEvent.click(screen.getByRole('button', { name: /View log/i }));
    // expect(screen.queryByText(logContent)).toBeInTheDocument();
    // const logDialog = screen.getByText(/Config update log/i).parentElement.parentElement;
    // userEvent.click(within(logDialog).getByText(/Cancel/i));
  });
});
