import {Button} from "@/components/ui/shadcn/button";
import Link from "next/link";

export default function Home() {
    return (
        <div className={"w-dvw h-dvh flex flex-col items-center justify-center gap-2"}>
            <h1>Landing page</h1>
            <div className={"flex gap-2"}>
                <Button asChild>
                    <Link href="/dashboard">Dashboard</Link>
                </Button>
                <Button asChild>
                    <Link href="/sign-in">Sign in</Link>
                </Button>
            </div>
        </div>
    )
}
