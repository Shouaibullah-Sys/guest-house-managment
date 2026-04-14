import dbConnect from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";
import { User } from "@/models/User";

type CompatPublicMetadata = {
  role?: "guest" | "staff" | "admin" | "laboratory" | "patient";
  approved?: boolean;
  [key: string]: unknown;
};

type CompatClerkUser = {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  imageUrl: string;
  banned: boolean;
  primaryEmailAddressId: string;
  emailAddresses: Array<{
    id: string;
    emailAddress: string;
    verification?: { status?: string };
  }>;
  phoneNumbers: Array<{ phoneNumber: string }>;
  publicMetadata: CompatPublicMetadata;
  createdAt: number;
  updatedAt: number;
  lastSignInAt: number | null;
};

function splitName(name?: string) {
  const fullName = name?.trim() || "";
  const [firstName = "", ...rest] = fullName.split(" ");
  return { firstName, lastName: rest.join(" "), fullName };
}

function mapDbUserToCompat(user: any): CompatClerkUser {
  const names = splitName(user?.name);
  const primaryEmailAddressId = `email_${user?._id?.toString?.() || "unknown"}`;

  return {
    id: user?._id?.toString?.() || "",
    firstName: names.firstName,
    lastName: names.lastName,
    fullName: names.fullName || user?.email || "User",
    username: user?.email || user?._id?.toString?.() || "",
    imageUrl: user?.image || "",
    banned: !Boolean(user?.isActive ?? true),
    primaryEmailAddressId,
    emailAddresses: user?.email
      ? [
          {
            id: primaryEmailAddressId,
            emailAddress: user.email,
            verification: {
              status: user?.emailVerified ? "verified" : "unverified",
            },
          },
        ]
      : [],
    phoneNumbers: user?.phone ? [{ phoneNumber: user.phone }] : [],
    publicMetadata: {
      role: user?.role || "guest",
      approved: Boolean(user?.approved),
    },
    createdAt: user?.createdAt ? new Date(user.createdAt).getTime() : Date.now(),
    updatedAt: user?.updatedAt ? new Date(user.updatedAt).getTime() : Date.now(),
    lastSignInAt: user?.lastLoginAt
      ? new Date(user.lastLoginAt).getTime()
      : null,
  };
}

export async function auth() {
  const user = await getCurrentUser();
  const userId = user?._id?.toString?.() ?? null;
  const role = (user?.role as "guest" | "staff" | "admin" | undefined) || "guest";
  const approved = Boolean(user?.approved);

  return {
    userId,
    sessionId: userId ? `local_${userId}` : null,
    sessionClaims: userId
      ? {
          sub: userId,
          metadata: { role, approved },
        }
      : null,
  };
}

export async function clerkClient() {
  await dbConnect();

  return {
    users: {
      async getUser(userId: string): Promise<CompatClerkUser> {
        const user = await User.findById(userId).lean();
        if (!user) {
          throw new Error("User not found");
        }
        return mapDbUserToCompat(user);
      },

      async getUserList(params?: {
        limit?: number;
        offset?: number;
        query?: string;
      }): Promise<{ data: CompatClerkUser[]; totalCount: number }> {
        const limit = Math.min(500, Math.max(1, params?.limit || 100));
        const offset = Math.max(0, params?.offset || 0);
        const query = params?.query?.trim();

        const filter: Record<string, unknown> = {};
        if (query) {
          const safeQuery = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
          const regex = new RegExp(safeQuery, "i");
          filter.$or = [{ name: regex }, { email: regex }, { _id: regex }];
        }

        const [users, totalCount] = await Promise.all([
          User.find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).lean(),
          User.countDocuments(filter),
        ]);

        return {
          data: users.map((user: any) => mapDbUserToCompat(user)),
          totalCount,
        };
      },

      async updateUser(
        userId: string,
        input: { publicMetadata?: CompatPublicMetadata }
      ): Promise<CompatClerkUser> {
        const update: Record<string, unknown> = {};
        if (input.publicMetadata) {
          if (typeof input.publicMetadata.role !== "undefined") {
            update.role = input.publicMetadata.role;
          }
          if (typeof input.publicMetadata.approved !== "undefined") {
            update.approved = Boolean(input.publicMetadata.approved);
          }
        }

        const updated = await User.findByIdAndUpdate(userId, { $set: update }, { new: true }).lean();
        if (!updated) throw new Error("User not found");
        const compatUser = mapDbUserToCompat(updated);
        compatUser.publicMetadata = {
          ...compatUser.publicMetadata,
          ...input.publicMetadata,
        };
        return compatUser;
      },

      async deleteUser(userId: string): Promise<{ id: string }> {
        await User.findByIdAndUpdate(userId, {
          $set: { isActive: false, deletedAt: new Date() },
        });
        return { id: userId };
      },

      async banUser(userId: string): Promise<{ id: string }> {
        await User.findByIdAndUpdate(userId, { $set: { isActive: false } });
        return { id: userId };
      },

      async unbanUser(userId: string): Promise<{ id: string }> {
        await User.findByIdAndUpdate(userId, { $set: { isActive: true } });
        return { id: userId };
      },
    },
  };
}

