import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function LaboratoryDashboard() {
  // Get current user
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Get user role from metadata
  const userRole = user.publicMetadata?.role as string;

  // Check if user has access (admin or laboratory role)
  if (userRole !== "admin" && userRole !== "laboratory") {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="container mx-auto flex-grow p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Laboratory Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome, {user.firstName}! You have laboratory access.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Lab Tests Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🧪 Daily Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Search patients and create laboratory tests
              </p>
              <Button className="w-full" asChild>
                <Link href="/laboratory/daily-record">Open Daily Record</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Patient Management Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👥 Patient Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Access patient records and test history
              </p>
              <Button className="w-full" variant="outline">
                Manage Patients
              </Button>
            </CardContent>
          </Card>

          {/* Doctor Management Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                👨‍⚕️ Doctor Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Add and manage referring doctors
              </p>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/laboratory/doctors">Manage Doctors</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Reports Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Generate laboratory reports and analytics
              </p>
              <Button className="w-full" variant="outline">
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <span>📋</span>
                <span>New Test Order</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <span>🔍</span>
                <span>Search Results</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <span>📞</span>
                <span>Contact Patient</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <span>⚙️</span>
                <span>Settings</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Info Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Access Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Name:</span>
                <span>
                  {user.firstName} {user.lastName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Email:</span>
                <span>{user.primaryEmailAddress?.emailAddress}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Role:</span>
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    userRole === "admin"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {userRole === "admin" ? "Administrator" : "Laboratory Staff"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Access Level:</span>
                <span className="text-green-600 font-medium">
                  {userRole === "admin" ? "Full Access" : "Laboratory Access"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Only Section */}
        {userRole === "admin" && (
          <Card className="mt-8 border-2 border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="text-orange-800">
                🔧 Administrator Controls
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-orange-700 mb-4">
                As an administrator, you have access to additional management
                features.
              </p>
              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/admin">Admin Dashboard</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/admin/set-user-roles">Manage Users</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
