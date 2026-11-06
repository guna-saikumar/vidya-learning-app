import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileEditSchema, type ProfileEditValues } from '../../schemas/profileSchema';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import type { StudentProfile } from '../../types/profile';

interface ProfileEditFormProps {
  profile: StudentProfile;
  saving: boolean;
  onSubmit: (values: ProfileEditValues) => Promise<void>;
  onCancel: () => void;
}

function toFormValues(profile: StudentProfile): ProfileEditValues {
  return {
    firstName: profile.firstName || '',
    lastName: profile.lastName || '',
    gender: ((profile.gender as string) || '') as ProfileEditValues['gender'],
    dob: profile.dob || profile.dateOfBirth || '',
    district: profile.district || '',
    location: profile.location || profile.villageCity || '',
    schoolName: profile.schoolName || '',
    grade: profile.grade || '',
    section: ((profile.section as string) || '') as ProfileEditValues['section'],
    medium: ((profile.medium as string) || '') as ProfileEditValues['medium'],
    rollNumber: profile.rollNumber || '',
    fatherName: profile.fatherName || '',
    motherName: profile.motherName || '',
    parentPhone: profile.parentPhone || '',
    studyGoalMinutes: profile.studyGoalMinutes ?? '',
  };
}

export const ProfileEditForm: React.FC<ProfileEditFormProps> = ({
  profile,
  saving,
  onSubmit,
  onCancel,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProfileEditValues>({
    resolver: zodResolver(profileEditSchema),
    defaultValues: toFormValues(profile),
  });

  useEffect(() => {
    reset(toFormValues(profile));
  }, [profile, reset]);

  const disabled = saving || isSubmitting;

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
      })}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="First Name" error={errors.firstName?.message} {...register('firstName')} />
        <Input label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
        <Select
          label="Gender"
          error={errors.gender?.message}
          options={[
            { value: 'MALE', label: 'Male' },
            { value: 'FEMALE', label: 'Female' },
            { value: 'OTHER', label: 'Other' },
          ]}
          {...register('gender', { setValueAs: (v) => (v === '' ? null : v) })}
        />
        <Input
          label="Date of Birth"
          type="date"
          error={errors.dob?.message}
          {...register('dob')}
        />
        <Input label="District" error={errors.district?.message} {...register('district', { setValueAs: (v) => (v === '' ? null : v) })} />
        <Input label="Location / City" error={errors.location?.message} {...register('location', { setValueAs: (v) => (v === '' ? null : v) })} />
        <Input label="School Name" error={errors.schoolName?.message} {...register('schoolName', { setValueAs: (v) => (v === '' ? null : v) })} />
        <Input label="Grade" error={errors.grade?.message} {...register('grade', { setValueAs: (v) => (v === '' ? null : v) })} />
        <Select
          label="Section"
          error={errors.section?.message}
          options={['A', 'B', 'C', 'D'].map((s) => ({ value: s, label: s }))}
          {...register('section', { setValueAs: (v) => (v === '' ? null : v) })}
        />
        <Select
          label="Medium"
          error={errors.medium?.message}
          options={[
            { value: 'ENGLISH', label: 'English' },
            { value: 'TELUGU', label: 'Telugu' },
            { value: 'URDU', label: 'Urdu' },
          ]}
          {...register('medium', { setValueAs: (v) => (v === '' ? null : v) })}
        />
        <Input label="Roll Number" error={errors.rollNumber?.message} {...register('rollNumber', { setValueAs: (v) => (v === '' ? null : v) })} />
        <Input
          label="Mobile Number"
          error={errors.parentPhone?.message}
          placeholder="10 digits"
          {...register('parentPhone', { setValueAs: (v) => (v === '' ? null : v) })}
        />
        <Input label="Father's Name" error={errors.fatherName?.message} {...register('fatherName', { setValueAs: (v) => (v === '' ? null : v) })} />
        <Input label="Mother's Name" error={errors.motherName?.message} {...register('motherName', { setValueAs: (v) => (v === '' ? null : v) })} />
        <Input
          label="Study Goal (minutes)"
          type="number"
          error={errors.studyGoalMinutes?.message}
          {...register('studyGoalMinutes')}
        />
      </div>
      <div className="flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={disabled}>
          Cancel
        </Button>
        <Button type="submit" loading={disabled}>
          Save Changes
        </Button>
      </div>
    </form>
  );
};