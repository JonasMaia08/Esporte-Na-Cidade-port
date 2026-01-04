export interface Modality {
    id: number;
    name: string;
    description: string;
    days_of_week: string;
    start_time: string;
    end_time: string;
    class_locations: string;
    teachers: [];
    registred_athletes: number;
}