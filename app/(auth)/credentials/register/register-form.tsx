"use client";

import { useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { format, isValid, parse, parseISO } from "date-fns";
import { CalendarIcon, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { registerAction, type AuthFormState } from "@/app/actions/auth";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverAnchor, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Creating account…" : label}
    </Button>
  );
}

const TOTAL_STEPS = 3;

const COUNTRY_OPTIONS = [
  "Austria",
  "Belgium",
  "Bulgaria",
  "Croatia",
  "Cyprus",
  "Czech Republic",
  "Denmark",
  "Estonia",
  "Finland",
  "France",
  "Germany",
  "Greece",
  "Hungary",
  "Ireland",
  "Italy",
  "Latvia",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Netherlands",
  "Poland",
  "Portugal",
  "Romania",
  "Slovakia",
  "Slovenia",
  "Spain",
  "Sweden",
  "United States",
  "Canada",
  "United Arab Emirates",
  "Israel",
  "United Kingdom",
  "Other",
];

const GOAL_OPTIONS = [
  "Build better budgeting habits",
  "Understand saving and emergency funds",
  "Learn investing basics",
  "Improve money mindset and discipline",
  "Prepare for financial independence",
];

const GENDER_OPTIONS = ["Male", "Female", "Other", "Prefer not to say"] as const;

function getAgeFromBirthDate(isoDate: string): number | null {
  const birth = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

function isValidBirthDateInRange(isoDate: string): boolean {
  const parsed = parseISO(isoDate);
  if (Number.isNaN(parsed.getTime())) return false;
  const min = new Date(1940, 0, 1);
  const max = new Date();
  return parsed >= min && parsed <= max;
}

function parseBirthDateInput(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return isValidBirthDateInRange(trimmed) ? trimmed : null;
  }

  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) return null;
  const parsed = parse(trimmed, "dd/MM/yyyy", new Date());
  if (!isValid(parsed)) return null;
  if (format(parsed, "dd/MM/yyyy") !== trimmed) return null;
  const iso = format(parsed, "yyyy-MM-dd");
  return isValidBirthDateInRange(iso) ? iso : null;
}

