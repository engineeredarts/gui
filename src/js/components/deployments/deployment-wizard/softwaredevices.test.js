import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import SoftwareDevices from './softwaredevices';
import { defaultState, undefineds } from '../../../../../tests/mockData';

describe('SoftwareDevices Component', () => {
  it('renders correctly', async () => {
    const getReleasesMock = jest.fn();
    getReleasesMock.mockResolvedValue();
    const { baseElement } = render(
      <MemoryRouter>
        <SoftwareDevices
          getReleases={getReleasesMock}
          groups={defaultState.devices.groups.byId}
          hasDynamicGroups={true}
          releases={Object.keys(defaultState.releases.byId)}
          releasesById={defaultState.releases.byId}
          setDeploymentSettings={jest.fn}
        />
      </MemoryRouter>
    );
    const view = baseElement.firstChild.firstChild;
    expect(view).toMatchSnapshot();
    expect(view).toEqual(expect.not.stringMatching(undefineds));
  });
});
