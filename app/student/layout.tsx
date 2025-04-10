import type { Metadata } from "next";
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./sidebar"
import { auth } from "@/lib/auth";
import { getFullName, getUserNotifications, hasUnreadNotifications } from "./fetch";
import Logo from "@/components/logo";
import NotifButton from "./notif-button";


export const metadata: Metadata = {
  title: "Campus Care",
  description: "We care about you.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth()

  if (session?.user?.role != 0)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-lg">You do not have access to this page.</p>
      </div>
    );

  const userName = await getFullName(session?.user?.id as unknown as number)
  const hasUnread = await hasUnreadNotifications(session?.user?.id as unknown as number)
  const notifications = await getUserNotifications(session?.user?.id as unknown as number)

  return (
    <SidebarProvider>
      <AppSidebar name={userName} />
      <main className="flex flex-col w-full h-dvh overflow-x-hidden">
        <header className="p-5 bg-primary text-primary-foreground flex items-center gap-4 sticky top-0 z-10">
          <Logo className="size-12 fill-white" />
          <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl flex-1">
            Campus Care
          </h1>
          <NotifButton hasUnread={hasUnread} notifications={notifications} />
        </header>
        <section className="flex-grow overflow-x-hidden max-h-full *:p-5">
          {children}
        </section>
      </main>
    </SidebarProvider>
  );
}
