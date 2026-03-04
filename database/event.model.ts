import mongoose, { Document, Model, Schema } from "mongoose";

// ---------------------------------------------------------------------------
// TypeScript interface — defines the shape of an Event document.
// ---------------------------------------------------------------------------
export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string;
  time: string;
  mode: "online" | "offline" | "hybrid";
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const EventSchema = new Schema<IEvent>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },

    // Populated automatically in the pre-save hook; not set by callers.
    slug: {
      type: String,
      unique: true,
      trim: true,
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    overview: {
      type: String,
      required: [true, "Overview is required"],
      trim: true,
    },

    image: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true,
    },

    venue: {
      type: String,
      required: [true, "Venue is required"],
      trim: true,
    },

    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },

    // Stored as an ISO 8601 date string (e.g. "2025-12-31") after normalization.
    date: {
      type: String,
      required: [true, "Date is required"],
    },

    // Stored in 24-hour HH:mm format (e.g. "14:30") after normalization.
    time: {
      type: String,
      required: [true, "Time is required"],
    },

    mode: {
      type: String,
      enum: {
        values: ["online", "offline", "hybrid"],
        message: 'Mode must be "online", "offline", or "hybrid"',
      },
      required: [true, "Mode is required"],
    },

    audience: {
      type: String,
      required: [true, "Audience is required"],
      trim: true,
    },

    agenda: {
      type: [String],
      required: [true, "Agenda is required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "Agenda must contain at least one item",
      },
    },

    organizer: {
      type: String,
      required: [true, "Organizer is required"],
      trim: true,
    },

    tags: {
      type: [String],
      required: [true, "Tags are required"],
      validate: {
        validator: (v: string[]) => v.length > 0,
        message: "Tags must contain at least one item",
      },
    },
  },
  {
    // Automatically manages createdAt and updatedAt fields.
    timestamps: true,
  }
);

// ---------------------------------------------------------------------------
// Pre-save hook — slug generation, date normalization, time normalization
//
// Using an async function without `next` is the correct Mongoose v6+ pattern.
// Throwing an error propagates it the same way calling next(err) would.
// ---------------------------------------------------------------------------
EventSchema.pre("save", async function () {
  // --- Slug generation ---
  // Only regenerate when the title is new or has been changed, to preserve
  // existing URLs and avoid unnecessary writes.
  if (this.isModified("title")) {
    this.slug = this.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")   // strip non-alphanumeric chars
      .replace(/\s+/g, "-")            // replace whitespace runs with hyphens
      .replace(/-+/g, "-");            // collapse consecutive hyphens
  }

  // --- Date normalization ---
  // Accept flexible input (e.g. "Dec 31 2025", "31/12/2025") and normalise
  // to ISO 8601 date string "YYYY-MM-DD" for consistent storage and sorting.
  if (this.isModified("date")) {
    const parsed = new Date(this.date);
    if (isNaN(parsed.getTime())) {
      throw new Error(`Invalid date value: "${this.date}"`);
    }
    this.date = parsed.toISOString().split("T")[0]; // "YYYY-MM-DD"
  }

  // --- Time normalization ---
  // Accept "HH:mm", "HH:mm:ss", or 12-hour "h:mm am/pm" input and normalise
  // to "HH:mm" (24-hour) for consistent storage.
  if (this.isModified("time")) {
    const normalized = normalizeTime(this.time);
    if (!normalized) {
      throw new Error(`Invalid time value: "${this.time}"`);
    }
    this.time = normalized;
  }
});

/**
 * Converts a time string to 24-hour "HH:mm" format.
 * Handles "HH:mm", "HH:mm:ss", and 12-hour "h:mm am/pm" variants.
 * Returns null if the input cannot be parsed.
 */
function normalizeTime(value: string): string | null {
  // 24-hour format: "HH:mm" or "HH:mm:ss"
  const h24 = value.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
  if (h24) {
    const hh = parseInt(h24[1], 10);
    const mm = parseInt(h24[2], 10);
    if (hh > 23 || mm > 59) return null;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }

  // 12-hour format: "h:mm am/pm" or "h:mm AM/PM"
  const h12 = value.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (h12) {
    let hh = parseInt(h12[1], 10);
    const mm = parseInt(h12[2], 10);
    const meridiem = h12[3].toLowerCase();
    if (hh > 12 || mm > 59) return null;
    if (meridiem === "am" && hh === 12) hh = 0;
    if (meridiem === "pm" && hh !== 12) hh += 12;
    return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Model — guard against model re-registration during Next.js hot reloads.
// ---------------------------------------------------------------------------
const Event: Model<IEvent> =
  mongoose.models.Event ?? mongoose.model<IEvent>("Event", EventSchema);

export default Event;
