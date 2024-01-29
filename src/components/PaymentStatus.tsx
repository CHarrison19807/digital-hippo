"use client";

import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface PaymentStatusProps {
  orderEmail: string;
  orderId: number;
  isPaid: boolean;
}

function PaymentStatus({ orderEmail, orderId, isPaid }: PaymentStatusProps) {
  const { data } = trpc.payment.pollOrderStatus.useQuery(
    { orderId },
    {
      enabled: isPaid === false,
      refetchInterval: (data) => (data?.isPaid ? false : 1000),
    }
  );

  const router = useRouter();
  useEffect(() => {
    if (data?.isPaid) {
      router.refresh();
    }
  }, [data?.isPaid, router]);

  return (
    <div className="mt-16 grid grid-cols-2 gap-x-4 text-gray-600 text-sm">
      <div>
        <p className="font-medium text-gray-900">Shipping to</p>
        <p>{orderEmail}</p>
      </div>
      <div>
        <p className="font-medium text-gray-900">
          {isPaid ? "Payment successful" : "Pending payment"}
        </p>
      </div>
    </div>
  );
}

export default PaymentStatus;
