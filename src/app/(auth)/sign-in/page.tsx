"use client";

import Icons from "@/components/Icons";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { TauthCredentials } from "@/lib/validators/accountCredentials";
import { authCredentials } from "@/lib/validators/accountCredentials";
import { trpc } from "@/trpc/client";
import { toast } from "sonner";
import { ZodError } from "zod";
import { useRouter, useSearchParams } from "next/navigation";

function SignInPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const isSeller = searchParams.get("as") === "seller";
  const origin = searchParams.get("origin");

  function continueAsSeller() {
    router.push("?as=seller");
  }
  function continueAsCustomer() {
    router.replace("/sign-in", undefined);
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(authCredentials),
  });

  const { mutate: signIn, isLoading } = trpc.auth.signIn.useMutation({
    onSuccess: (data) => {
      toast.success("Signed in successfully");
      router.refresh();
      if (origin) {
        router.push(`/${origin}`);
      } else if (isSeller) {
        router.push("/sell");
      } else {
        router.push("/");
      }
    },
    onError: (error) => {
      if (error.data?.code === "UNAUTHORIZED") {
        toast.error("Invalid email or password");
      }
    },
  });

  function onSubmit({ email, password }: TauthCredentials) {
    signIn({ email, password });
  }
  return (
    <>
      <div className="container relative flex pt-20 flex-col items-center justify-center lg:px-0">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 items-center text-center">
            <Icons type="logo" className="w-20 h-20" />
            <h1 className="text-2xl font-bold">
              Sign in to your {isSeller ? "seller" : null} account
            </h1>
            <Link
              href="sign-up"
              className={buttonVariants({ variant: "link" })}
            >
              Don&apos;t have an account? Sign-up
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid gap-6">
            <form
              onSubmit={
                // @ts-expect-error don't know why this is happening
                handleSubmit(onSubmit)
              }
            >
              <div className="grid gap-2">
                <div className="grid gap-1 py-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    {...register("email")}
                    className={cn({
                      "focus-visible:ring-red-500": errors.email,
                    })}
                    placeholder="you@example.com"
                  />
                  {errors?.email && (
                    <p className="text-sm text-red-500">
                      {errors.email.message?.toString()}
                    </p>
                  )}
                </div>
                <div className="grid gap-1 py-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    {...register("password")}
                    type="password"
                    className={cn({
                      "focus-visible:ring-red-500": errors.password,
                    })}
                    placeholder="password"
                  />
                  {errors?.password && (
                    <p className="text-sm text-red-500">
                      {errors.password.message?.toString()}
                    </p>
                  )}
                </div>
                <Button>Sign in</Button>
              </div>
            </form>
            <div className="relative">
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center"
              >
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or
                </span>
              </div>
            </div>
            {isSeller ? (
              <Button onClick={continueAsCustomer} disabled={isLoading}>
                Continue as customer
              </Button>
            ) : (
              <Button onClick={continueAsSeller} disabled={isLoading}>
                Continue as seller
              </Button>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default SignInPage;
