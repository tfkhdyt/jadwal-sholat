export type Location = {
  id: string;
  lokasi: string;
};

export type LocationResponse = {
  status: boolean;
  data: Location[];
};