function formatBirthDateInputForTyping(value: string): string {
  const digitsOnly = value.replace(/\D/g, "").slice(0, 8);
  if (digitsOnly.length <= 2) return digitsOnly;
  if (digitsOnly.length <= 4) return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2)}`;
  return `${digitsOnly.slice(0, 2)}/${digitsOnly.slice(2, 4)}/${digitsOnly.slice(4)}`;
}

export function RegisterForm({ signInHref = "/credentials/login" }: { signInHref?: string }) {
  const [state, formAction] = useFormState(registerAction, null as AuthFormState);
  const [step, setStep] = useState(1);
  const [clientError, setClientError] = useState<string | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [birthDateInput, setBirthDateInput] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [guardianEmail, setGuardianEmail] = useState("");
  const [school, setSchool] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [gender, setGender] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [learningGoal, setLearningGoal] = useState("");

  const age = useMemo(() => (birthDate ? getAgeFromBirthDate(birthDate) : null), [birthDate]);
  const guardianRequired = age !== null && age < 18;

  const selectedDate = useMemo(() => {
    if (!birthDate) return undefined;
    const parsed = parseISO(birthDate);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }, [birthDate]);

  function validateCurrentStep(currentStep: number): string | null {
    if (currentStep === 1) {
      if (!firstName.trim()) return "First name is required.";
      if (!lastName.trim()) return "Last name is required.";
      if (!email.trim()) return "Email is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return "Please enter a valid email address.";
      if (password.length < 8) return "Password must be at least 8 characters.";
      if (!confirmPassword) return "Please confirm your password.";
      if (password !== confirmPassword) return "Passwords do not match.";
    }

    if (currentStep === 2) {
      if (!birthDate) return "Birth date is required.";
      if (guardianRequired && !guardianEmail.trim()) {
        return "Guardian email is required for students under 18.";
      }
      if (guardianEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guardianEmail.trim())) {
        return "Please enter a valid guardian email address.";
      }
    }

    if (currentStep === 3) {
      if (!school.trim()) return "School is required.";
      if (!country.trim()) return "Country is required.";
      if (!city.trim()) return "City is required.";
      if (!gender.trim()) return "Gender is required.";
    }

    return null;
  }

  function goToNextStep() {
    const validationError = validateCurrentStep(step);
    if (validationError) {
      setClientError(validationError);
      return;
    }
    setClientError(null);
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  }

  function goToPreviousStep() {
    setClientError(null);
    setStep((prev) => Math.max(prev - 1, 1));
  }

  return (
    <>
      <form action={formAction} className="space-y-4">
        {(state?.error || clientError) && (
          <div className="rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/40 dark:border-red-800 px-3 py-2 text-sm text-red-800 dark:text-red-200">
            {clientError ?? state?.error}
          </div>
        )}

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
            <span>
              Step {step} of {TOTAL_STEPS}
            </span>
            <span>{Math.round((step / TOTAL_STEPS) * 100)}% complete</span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-800">
            <div
              className="h-2 rounded-full bg-primary transition-all duration-200"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  required
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    setClientError(null);
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  required
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    setClientError(null);
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gender">
                Gender <span className="text-red-500">*</span>
              </Label>
              <select
                id="gender"
                value={gender}
                required
                onChange={(e) => {
                  setGender(e.target.value);
                  setClientError(null);
                }}
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100 dark:ring-offset-gray-900"
              >
                <option value="">Select gender</option>
                {GENDER_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setClientError(null);
                }}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setClientError(null);
                }}
              />
              <p className="text-xs text-gray-600 dark:text-gray-400">At least 8 characters.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <Input
                id="confirmPassword"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setClientError(null);
                }}
              />
              <p className="text-xs text-gray-600 dark:text-gray-400">Passwords must match.</p>
            </div>

            <Button type="button" className="w-full" onClick={goToNextStep}>
              Continue
            </Button>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="birthDate">Birth date</Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverAnchor asChild>
                  <div className="relative">
                    <Input
                      id="birthDate"
                      type="text"
                      inputMode="numeric"
                      autoComplete="bday"
                      placeholder="dd/mm/yyyy"
                      value={birthDateInput}
                      onFocus={() => setCalendarOpen(true)}
                      onClick={() => setCalendarOpen(true)}
                      onChange={(event) => {
                        const value = formatBirthDateInputForTyping(event.target.value);
                        setBirthDateInput(value);
                        setClientError(null);
                        const parsedIso = parseBirthDateInput(value);
                        if (parsedIso) {
                          setBirthDate(parsedIso);
                          setCalendarOpen(true);
                          return;
                        }
                        setBirthDate("");
                      }}
                      className="pr-10"
                      aria-label="Birth date"
                    />
                    <PopoverTrigger asChild>
                      <button
                        id="birthDatePicker"
                        type="button"
                        className="absolute inset-y-0 right-0 inline-flex w-10 items-center justify-center rounded-r-lg text-gray-500 hover:bg-gray-50 hover:text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:text-gray-400 dark:hover:bg-gray-900 dark:hover:text-gray-200"
                        aria-label="Open birth date calendar"
                      >
                        <CalendarIcon className="h-4 w-4 opacity-80" />
                      </button>
                    </PopoverTrigger>
                  </div>
                </PopoverAnchor>
                <PopoverContent
                  align="start"
                  className="w-[19rem] rounded-2xl border-gray-200 bg-white p-3 shadow-2xl dark:border-gray-700/70 dark:bg-gray-950"
                >
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      if (!date) return;
                      setBirthDate(format(date, "yyyy-MM-dd"));
                      setBirthDateInput(format(date, "dd/MM/yyyy"));
                      setClientError(null);
                      setCalendarOpen(false);
                    }}
                    captionLayout="label"
                    startMonth={new Date(1940, 0, 1)}
                    endMonth={new Date()}
                    defaultMonth={selectedDate ?? new Date(2008, 0, 1)}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                Type as dd/mm/yyyy or pick from the calendar.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="guardianEmail">
                Parent/guardian email {guardianRequired ? <span className="text-red-500">*</span> : "(optional)"}
              </Label>
              <Input
                id="guardianEmail"
                type="email"
                autoComplete="email"
                placeholder="parent@example.com"
                required={guardianRequired}
                value={guardianEmail}
                onChange={(e) => {
                  setGuardianEmail(e.target.value);
                  setClientError(null);
                }}
              />
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {guardianRequired
                  ? "Required because this birth date indicates the student is under 18."
                  : "Only needed for students under 18."}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" onClick={goToPreviousStep}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
              <Button type="button" onClick={goToNextStep}>
                Continue
              </Button>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="school">
                School <span className="text-red-500">*</span>
              </Label>
              <Input
                id="school"
                placeholder="Your school name"
                required
                value={school}
                onChange={(e) => {
                  setSchool(e.target.value);
                  setClientError(null);
                }}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="country">
                  Country <span className="text-red-500">*</span>
                </Label>
                <select
                  id="country"
                  value={country}
                  required
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setClientError(null);
                  }}
                  className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100 dark:ring-offset-gray-900"
                >
                  <option value="">Select country</option>
                  {COUNTRY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="city">
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="city"
                  required
                  placeholder="Your city"
                  value={city}
                  onChange={(e) => {
                    setCity(e.target.value);
                    setClientError(null);
                  }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gradeLevel">Grade/Year level (optional)</Label>
              <Input
                id="gradeLevel"
                placeholder="e.g. Year 11, Grade 10"
                value={gradeLevel}
                onChange={(e) => setGradeLevel(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="learningGoal">Primary learning goal (optional)</Label>
              <select
                id="learningGoal"
                value={learningGoal}
                onChange={(e) => setLearningGoal(e.target.value)}
                className="flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 dark:border-gray-600 dark:bg-gray-950 dark:text-gray-100 dark:ring-offset-gray-900"
              >
                <option value="">Select a goal</option>
                {GOAL_OPTIONS.map((goal) => (
                  <option key={goal} value={goal}>
                    {goal}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button type="button" variant="outline" onClick={goToPreviousStep}>
                <ChevronLeft className="mr-1 h-4 w-4" />
                Back
              </Button>
              <Submit label="Create account" />
            </div>
          </div>
        ) : null}

        <input type="hidden" name="firstName" value={firstName} />
        <input type="hidden" name="lastName" value={lastName} />
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="password" value={password} />
        <input type="hidden" name="birthDate" value={birthDate} />
        <input type="hidden" name="guardianEmail" value={guardianEmail} />
        <input type="hidden" name="school" value={school} />
        <input type="hidden" name="country" value={country} />
        <input type="hidden" name="city" value={city} />
        <input type="hidden" name="gender" value={gender} />
        <input type="hidden" name="gradeLevel" value={gradeLevel} />
        <input type="hidden" name="learningGoal" value={learningGoal} />
      </form>

      <p className="text-center text-sm text-gray-600 dark:text-gray-400">
        Already have an account?{" "}
        <Link href={signInHref} className="text-primary font-medium">
          Sign in
        </Link>
      </p>
    </>
  );
}
