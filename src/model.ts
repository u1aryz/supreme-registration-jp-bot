export type Location = "area_tokyo" | "area_osaka" | "area_nagoya" | "area_fukuoka";

export interface Registration {
  id: string;
  name: string;
  email: string;
  tel: string;
  location: Location;
}

export interface Alarm {
  when: number;
  isSet: boolean;
}

export interface Status {
  alarm: Alarm;
  message?: string;
}

export enum EventType {
  AlarmSetClicked,
  AlarmStopClicked,
  StatusChanged,
}
