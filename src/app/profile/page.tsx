
"use client";

import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Camera, LoaderCircle, Save, UserRound } from "lucide-react";
import Link from "next/link";
import { authenticatedRequest } from "@/lib/api";

interface Profile {
  _id?: string;
  name: string;
  email: string;
  role: "customer" | "technician" | "admin";
  phone: string;
  area: string;
  bio: string;
  image: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

const emptyProfile: Profile = {
  name: "",
  email: "",
  role: "customer",
  phone: "",
  area: "",
  bio: "",
  image: "",
};

export default function ProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<Profile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      try {
        const response = await authenticatedRequest<ApiResponse<Profile>>(
          "/api/users/me",
        );

        if (active) {
          setProfile({
            ...emptyProfile,
            ...response.data,
            phone: response.data.phone || "",
            area: response.data.area || "",
            bio: response.data.bio || "",
            image: response.data.image || "",
          });
        }
      } catch (err) {
        if (active) {
          const errorMessage =
            err instanceof Error ? err.message : "Unable to load profile.";

          if (errorMessage.toLowerCase().includes("session")) {
            router.replace("/sign-in");
          } else {
            setError(errorMessage);
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, [router]);

  function updateField(
    field: keyof Profile,
    value: string,
  ) {
    setProfile((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setError("");
    setMessage("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPEG, PNG or WebP image.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must not exceed 5 MB.");
      return;
    }

    setUploading(true);

    try {
      const imageData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
          } else {
            reject(new Error("Unable to read image."));
          }
        };

        reader.onerror = () => reject(new Error("Unable to read image."));
        reader.readAsDataURL(file);
      });

      const response = await authenticatedRequest<
        ApiResponse<{ url: string }>
      >("/api/uploads/image", {
        method: "POST",
        body: JSON.stringify({
          image: imageData,
          name: "fixmate-profile",
        }),
      });

      setProfile((current) => ({
        ...current,
        image: response.data.url,
      }));

      setMessage("Profile picture uploaded successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Image upload failed.",
      );
    } finally {
      setUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await authenticatedRequest<ApiResponse<Profile>>(
        "/api/users/me",
        {
          method: "PATCH",
          body: JSON.stringify({
            name: profile.name,
            phone: profile.phone,
            area: profile.area,
            bio: profile.bio,
            image: profile.image,
          }),
        },
      );

      setProfile((current) => ({
        ...current,
        ...response.data,
      }));

      setMessage(response.message || "Profile updated successfully.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update profile.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-blue-600"
        >
          <ArrowLeft size={17} />
          Back to Home
        </Link>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Account Settings
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">
            My Profile
          </h1>
          <p className="mt-2 text-slate-500">
            Manage your personal information and profile picture.
          </p>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-8">
            <div className="flex flex-col items-center gap-5 sm:flex-row">
              <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-white shadow-md">
                {profile.image ? (
                  <img
                    src={profile.image}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserRound size={44} className="text-slate-400" />
                )}
              </div>

              <div className="text-center sm:text-left">
                <h2 className="text-xl font-bold text-slate-900">
                  {profile.name || "Your Name"}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {profile.email}
                </p>
                <span className="mt-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold capitalize text-blue-700">
                  {profile.role}
                </span>

                <div className="mt-4">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 disabled:opacity-60"
                  >
                    {uploading ? (
                      <LoaderCircle size={16} className="animate-spin" />
                    ) : (
                      <Camera size={16} />
                    )}
                    {uploading ? "Uploading..." : "Change Picture"}
                  </button>
                  <p className="mt-2 text-xs text-slate-500">
                    JPEG, PNG or WebP. Maximum 5 MB.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 p-6 sm:p-8">
            {message && (
              <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                {message}
              </div>
            )}

            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Full Name
                </label>
                <input
                  required
                  minLength={2}
                  maxLength={80}
                  value={profile.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  disabled
                  value={profile.email}
                  className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Email address cannot be changed here.
                </p>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Phone Number
                </label>
                <input
                  required
                  value={profile.phone}
                  onChange={(event) => updateField("phone", event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="01XXXXXXXXX"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Area / Location
                </label>
                <input
                  required
                  minLength={2}
                  maxLength={120}
                  value={profile.area}
                  onChange={(event) => updateField("area", event.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter your area"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                About Me
              </label>
              <textarea
                rows={4}
                maxLength={500}
                value={profile.bio}
                onChange={(event) => updateField("bio", event.target.value)}
                className="w-full resize-y rounded-lg border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                placeholder="Write a short introduction..."
              />
              <p className="mt-1 text-right text-xs text-slate-400">
                {profile.bio.length}/500
              </p>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-6">
              <button
                type="submit"
                disabled={saving || uploading}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
