import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "./trpc";
import { privateProcedure } from "./trpc";
import { z } from "zod";
import getPayloadClient from "../getPayload";
import { stripe } from "../lib/stripe";
import Stripe from "stripe";

export const paymentRouter = router({
  createSession: privateProcedure
    .input(z.object({ productIds: z.array(z.number()) }))
    .mutation(async ({ ctx, input }) => {
      const { user } = ctx;
      let { productIds } = input;

      if (productIds.length === 0) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const payload = await getPayloadClient();

      const { docs: products } = await payload.find({
        collection: "products",
        where: {
          id: {
            in: productIds,
          },
        },
      });

      const filteredProducts = products.filter((product) =>
        Boolean(product.priceId)
      );

      const order = await payload.create({
        collection: "orders",
        data: {
          _isPaid: false,
          user: user.id,
          products: filteredProducts.map((product) => product.id),
        },
      });

      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

      filteredProducts.forEach((product) => {
        line_items.push({
          price: product.priceId!,
          quantity: 1,
        });
      });

      line_items.push({
        price: "price_1OddMmEgUrfOaQIMvtf4QQj4",
        quantity: 1,
        adjustable_quantity: {
          enabled: false,
        },
      });

      try {
        const stripeSession = await stripe.checkout.sessions.create({
          success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/thank-you?orderId=${order.id}`,
          cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/cart`,
          payment_method_types: ["card"],
          mode: "payment",
          metadata: {
            userId: user.id,
            orderId: order.id,
          },
          line_items,
        });

        return { url: stripeSession.url };
      } catch (error) {
        console.log(error);
        return { url: null };
      }
    }),

  pollOrderStatus: publicProcedure
    .input(z.object({ orderId: z.number() }))
    .query(async ({ input }) => {
      const payload = await getPayloadClient();
      const { orderId } = input;
      const { docs: orders } = await payload.find({
        collection: "orders",
        where: {
          id: {
            equals: orderId,
          },
        },
      });
      if (orders.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const [order] = orders;

      return {
        isPaid: order._isPaid,
      };
    }),
});
