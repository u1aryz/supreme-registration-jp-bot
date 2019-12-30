export type Location = "tokyo" | "osaka" | "nagoya" | "fukuoka";

export interface Registration {
  id: string;
  name: string;
  email: string;
  tel: string;
  location: Location;
}
