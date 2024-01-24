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
import { useRouter } from "next/navigation";

function SignUpPage() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(authCredentials),
  });

  const router = useRouter();

  const { mutate, isLoading } = trpc.auth.createPayloadUser.useMutation({
    onError: (error) => {
      if (error.data?.code === "CONFLICT") {
        toast.error("This email is already in use");
        return;
      }
      if (error instanceof ZodError) {
        toast.error(error.issues[0].message);
        return;
      }
      toast.error("Something went wrong. Please try again.");
    },

    onSuccess: ({ sentToEmail }) => {
      toast.success(`Verification email sent to ${sentToEmail}`);
      router.push(`/verify-email?to=${sentToEmail}`);
    },
  });

  function onSubmit({ email, password }: TauthCredentials) {
    mutate({ email, password });
  }
  return (
    <>
      <div className="container relative flex pt-20 flex-col items-center justify-center lg:px-0">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 items-center text-center">
            <Icons type="logo" className="w-20 h-20" />
            <h1 className="text-2xl font-bold">Create an account</h1>
            <Link
              href="sign-in"
              className={buttonVariants({ variant: "link" })}
            >
              Already have an account? Sign-in
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
                <Button>Sign up</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

export default SignUpPage;
