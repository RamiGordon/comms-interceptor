export interface ICalculateSatelliteLocations {
  kenobiDistance: number;
  satoDistance: number;
  skywalkerDistance: number;
  distancesLength: number;
}

export interface ICalculateCeoefficientsResponse {
  A: number;
  B: number;
}

export interface ICalculateBhaskaraConstants {
  A: number;
  B: number;
  satellite_A: number[];
}
export interface ICalculateBhaskaraConstantsResponse {
  a: number;
  b: number;
  c: number;
}

export interface ICalculateCoordinatesResponse {
  xA: number;
  yA: number;
  xB: number;
  yB: number;
}

export interface ICalculateSolution {
  satellite: number[];
  x: number;
  y: number;
}
