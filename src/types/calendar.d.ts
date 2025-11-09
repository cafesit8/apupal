export interface UserData {
  dni: string,
  email: string,
  name: string,
  lastname: string
}

export interface CardData {
  cardNumber: string,
  cardholderName: string,
  identificationType: string,
  expirationMonth: string,
  expirationYear: string,
  securityCode: string
}

export interface Schedule {
  fecha: string,
  hora12: string,
  hora_id: number,
   price_per_hour: number;
}

export interface RootSchedulePerDay {
 schedule: SchedulePerDay[];
 success:  boolean;
}

export interface SchedulePerDay {
 academy:    boolean;
 created_at: Date;
 disponible: boolean;
 fecha:      Date;
 hora12:     string;
 hora_id:    number;
 id:         number;
 reservada:  boolean;
 price_per_hour: number;
}