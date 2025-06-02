import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { User, Mail, Calendar, Phone, Map, Camera } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Alert from "../components/ui/Alert";
import ChangePassword from "../components/security/ChangePassword";

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  gender?: string;
  phoneNumber?: string;
  address?: {
    line1?: string;
    line2?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
}

const ProfilePage: React.FC = () => {
  const { user, updateProfile, loading, error, clearError } = useAuth();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "security">("profile");

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
      dateOfBirth: user?.dateOfBirth || "",
      gender: user?.gender || "",
      phoneNumber: user?.phoneNumber || "",
      address: {
        line1: user?.address?.line1 || "",
        line2: user?.address?.line2 || "",
        city: user?.address?.city || "",
        state: user?.address?.state || "",
        zip: user?.address?.zip || "",
        country: user?.address?.country || "",
      },
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      await updateProfile(data);
      setSuccessMessage("Profile updated successfully!");

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (err) {
      // Error is handled by AuthContext
    }
  };

  const clearSuccessMessage = () => {
    setSuccessMessage(null);
  };

  if (!user) {
    return null; // Should be handled by ProtectedRoute
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-white">
            <div className="flex flex-col md:flex-row items-center">
              <div className="relative mb-4 md:mb-0 md:mr-6">
                <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center">
                  {user.profilePhotoUrl ? (
                    <img
                      src={user.profilePhotoUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                      className="w-24 h-24 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <button className="absolute bottom-0 right-0 bg-white dark:bg-gray-700 p-1.5 rounded-full shadow-md">
                  <Camera className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </button>
              </div>

              <div>
                <h1 className="text-2xl font-bold">
                  {user.firstName} {user.lastName}
                </h1>
                <p className="text-indigo-100 flex items-center mt-1">
                  <Mail className="w-4 h-4 mr-2" />
                  {user.email}
                  {user.emailVerified && (
                    <span className="ml-2 px-2 py-0.5 bg-green-500 text-xs font-medium rounded-full">
                      Verified
                    </span>
                  )}
                </p>
                <p className="text-indigo-100 text-sm mt-1">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "profile"
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab("security")}
                className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${
                  activeTab === "security"
                    ? "border-indigo-500 text-indigo-600 dark:text-indigo-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                Security & Password
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {successMessage && (
              <Alert
                type="success"
                message={successMessage}
                onClose={clearSuccessMessage}
              />
            )}

            {error && (
              <Alert type="error" message={error} onClose={clearError} />
            )}

            {activeTab === "profile" && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="First Name"
                    leftIcon={<User className="w-5 h-5 text-gray-400" />}
                    error={errors.firstName?.message}
                    {...register("firstName", {
                      required: "First name is required",
                    })}
                  />

                  <Input
                    label="Last Name"
                    leftIcon={<User className="w-5 h-5 text-gray-400" />}
                    error={errors.lastName?.message}
                    {...register("lastName", {
                      required: "Last name is required",
                    })}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Date of Birth"
                    type="date"
                    leftIcon={<Calendar className="w-5 h-5 text-gray-400" />}
                    {...register("dateOfBirth")}
                  />

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Gender
                    </label>
                    <select
                      className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-md shadow-sm border border-gray-300 dark:border-gray-600 py-2 pl-3 pr-10 w-full focus:border-indigo-500 focus:ring-indigo-500"
                      {...register("gender")}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                      <option value="prefer-not-to-say">
                        Prefer not to say
                      </option>
                    </select>
                  </div>
                </div>

                <Input
                  label="Phone Number"
                  type="tel"
                  leftIcon={<Phone className="w-5 h-5 text-gray-400" />}
                  {...register("phoneNumber")}
                />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Address Information
                  </h3>

                  <Input
                    label="Address Line 1"
                    leftIcon={<Map className="w-5 h-5 text-gray-400" />}
                    {...register("address.line1")}
                  />

                  <Input
                    label="Address Line 2"
                    {...register("address.line2")}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="City" {...register("address.city")} />

                    <Input
                      label="State/Province"
                      {...register("address.state")}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Postal/ZIP Code"
                      {...register("address.zip")}
                    />

                    <Input label="Country" {...register("address.country")} />
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    variant="primary"
                    isLoading={loading}
                    disabled={!isDirty}
                  >
                    Save Changes
                  </Button>
                </div>
              </form>
            )}

            {activeTab === "security" && <ChangePassword />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
