import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import Event from "@/database/event.model";

// Type for the dynamic route segment resolved by Next.js.
type RouteParams = { params: Promise<{ slug: string }> };

/**
 * GET /api/events/[slug]
 *
 * Returns the events document matching the given slug.
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    // Validate that the slug is a non-empty, URL-safe string.
    if (!slug || typeof slug !== "string" || slug.trim().length === 0) {
      return NextResponse.json(
        { error: "A valid events slug is required" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const event = await Event.findOne({ slug }).lean();

    if (!event) {
      return NextResponse.json(
        { error: `No event found with slug "${slug}"` },
        { status: 404 }
      );
    }

    return NextResponse.json({ event }, { status: 200 });
  } catch (error) {
    console.error("[GET /api/events/[slug]]", error);

    const message =
      error instanceof Error ? error.message : "Internal server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
