/** The signed-in hospital (GET /hospital/auth/me/). */
export interface CurrentHospital {
  id: number;
  name: string;
  email: string;
}
