
"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  LoaderCircle,
  MapPin,
  Phone,
  Wrench,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { authenticatedRequest } from "@/lib/api";

type ServiceBookingFormProps = {
  serviceId: string;
  technicianEmail: string;
};

type BookingResponse = {
  success: boolean;
  message: string;
  data?: {
    _id: string;
  };
};

function getTodayDate() {
  const now = new Date();
  const localDate = new Date(
    now.getTime() - now.getTimezoneOffset() * 60000,
  );

  return localDate.toISOString().slice(0, 10);
}

export default function ServiceBookingForm({
  serviceId,
  technicianEmail,
}: ServiceBookingFormProps) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user as
    | {
        email?: string;
        role?: string;
        phone?: string;
      }
    | undefined;

  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.phone && !customerPhone) {
      setCustomerPhone(user.phone);
    }
  }, [user?.phone, customerPhone]);

  const isCustomer = user?.role === "customer";

  const isOwnService =
    Boolean(user?.email) &&
    user?.email?.toLowerCase() === technicianEmail.toLowerCase();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isCustomer) {
      setError("Please sign in with a customer account.");
      return;
    }

    if (isOwnService) {
      setError("You cannot request your own service.");
      return;
    }

    if (problemDescription.trim().length < 20) {
      setError("Please describe the problem using at least 20 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const result = await authenticatedRequest<BookingResponse>(
        "/api/bookings",
        {
          method: "POST",
          body: JSON.stringify({
            serviceId,
            customerPhone: customerPhone.trim(),
            address: address.trim(),
            preferredDate,
            problemDescription: problemDescription.trim(),
          }),
        },
      );

      toast.success(
        result.message || "Repair request submitted successfully.",
      );

      router.push("/dashboard/customer/bookings");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Unable to submit your repair request.";

      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (isPending) {
    return (
      <div className="booking-access-state">
        <LoaderCircle className="booking-loading-icon" size={25} />
        <p>Checking your account...</p>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="booking-access-state">
        <h3>Sign in to request this service</h3>
        <p>
          Sign in with your customer account to submit your repair
          request.
        </p>
        <Link
          href={`/sign-in?callbackURL=${encodeURIComponent(
            `/services/${serviceId}`,
          )}`}
          className="btn btn-primary"
        >
          Sign In to Continue
        </Link>
      </div>
    );
  }

  if (!isCustomer) {
    return (
      <div className="booking-access-state">
        <h3>Customer account required</h3>
        <p>
          Only customer accounts can request repair services.
          You are currently signed in with a {user?.role || "different"} account.
        </p>
        <Link href="/" className="btn btn-outline">
          Return Home
        </Link>
      </div>
    );
  }

  if (isOwnService) {
    return (
      <div className="booking-access-state">
        <h3>You cannot request your own service</h3>
        <p>
          This service belongs to your technician account.
        </p>
        <Link
          href="/dashboard/technician/services"
          className="btn btn-outline"
        >
          Manage My Services
        </Link>
      </div>
    );
  }

  return (
    <form className="service-booking-form" onSubmit={handleSubmit}>
      <div className="booking-form-heading">
        <span className="eyebrow">REPAIR REQUEST FORM</span>
        <h3>Tell us about your repair</h3>
        <p>
          Provide your contact information, preferred date and
          a description of the problem.
        </p>
      </div>

      <div className="booking-form-field">
        <label htmlFor="booking-phone">
          <Phone size={16} />
          Contact Phone
        </label>
        <input
          id="booking-phone"
          type="tel"
          value={customerPhone}
          onChange={(event) => setCustomerPhone(event.target.value)}
          placeholder="Enter your phone number"
          minLength={7}
          maxLength={20}
          required
        />
      </div>

      <div className="booking-form-field">
        <label htmlFor="booking-address">
          <MapPin size={16} />
          Repair Address
        </label>
        <textarea
          id="booking-address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="Enter the address where the repair is needed"
          minLength={5}
          maxLength={250}
          rows={3}
          required
        />
      </div>

      <div className="booking-form-field">
        <label htmlFor="booking-date">
          <CalendarDays size={16} />
          Preferred Repair Date
        </label>
        <input
          id="booking-date"
          type="date"
          value={preferredDate}
          min={getTodayDate()}
          onChange={(event) => setPreferredDate(event.target.value)}
          required
        />
      </div>

      <div className="booking-form-field">
        <label htmlFor="booking-problem">
          <Wrench size={16} />
          Describe the Problem
        </label>
        <textarea
          id="booking-problem"
          value={problemDescription}
          onChange={(event) =>
            setProblemDescription(event.target.value)
          }
          placeholder="Explain what happened, what is not working, and any other useful details..."
          minLength={20}
          maxLength={2000}
          rows={5}
          required
        />
        <small>
          {problemDescription.length}/2000 characters (minimum 20)
        </small>
      </div>

      {error && (
        <div className="booking-form-error" role="alert">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="btn btn-primary booking-submit-button"
        disabled={submitting}
      >
        {submitting ? (
          <>
            <LoaderCircle className="booking-loading-icon" size={18} />
            Submitting Request...
          </>
        ) : (
          <>
            Submit Repair Request
            <Wrench size={17} />
          </>
        )}
      </button>

      <p className="booking-form-note">
        Your request will be sent to the service provider for confirmation.
        Payment is not required when submitting a request.
      </p>
    </form>
  );
}
