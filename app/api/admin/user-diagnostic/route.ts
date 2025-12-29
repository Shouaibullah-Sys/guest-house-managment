// app/api/admin/user-diagnostic/route.ts
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import {
  getUserRoleInfo,
  syncUserRole,
  setUserRole,
  approveUser,
  diagnoseAuthIssue,
} from "@/lib/user-management";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const targetUserId = searchParams.get("userId") || userId;
    const action = searchParams.get("action");

    // Get comprehensive user information
    const userInfo = await getUserRoleInfo(targetUserId);

    if (!userInfo) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Perform diagnosis
    const diagnosis = diagnoseAuthIssue(userInfo);

    // Handle actions if specified
    let actionResult = null;
    if (action) {
      switch (action) {
        case "sync":
          actionResult = await syncUserRole(targetUserId);
          break;
        case "approve":
          actionResult = await approveUser(targetUserId);
          break;
        case "make-admin":
          actionResult = await setUserRole(targetUserId, "admin", true);
          break;
        case "make-staff":
          actionResult = await setUserRole(targetUserId, "staff", true);
          break;
        case "make-guest":
          actionResult = await setUserRole(targetUserId, "guest", true);
          break;
        default:
          actionResult = { success: false, message: "Unknown action" };
      }
    }

    return NextResponse.json({
      userInfo,
      diagnosis,
      actionResult,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("User diagnostic error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { targetUserId, action, role, approved } = body;

    if (!targetUserId || !action) {
      return new NextResponse("Missing required parameters", { status: 400 });
    }

    let result;
    switch (action) {
      case "sync":
        result = await syncUserRole(targetUserId);
        break;
      case "approve":
        result = await approveUser(targetUserId);
        break;
      case "set-role":
        if (!role) {
          return new NextResponse("Role is required for set-role action", {
            status: 400,
          });
        }
        result = await setUserRole(targetUserId, role, approved);
        break;
      default:
        result = { success: false, message: "Unknown action" };
    }

    return NextResponse.json({
      success: result.success,
      message: result.message,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("User diagnostic POST error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
