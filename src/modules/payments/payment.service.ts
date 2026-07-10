import { prisma } from "../../lib/prisma"
import { stripe } from "../../lib/stripe";
import config from "../../config";
import Stripe from "stripe";

const createCheckoutInDB = async (userId: string, orderId: number) => {
  return await prisma.$transaction(async (tx) => {
    
    const order = await tx.rentalOrder.findFirst({
      where: {
        id: orderId,
        customerId: userId,
      },
      include: {
        rentalItem: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });

    if (!order) {
      throw new Error(
        "Order not found or you are not authorized to pay for this order.",
      );
    }

   
    if (order.rentalItem.length === 0) {
      throw new Error("Order has no rental items.");
    }

    
    if (Number(order.totalAmount) <= 0) {
      throw new Error("Invalid order amount.");
    }

   
    const invalidStatuses = ["PAID", "PICKED_UP", "RETURNED", "CANCELLED"];

    if (invalidStatuses.includes(order.orderStatus)) {
      throw new Error(
        `Payment cannot be created because order status is '${order.orderStatus}'.`,
      );
    }

   
    const successPayment = order.payments.find(
      (payment) => payment.status === "SUCCESS",
    );

    if (successPayment) {
      throw new Error("This order has already been paid.");
    }

   
    const pendingPayment = order.payments.find(
      (payment) => payment.status === "PENDING",
    );

    if (pendingPayment) {
      throw new Error("A payment session already exists for this order.");
    }

    
    const user = await tx.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
    });

   
    let stripeCustomerId = user.stripCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
      });

      stripeCustomerId = customer.id;

      await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          stripCustomerId: stripeCustomerId,
        },
      });
    }

    
    const payment = await tx.payment.create({
      data: {
        orderId: order.id,
        amount: Number(order.totalAmount),
        transactionId: crypto.randomUUID(), 
        gateway: "STRIPE",
        status: "PENDING",
      },
    });

    
    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,

      payment_method_types: ["card"],

      mode: "payment",

      line_items: order.rentalItem.map((item) => ({
        quantity: item.quantity,

        price_data: {
          currency: "bdt",

          unit_amount: Math.round(Number(item.subTotal) * 100),

          product_data: {
            name: item.product.title,
          },
        },
      })),

      metadata: {
        paymentId: payment.id.toString(),
        orderId: order.id.toString(),
        userId: user.id,
      },

      success_url: `${process.env.CLIENT_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/payment/cancel`,
    });

    return {
      checkoutUrl: session.url,
      sessionId: session.id,
    };
  });
};

const stripeWebhookInDB = async (payload: Buffer, signature: string) => {
  const endpointSecret = config.stripe_webhook_secret;
  const event = stripe.webhooks.constructEvent(
    payload,
    signature,
    endpointSecret,
  );
  
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      const paymentId = Number(session.metadata?.paymentId);
      const orderId = Number(session.metadata?.orderId);

      if (!paymentId || !orderId) {
        throw new Error("Invalid metadata");
      }

      await prisma.$transaction(async (tx) => {
       
        const payment = await tx.payment.findUnique({
          where: {
            id: paymentId,
          },
        });

        if (!payment) {
          throw new Error("Payment not found");
        }

        
        if (payment.status === "SUCCESS") {
          return;
        }

        
        await tx.payment.update({
          where: {
            id: paymentId,
          },
          data: {
            status: "SUCCESS",
            transactionId: session.payment_intent as string,
            paidAt: new Date(),
          },
        });

        
        await tx.rentalOrder.update({
          where: {
            id: orderId,
          },
          data: {
            orderStatus: "PAID",
          },
        });
      });

      break;
    }
    case "payment_intent.payment_failed":{
      const paymentIntent = event.data.object as Stripe.PaymentIntent;

      const paymentId = Number(paymentIntent.metadata?.paymentId);

      if (paymentId) {
        await prisma.payment.update({
          where: {
            id: paymentId,
          },
          data: {
            status: "FAILED",
          },
        });
      }

      break;
    }
      break;
    default:
      // Unexpected event type
      console.log(`Unhandled event type ${event.type}.`);
      break;
  }
};

export const paymentsService = {
  createCheckoutInDB,
  stripeWebhookInDB,
};