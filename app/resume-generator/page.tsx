'use client';

import { useState, useEffect } from 'react';
import ProtectedRoute from '@/components/layout/ProtectedRoute';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { FileText, Plus, Edit, Trash2, Check, X, Download, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiGet, apiPost, apiPut } from '@/lib/api';

interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  linkedinUrl?: string;
  workExperience: Array<{
    companyName: string;
    role: string;
    startDate: string;
    endDate: string;
  }>;
  education: Array<{
    university: string;
    diploma: string;
    startDate: string;
    endDate: string;
  }>;
}

interface UserModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: User) => void;
}

function UserModal({ user, isOpen, onClose, onSave }: UserModalProps) {
  const [formData, setFormData] = useState<User>({
    _id: '',
    name: '',
    email: '',
    phoneNumber: '',
    linkedinUrl: '',
    workExperience: [],
    education: [],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/\D/g, '');
    
    const limitedPhoneNumber = phoneNumber.slice(0, 10);
    
    if (limitedPhoneNumber.length === 0) {
      return '';
    } else if (limitedPhoneNumber.length <= 3) {
      return `(${limitedPhoneNumber}`;
    } else if (limitedPhoneNumber.length <= 6) {
      return `(${limitedPhoneNumber.slice(0, 3)})-${limitedPhoneNumber.slice(3)}`;
    } else {
      return `(${limitedPhoneNumber.slice(0, 3)})-${limitedPhoneNumber.slice(3, 6)}-${limitedPhoneNumber.slice(6, 10)}`;
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phoneNumber: formatted });
    if (errors.phoneNumber) {
      setErrors({ ...errors, phoneNumber: '' });
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\(\d{3}\)-\d{3}-\d{4}$/;
    return phoneRegex.test(phone);
  };

  const validateLinkedInUrl = (url: string): boolean => {
    if (!url) return true;
    const linkedinRegex = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/;
    return linkedinRegex.test(url);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Name cannot exceed 100 characters';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!validatePhoneNumber(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Please enter a valid phone number (xxx)-xxx-xxxx';
    }

    if (formData.linkedinUrl && !validateLinkedInUrl(formData.linkedinUrl)) {
      newErrors.linkedinUrl = 'Please enter a valid LinkedIn URL (https://linkedin.com/in/yourprofile)';
    }


    formData.workExperience.forEach((exp, index) => {
      if (!exp.companyName.trim()) {
        newErrors[`workExp_${index}_company`] = 'Company name is required';
      }
      if (!exp.role.trim()) {
        newErrors[`workExp_${index}_role`] = 'Role is required';
      }
      if (!exp.startDate) {
        newErrors[`workExp_${index}_startDate`] = 'Start date is required';
      } else if (!/^(0[1-9]|1[0-2])\/\d{4}$/.test(exp.startDate)) {
        newErrors[`workExp_${index}_startDate`] = 'Please enter date in MM/YYYY format';
      }
      if (!exp.endDate) {
        newErrors[`workExp_${index}_endDate`] = 'End date is required';
      } else if (exp.endDate !== 'Present' && !/^(0[1-9]|1[0-2])\/\d{4}$/.test(exp.endDate)) {
        newErrors[`workExp_${index}_endDate`] = 'Please enter date in MM/YYYY format or "Present"';
      }
      if (exp.startDate && exp.endDate && exp.endDate !== 'Present' && 
          new Date(exp.startDate.split('/').reverse().join('-')) > new Date(exp.endDate.split('/').reverse().join('-'))) {
        newErrors[`workExp_${index}_dates`] = 'Start date must be before end date';
      }
    });

    formData.education.forEach((edu, index) => {
      if (!edu.university.trim()) {
        newErrors[`education_${index}_university`] = 'University name is required';
      }
      if (!edu.diploma.trim()) {
        newErrors[`education_${index}_diploma`] = 'Diploma/Degree is required';
      }
      if (!edu.startDate) {
        newErrors[`education_${index}_startDate`] = 'Start date is required';
      } else if (!/^(0[1-9]|1[0-2])\/\d{4}$/.test(edu.startDate)) {
        newErrors[`education_${index}_startDate`] = 'Please enter date in MM/YYYY format';
      }
      if (!edu.endDate) {
        newErrors[`education_${index}_endDate`] = 'End date is required';
      } else if (edu.endDate !== 'Present' && !/^(0[1-9]|1[0-2])\/\d{4}$/.test(edu.endDate)) {
        newErrors[`education_${index}_endDate`] = 'Please enter date in MM/YYYY format or "Present"';
      }
      if (edu.startDate && edu.endDate && edu.endDate !== 'Present' && 
          new Date(edu.startDate.split('/').reverse().join('-')) > new Date(edu.endDate.split('/').reverse().join('-'))) {
        newErrors[`education_${index}_dates`] = 'Start date must be before end date';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (user) {
      setFormData(user);
    } else {
      setFormData({
        _id: '',
        name: '',
        email: '',
        phoneNumber: '',
        linkedinUrl: '',
        workExperience: [],
        education: [],
      });
    }
  }, [user]);

  const addWorkExperience = () => {
    setFormData({
      ...formData,
      workExperience: [...formData.workExperience, {
        companyName: '',
        role: '',
        startDate: '',
        endDate: '',
      }],
    });
  };

  const removeWorkExperience = (index: number) => {
    setFormData({
      ...formData,
      workExperience: formData.workExperience.filter((_, i) => i !== index),
    });
  };

  const updateWorkExperience = (index: number, field: string, value: string) => {
    const updated = [...formData.workExperience];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, workExperience: updated });
  };

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [...formData.education, {
        university: '',
        diploma: '',
        startDate: '',
        endDate: '',
      }],
    });
  };

  const removeEducation = (index: number) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index),
    });
  };

  const updateEducation = (index: number, field: string, value: string) => {
    const updated = [...formData.education];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, education: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the validation errors before submitting');
      return;
    }
    
    setIsSubmitting(true);
    try {
      onSave(formData);
      setErrors({});
      toast.success(user ? 'User updated successfully!' : 'User created successfully!');
    } catch (error) {
      toast.error('Failed to save user. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {user ? 'Edit User' : 'Add New User'}
            </h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Personal Information
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Full Name *"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) {
                        setErrors({ ...errors, name: '' });
                      }
                    }}
                    placeholder="Enter full name"
                    required
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <Input
                    label="Email *"
                    type="email"
                    value={formData.email}
                    onChange={(e) => {
                      setFormData({ ...formData, email: e.target.value });
                      if (errors.email) {
                        setErrors({ ...errors, email: '' });
                      }
                    }}
                    placeholder="Enter email"
                    required
                    className={errors.email ? 'border-red-500' : ''}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                  )}
                </div>
                <div>
                  <Input
                    label="Phone Number *"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handlePhoneNumberChange}
                    placeholder="(xxx)-xxx-xxxx"
                    required
                    className={errors.phoneNumber ? 'border-red-500' : ''}
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
                  )}
                </div>
                <div>
                  <Input
                    label="LinkedIn URL"
                    value={formData.linkedinUrl}
                    onChange={(e) => {
                      setFormData({ ...formData, linkedinUrl: e.target.value });
                      if (errors.linkedinUrl) {
                        setErrors({ ...errors, linkedinUrl: '' });
                      }
                    }}
                    placeholder="https://linkedin.com/in/yourprofile"
                    className={errors.linkedinUrl ? 'border-red-500' : ''}
                  />
                  {errors.linkedinUrl && (
                    <p className="text-red-500 text-sm mt-1">{errors.linkedinUrl}</p>
                  )}
                </div>
              </div>
            </div>


                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Work Experience
                    </h3>
                  </div>
                  {formData.workExperience.map((exp, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Experience {index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeWorkExperience(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Input
                        label="Company Name *"
                        value={exp.companyName}
                        onChange={(e) => {
                          updateWorkExperience(index, 'companyName', e.target.value);
                          if (errors[`workExp_${index}_company`]) {
                            setErrors({ ...errors, [`workExp_${index}_company`]: '' });
                          }
                        }}
                        placeholder="Enter company name"
                        required
                        className={errors[`workExp_${index}_company`] ? 'border-red-500' : ''}
                      />
                      {errors[`workExp_${index}_company`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`workExp_${index}_company`]}</p>
                      )}
                    </div>
                    <Input
                      label="Role *"
                      value={exp.role}
                      onChange={(e) => updateWorkExperience(index, 'role', e.target.value)}
                      placeholder="Enter role"
                      required
                    />
                    <div>
                      <Input
                        label="Start Date *"
                        type="month"
                        value={exp.startDate ? `${exp.startDate.split('/')[1]}-${exp.startDate.split('/')[0].padStart(2, '0')}` : ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value) {
                            const [year, month] = value.split('-');
                            const formattedDate = `${month}/${year}`;
                            updateWorkExperience(index, 'startDate', formattedDate);
                            if (errors[`workExp_${index}_startDate`]) {
                              setErrors({ ...errors, [`workExp_${index}_startDate`]: '' });
                            }
                          } else {
                            updateWorkExperience(index, 'startDate', '');
                          }
                        }}
                        required
                        className={errors[`workExp_${index}_startDate`] ? 'border-red-500' : ''}
                      />
                      {errors[`workExp_${index}_startDate`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`workExp_${index}_startDate`]}</p>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          End Date *
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateWorkExperience(index, 'endDate', 'Present')}
                          className="px-3 py-1 text-xs"
                        >
                          Present
                        </Button>
                      </div>
                      {exp.endDate === 'Present' ? (
                        <div>
                          <Input
                            type="text"
                            value="Present"
                            readOnly
                            className="bg-gray-100 dark:bg-gray-700"
                          />
                          <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Currently working here
                          </div>
                        </div>
                      ) : (
                        <Input
                          type="month"
                          value={exp.endDate ? `${exp.endDate.split('/')[1]}-${exp.endDate.split('/')[0].padStart(2, '0')}` : ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value) {
                              const [year, month] = value.split('-');
                              const formattedDate = `${month}/${year}`;
                              updateWorkExperience(index, 'endDate', formattedDate);
                              if (errors[`workExp_${index}_endDate`]) {
                                setErrors({ ...errors, [`workExp_${index}_endDate`]: '' });
                              }
                            } else {
                              updateWorkExperience(index, 'endDate', '');
                            }
                          }}
                          required
                          className={errors[`workExp_${index}_endDate`] ? 'border-red-500' : ''}
                        />
                      )}
                      {errors[`workExp_${index}_endDate`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`workExp_${index}_endDate`]}</p>
                      )}
                      {errors[`workExp_${index}_dates`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`workExp_${index}_dates`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="mt-4 flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={addWorkExperience}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Experience
                </Button>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Education
                </h3>
              </div>
              {formData.education.map((edu, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900 dark:text-white">
                      Education {index + 1}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeEducation(index)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      label="University *"
                      value={edu.university}
                      onChange={(e) => updateEducation(index, 'university', e.target.value)}
                      placeholder="Enter university name"
                      required
                    />
                    <Input
                      label="Diploma/Degree *"
                      value={edu.diploma}
                      onChange={(e) => updateEducation(index, 'diploma', e.target.value)}
                      placeholder="Enter diploma/degree"
                      required
                    />
                    <div>
                      <Input
                        label="Start Date *"
                        type="month"
                        value={edu.startDate ? `${edu.startDate.split('/')[1]}-${edu.startDate.split('/')[0].padStart(2, '0')}` : ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value) {
                            const [year, month] = value.split('-');
                            const formattedDate = `${month}/${year}`;
                            updateEducation(index, 'startDate', formattedDate);
                            if (errors[`education_${index}_startDate`]) {
                              setErrors({ ...errors, [`education_${index}_startDate`]: '' });
                            }
                          } else {
                            updateEducation(index, 'startDate', '');
                          }
                        }}
                        required
                        className={errors[`education_${index}_startDate`] ? 'border-red-500' : ''}
                      />
                      {errors[`education_${index}_startDate`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`education_${index}_startDate`]}</p>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          End Date *
                        </label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => updateEducation(index, 'endDate', 'Present')}
                          className="px-3 py-1 text-xs"
                        >
                          Present
                        </Button>
                      </div>
                      {edu.endDate === 'Present' ? (
                        <div>
                          <Input
                            type="text"
                            value="Present"
                            readOnly
                            className="bg-gray-100 dark:bg-gray-700"
                          />
                          <div className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Currently studying here
                          </div>
                        </div>
                      ) : (
                        <Input
                          type="month"
                          value={edu.endDate ? `${edu.endDate.split('/')[1]}-${edu.endDate.split('/')[0].padStart(2, '0')}` : ''}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value) {
                              const [year, month] = value.split('-');
                              const formattedDate = `${month}/${year}`;
                              updateEducation(index, 'endDate', formattedDate);
                              if (errors[`education_${index}_endDate`]) {
                                setErrors({ ...errors, [`education_${index}_endDate`]: '' });
                              }
                            } else {
                              updateEducation(index, 'endDate', '');
                            }
                          }}
                          required
                          className={errors[`education_${index}_endDate`] ? 'border-red-500' : ''}
                        />
                      )}
                      {errors[`education_${index}_endDate`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`education_${index}_endDate`]}</p>
                      )}
                      {errors[`education_${index}_dates`] && (
                        <p className="text-red-500 text-sm mt-1">{errors[`education_${index}_dates`]}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div className="mt-4 flex justify-end">
                <Button type="button" variant="outline" size="sm" onClick={addEducation}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Education
                </Button>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {user ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  user ? 'Update User' : 'Add User'
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResumeGeneratorPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [jobDetails, setJobDetails] = useState({
    companyName: '',
    jobTitle: '',
    jobDescription: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<Record<string, string>>({});
  const [resumeIds, setResumeIds] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await apiGet('/api/users/list');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        toast.error('Failed to fetch users');
      }
    } catch (error) {
      toast.error('Failed to fetch users');
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setIsUserModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsUserModalOpen(true);
  };

  const handleSaveUser = async (userData: User) => {
    try {
      if (editingUser) {
        const response = await apiPut('/api/users/update', {
          userId: userData._id,
          ...userData,
        });

        if (response.ok) {
          const updatedUser = await response.json();
          setUsers(users.map(u => u._id === userData._id ? updatedUser.user : u));
          toast.success('User updated successfully');
        } else {
          toast.error('Failed to update user');
        }
      } else {
        const response = await apiPost('/api/users/create', userData);

        if (response.ok) {
          const newUser = await response.json();
          setUsers([...users, newUser.user]);
          toast.success('User created successfully');
        } else {
          toast.error('Failed to create user');
        }
      }
      setIsUserModalOpen(false);
    } catch (error) {
      toast.error('Failed to save user');
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u._id));
    }
  };

  const handleDownloadResume = async (userId: string, resumeId?: string, userName?: string) => {
    const idToUse = resumeId || resumeIds[userId];
    if (!idToUse) {
      toast.error('Resume not found');
      return;
    }

    const user = users.find(u => u._id === userId);
    const displayName = userName || user?.name || 'resume';

    try {
      const response = await fetch(`/api/resumes/download?id=${idToUse}&format=pdf`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${displayName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        toast.success('Resume downloaded successfully!');
      } else {
        toast.error('Failed to download resume');
      }
    } catch (error) {
      toast.error('Failed to download resume');
    }
  };

  const handleGenerateResumes = async () => {
    if (!jobDetails.companyName || !jobDetails.jobTitle || !jobDetails.jobDescription) {
      toast.error('Please fill in all job details');
      return;
    }

    if (selectedUsers.length === 0) {
      toast.error('Please select at least one user');
      return;
    }

    setIsGenerating(true);
    setGenerationStatus({});

    try {
      const response = await apiPost('/api/resumes/generate', {
        ...jobDetails,
        selectedUserIds: selectedUsers,
      });

      const data = await response.json();

      if (response.ok) {
        const status: Record<string, string> = {};
        const resumeIdMap: Record<string, string> = {};
        
        data.results.forEach((result: any) => {
          status[result.userId] = result.status;
          if (result.resumeId) {
            resumeIdMap[result.userId] = result.resumeId;
          }
        });
        
        setGenerationStatus(status);
        setResumeIds(prev => ({ ...prev, ...resumeIdMap }));

        const completedResumes = data.results.filter((r: any) => r.status === 'completed');
        if (completedResumes.length > 0) {
          toast.success(`Resume generation completed! Downloading ${completedResumes.length} resume(s)...`);
          
            for (const result of completedResumes) {
              if (result.resumeId) {
                try {
                  await handleDownloadResume(result.userId, result.resumeId, result.userName);
                } catch (downloadError) {
                  console.error(`Failed to auto-download resume for user ${result.userId}:`, downloadError);
                  toast.error(`Failed to auto-download resume for ${result.userName}`);
                }
              }
            }
        } else {
          toast.error('Resume generation failed');
        }
      } else {
        toast.error(data.message || 'Failed to generate resumes');
      }
    } catch (error) {
      toast.error('Failed to generate resumes');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Resume Generator
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Generate tailored resumes for specific job applications
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Job Details</CardTitle>
                <CardDescription>
                  Enter the job information to tailor the resume
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Company Name *"
                  value={jobDetails.companyName}
                  onChange={(e) => setJobDetails({ ...jobDetails, companyName: e.target.value })}
                  placeholder="Enter company name"
                />
                <Input
                  label="Job Title *"
                  value={jobDetails.jobTitle}
                  onChange={(e) => setJobDetails({ ...jobDetails, jobTitle: e.target.value })}
                  placeholder="Enter job title"
                />
                <div>
                  <label className="label">Job Description *</label>
                  <textarea
                    className="input min-h-[120px] resize-none"
                    value={jobDetails.jobDescription}
                    onChange={(e) => setJobDetails({ ...jobDetails, jobDescription: e.target.value })}
                    placeholder="Enter job description"
                    required
                  />
                </div>
                <Button
                  onClick={handleGenerateResumes}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate Resumes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Users</CardTitle>
                    <CardDescription>
                      Select users to generate resumes for
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddUser} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {users.length > 0 ? (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedUsers.length === users.length}
                        onChange={handleSelectAll}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium">Select All</span>
                    </div>
                    
                    {users.map((user) => (
                      <div key={user._id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={selectedUsers.includes(user._id)}
                            onChange={() => handleSelectUser(user._id)}
                            className="rounded border-gray-300"
                          />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          {generationStatus[user._id] && (
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              generationStatus[user._id] === 'completed'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : generationStatus[user._id] === 'generating'
                                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {generationStatus[user._id]}
                            </span>
                          )}
                          
                          {generationStatus[user._id] === 'completed' && resumeIds[user._id] && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadResume(user._id, undefined, user.name)}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20"
                              title="Download Resume"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditUser(user)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">No users found</p>
                    <Button onClick={handleAddUser}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </main>

        <UserModal
          user={editingUser}
          isOpen={isUserModalOpen}
          onClose={() => setIsUserModalOpen(false)}
          onSave={handleSaveUser}
        />
      </div>
    </ProtectedRoute>
  );
}
