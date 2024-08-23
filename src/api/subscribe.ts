import { createHonoWithDB } from "../factory";
import { getAuth, clerkMiddleware } from "@hono/clerk-auth";
import { Client } from "square";
import fetchAdapter from "@haverstack/axios-fetch-adapter";
import { insertNewSubscriberData } from "../lib/insertSubscriberData";
import { updateUserAfterCancel } from "../lib/updateUserAfterCancel";

const subscribe = createHonoWithDB();

subscribe.use(clerkMiddleware());

subscribe.post("/cancel-subscription", async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.notFound();
  }

  const { subscriptionsApi } = new Client({
    accessToken: c.env.SQUARE_ACCESS_TOKEN,
    environment: c.env.SQUARE_ENVIRONMENT,
    unstable_httpClientOptions: { adapter: fetchAdapter },
  });

  const { subscriptionId } = await c.req.json();

  try {
    const { result } =
      await subscriptionsApi.cancelSubscription(subscriptionId);

    const cleanResult = {
      ...result,
      subscription: {
        ...result.subscription,
        version: 1,
      },
    };

    return c.json({ status: "success", data: cleanResult });
  } catch (err: any) {
    return c.json({ status: "error", data: err.errors });
  }

  // For development
  // const { result: customerInfo } =
  //   await customersApi.retrieveCustomer(squareId);
  // const { result: subEvents } =
  //   await subscriptionsApi.listSubscriptionEvents(subscriptionId);
  // const { result: subInfo } =
  //   await subscriptionsApi.retrieveSubscription(subscriptionId);
  // console.log("customerInfo:", customerInfo);
  // console.log("subEvents:", subEvents);
  // console.log("subInfo:", subInfo);
  //
  // return c.json({});
  // return c.json({ cleanResult });
});

subscribe.post("/subscription-updated", async (c) => {
  const hookData = await c.req.json();
  const subscriptionData = hookData.data.object.subscription;

  const updateDbRes = await updateUserAfterCancel({
    subscriptionId: subscriptionData.id,
    db: c.var.db,
    newSubscriptionStatus: subscriptionData.status,
    canceledDate: subscriptionData.canceled_date,
  });

  return c.json({ status: "success", data: updateDbRes });
});

subscribe.post("/subscription-created", async (c) => {
  const hookData = await c.req.json();
  const subscriptionData = hookData.data.object.subscription;

  // Initialize Square
  const { customersApi } = new Client({
    accessToken: c.env.SQUARE_ACCESS_TOKEN,
    environment: c.env.SQUARE_ENVIRONMENT,
    unstable_httpClientOptions: { adapter: fetchAdapter },
  });

  // Get customer from Square
  const { result: customer } = await customersApi.retrieveCustomer(
    subscriptionData.customer_id,
  );

  if (!customer.customer) {
    return c.json({ status: "error", data: "Unable to find customer" });
  }

  const clerkUserId = customer.customer.referenceId;

  if (!clerkUserId) {
    return c.json({ status: "error", data: "Unable to find Clerk ID" });
  }

  // Add subscriber data to db
  const subscriberDataRes = await insertNewSubscriberData({
    userId: clerkUserId,
    db: c.var.db,
    squareId: subscriptionData.customer_id,
    subscriptionId: subscriptionData.id,
    subscriptionStatus: subscriptionData.status,
    subscriptionCreatedAt: subscriptionData.created_at,
  });

  if (subscriberDataRes.status !== "success") {
    return c.notFound();
  }

  return c.json({ status: "success" });
});

subscribe.post("/subscribe", async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) {
    return c.notFound();
  }

  const userId = auth.userId;

  // Initialize Square
  const { subscriptionsApi, cardsApi, customersApi } = new Client({
    accessToken: c.env.SQUARE_ACCESS_TOKEN,
    environment: c.env.SQUARE_ENVIRONMENT,
    unstable_httpClientOptions: { adapter: fetchAdapter },
  });

  const { firstName, lastName, emailAddress, sourceId } = await c.req.json();

  // Create a new customer in Square
  const { result: createCustomerResult } = await customersApi.createCustomer({
    idempotencyKey: crypto.randomUUID(),
    referenceId: userId,
    givenName: firstName,
    familyName: lastName,
    emailAddress,
  });

  if (!createCustomerResult.customer) {
    return c.json({ data: "error" });
  }

  const newCustomerData = {
    ...createCustomerResult.customer,
    version: Number(createCustomerResult.customer.version),
  };

  if (!newCustomerData.id) {
    return c.json({ data: "error" });
  }

  // Add payment card to customer
  const cardResult = await cardsApi.createCard({
    idempotencyKey: crypto.randomUUID(),
    sourceId,
    card: {
      cardholderName: `${firstName} ${lastName}`,
      customerId: newCustomerData.id,
    },
  });

  if (!cardResult.result.card) {
    return c.json({ data: "error adding card" });
  }

  const cardId = cardResult.result.card.id;

  // Create subscription
  const { result: createSubscriptionResult } =
    await subscriptionsApi.createSubscription({
      idempotencyKey: crypto.randomUUID(),
      customerId: newCustomerData.id,
      locationId: c.env.SQUARE_LOCATION_ID,
      cardId,
      planVariationId: c.env.SQUARE_PLAN_VARIATION_ID,
      source: {
        name: "zero_carbs_web",
      },
    });

  return c.json({
    subscriptionStatus: createSubscriptionResult?.subscription?.status,
  });
});

export { subscribe };
