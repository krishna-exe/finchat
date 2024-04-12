import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import { UserButton, auth } from "@clerk/nextjs";
import Link from "next/link";
import { ArrowRight, LogIn } from "lucide-react";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm"

export default async function Home() {
  const {userId} = await auth()
  const isAuth =  !!userId
  let firstChat;
  if (userId) {
    firstChat = await db.select().from(chats).where(eq(chats.userId, userId));
    if (firstChat) {
      firstChat = firstChat[0];
    }
  }
    return (
      <div className="w-screen min-h-screen bg-gradient-to-r from-gray-900 via-purple-900 to-violet-600">
        <div className="absolute top-10 right-10">
          <UserButton afterSignOutUrl="/"></UserButton>
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" >
          <div className="flex flex-col items-center text-center">
            <div className="flex item-center">
              <h1 className="mr-3 text-5xl font-semibold text-white"> Chat with any Annual Report</h1>
            </div>
            {/* <div className="flex mt-2">
              {isAuth && <Button>Go to Chats</Button>}
            </div> */}
            <div className="flex mt-2">
              {isAuth && firstChat && (
              <>
                <Link href={`/chat/${firstChat.id}`}>
                <Button className="hover:bg-gray-800">
                  Go to Chats <ArrowRight className="ml-2" />
                </Button>
                </Link>
              </>
              )}
            </div>
            <p className="max-w-xxl mt-1 text-lg  text-white">
              Join your colleagues to instantly answer question related to annual report
            </p>
            <div className="w-full mt-4">
              {isAuth ? (
              <FileUpload/>
              ) : (
              <Link href="/sign-in">
                <Button className="hover:bg-gray-800">
                Login to get Started
                <LogIn className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    )
}
