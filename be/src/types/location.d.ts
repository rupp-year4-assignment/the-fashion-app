export type LocationMetaData = {
  type: string | "Point";
  coordinates: Coordinate;
};

export type Coordinate = {
  latidute: number;
  longtitude: number;
};

export interface RiderLocation {
  type: "RIDER_LOCATION";
  orderId: string;
  lat: number;
  lng: number;
}

export interface JoinOrder {
  type: "JOIN_ORDER";
  orderId: string;
}

export type Message = RiderLocation | JoinOrder;
