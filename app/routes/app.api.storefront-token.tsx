import { json, type ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";
import db from "../db.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);
  const shop = session.shop;

  const response = await admin.graphql(
    `#graphql
      mutation storefrontAccessTokenCreate($input: StorefrontAccessTokenInput!) {
        storefrontAccessTokenCreate(input: $input) {
          storefrontAccessToken {
            id
            accessToken
            accessScopes {
              handle
            }
            title
          }
          userErrors {
            field
            message
          }
        }
      }`,
    {
      variables: {
        input: {
          title: `Shop-in-Widget App Token ${new Date().toISOString()}`,
        },
      },
    },
  );

  const responseJson = await response.json();

  if (responseJson.data?.storefrontAccessTokenCreate?.userErrors?.length > 0) {
    return json(
      { errors: responseJson.data.storefrontAccessTokenCreate.userErrors },
      { status: 400 },
    );
  }

  const tokenData =
    responseJson.data.storefrontAccessTokenCreate.storefrontAccessToken;

  // Get shop's myshopify domain and URL
  const shopResponse = await admin.graphql(
    `#graphql
      query GetShopUrl {
        shop {
          myshopifyDomain
          url
        }
      }`,
  );

  const shopResponseJson = await shopResponse.json();

  const { myshopifyDomain, url } = shopResponseJson.data.shop;

  // Store token in database
  await db.storefrontToken.create({
    data: {
      shop,
      accessToken: tokenData.accessToken,
      title: tokenData.title,
      shopDomain: myshopifyDomain,
      shopUrl: url,
    },
  });

  return json({
    token: tokenData,
  });
};
