import { auth } from "@/auth";
import connectDb from "@/lib/db";
import { User } from "@/models/user.model";
import { redirect } from "next/navigation";
import EditRoleMobile from "@/Components/EditRoleMobile";
import Nav from "@/Components/Nav";
import AdminDashBoard from "@/Components/AdminDashBoard";
import UserDashboard from "@/Components/UserDashboard";
import DeliveryBoy from "@/Components/DeliveryBoy";
import Footer from "@/Components/Footer";
import SocketConnector from "@/Components/SocketConnector";

export default async function Home() {
  await connectDb();
  const session = await auth();
  const user = await User.findOne({ email: session?.user?.email });

  if (!user) {
    redirect("/login");
  }

  const incomplete = !user.role || !user.mobile || (!user.mobile && user.role === "user");

  if (incomplete) {
    return <EditRoleMobile />;
  }

  const plainUser = JSON.parse(JSON.stringify(user));

  return (
    <div className="flex flex-col min-h-screen">
      <SocketConnector user={plainUser} />
      <Nav user={plainUser} />

      {/* Main content area grows to push footer down */}
      <main className="flex-grow">
        {plainUser.role === "admin" ? (
          <AdminDashBoard />
        ) : plainUser.role === "user" ? (
          <UserDashboard />
        ) : plainUser.role === "delivery boy" || plainUser.role === "deliveryBoy" ? (
          <DeliveryBoy user={plainUser} />
        ) : (
          <UserDashboard />
        )}
      </main>

      <Footer />
    </div>
  );
}
