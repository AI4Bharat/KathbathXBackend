import { LOCATION } from './LocationName';

interface Taluk {}

interface District {
  name: string;
  taluk: { [talukName: string]: Taluk };
}

interface State {
  name: string;
  district: { [districtName: string]: District };
}

export interface Location {
  [stateName: string]: State;
}

export function isState(value: string): [boolean, string] {
  const locationDetails: Location = LOCATION;
  const status = value in locationDetails;
  if (status) {
    return [status, locationDetails[value]['name']];
  }
  return [status, ''];
}

export function isDistrict(value: string, state: string): [boolean, string] {
  const locationDetails: Location = LOCATION;
  if (!(state in locationDetails)) {
    return [false, ''];
  }
  const stateDetails = locationDetails[state];
  const status = value in stateDetails['district'];
  if (status) {
    return [status, stateDetails['district'][value]['name']];
  }
  return [status, ''];
}
