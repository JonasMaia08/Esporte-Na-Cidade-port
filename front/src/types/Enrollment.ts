import { Modality } from "./Modality";

export interface Enrollment {
  id: number;
  athleteId: number;
  modality: Modality;
  approved: boolean;
  active: boolean;
}
