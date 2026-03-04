// Central export point for all database models.
// Import models from here rather than from individual model files.

export { default as Event } from "./event.model";
export { default as Booking } from "./booking.model";

// Re-export TypeScript interfaces for use in server actions, API routes, etc.
export type { IEvent } from "./event.model";
export type { IBooking } from "./booking.model";
