import { Modality } from "./Modality";
import { Enrollment } from "./Enrollment";

export interface EnrollmentModalityState {
  modality: Modality;
  enrollment?: Enrollment | null;
  loading: boolean;
  error: string | null;
}
