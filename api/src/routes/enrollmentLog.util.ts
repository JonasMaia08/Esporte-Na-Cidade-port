import { Enrollment } from "../entities/enrollment.entity";
import { EnrollmentLog } from "../entities/enrollmentLog.entity";
import { Athlete } from "../entities/athlete.entity";
import { AppDataSource } from "../database/config";

const enrollmentLogRepository = AppDataSource.getRepository(EnrollmentLog);

interface LogChangeParams {
  enrollment: Enrollment;
  athlete: Athlete;
  changedBy: number;
  eventType: string;
  eventDescription: string;
  oldValue: any;
  newValue: any;
}

export async function logEnrollmentChange({
  enrollment,
  athlete,
  changedBy,
  eventType,
  eventDescription,
  oldValue,
  newValue,
}: LogChangeParams) {
  const nowGmt3 = new Date(Date.now() - 3 * 60 * 60 * 1000);
  const log = enrollmentLogRepository.create({
    enrollment,
    enrollment_id: enrollment.id,
    athlete,
    athlete_id: athlete.id,
    changed_by: changedBy,
    event_type: eventType,
    event_description: eventDescription,
    old_value: oldValue,
    new_value: newValue,
    created_at: nowGmt3,
  });
  await enrollmentLogRepository.save(log);
}
