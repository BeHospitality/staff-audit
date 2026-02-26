export interface DemographicOption {
  value: string;
  label: string;
}

export const departments: DemographicOption[] = [
  { value: "fb", label: "Food & Beverage" },
  { value: "housekeeping", label: "Housekeeping" },
  { value: "front_desk", label: "Front Desk / Reception" },
  { value: "kitchen", label: "Kitchen" },
  { value: "maintenance", label: "Maintenance / Facilities" },
  { value: "spa", label: "Spa & Leisure" },
  { value: "admin", label: "Admin / Office" },
  { value: "other", label: "Other" },
];

export const roleLevels: DemographicOption[] = [
  { value: "team_member", label: "Team Member" },
  { value: "supervisor", label: "Supervisor / Team Lead" },
  { value: "manager", label: "Manager" },
];

export const tenureOptions: DemographicOption[] = [
  { value: "under_6m", label: "Less than 6 months" },
  { value: "6m_to_1y", label: "6–12 months" },
  { value: "1y_to_3y", label: "1–3 years" },
  { value: "over_3y", label: "3+ years" },
];

export const employmentTypes: DemographicOption[] = [
  { value: "full_time", label: "Full-time" },
  { value: "part_time", label: "Part-time" },
  { value: "seasonal", label: "Seasonal / Contract" },
];

export interface Demographics {
  department: string;
  role_level: string;
  tenure: string;
  employment_type: string;
}
