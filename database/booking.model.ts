import mongoose, { Document, Model, Schema, Types } from "mongoose";

// ---------------------------------------------------------------------------
// TypeScript interface — defines the shape of a Booking document.
// ---------------------------------------------------------------------------
export interface IBooking extends Document {
  eventId: Types.ObjectId;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------
const BookingSchema = new Schema<IBooking>(
  {
    // Reference to the Event collection; indexed for fast lookup by events.
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: [true, "Event ID is required"],
      index: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      validate: {
        // RFC 5322-inspired regex — catches the vast majority of invalid addresses.
        validator: (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
        message: "Invalid email address format",
      },
    },
  },
  {
    // Automatically manages createdAt and updatedAt fields.
    timestamps: true,
  }
);

// ---------------------------------------------------------------------------
// Pre-save hook — verifies the referenced Event exists before persisting.
// Runs only on new documents to avoid a redundant DB lookup on updates.
//
// Using async without `next` is the correct Mongoose v6+ pattern.
// Throwing propagates the error identically to calling next(err).
// ---------------------------------------------------------------------------
BookingSchema.pre("save", async function () {
  if (!this.isNew) return;

  // Dynamically retrieve the Event model to avoid circular-import issues
  // that arise from importing the module directly at the top of this file.
  const Event = mongoose.model("Event");

  const eventExists = await Event.exists({ _id: this.eventId });

  if (!eventExists) {
    throw new Error(`Event with ID "${this.eventId}" does not exist`);
  }
});

// ---------------------------------------------------------------------------
// Model — guard against model re-registration during Next.js hot reloads.
// ---------------------------------------------------------------------------
const Booking: Model<IBooking> =
  mongoose.models.Booking ??
  mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
