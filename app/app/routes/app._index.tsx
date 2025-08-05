import { useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  InlineStack,
  Box,
  Link,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { ProductSelector } from "../components/ProductSelector";
import { StorefrontToken } from "../components/StorefrontToken";
import db from "../db.server";

// Define type for the product
type Product = {
  id: string;
  title: string;
  handle: string;
  images: {
    edges: Array<{
      node: {
        url: string;
      };
    }>;
  };
};

// Define the loader data type
type LoaderData = {
  storefrontToken: string | null;
  hasToken: boolean;
  shopDomain: string | null;
  shopUrl: string | null;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);
  const shop = session.shop;

  // Find token in database directly
  const storedToken = await db.storefrontToken.findFirst({
    where: { shop },
    orderBy: { createdAt: "desc" },
  });

  // Return the stored token information
  return json<LoaderData>({
    storefrontToken: storedToken?.accessToken || null,
    hasToken: Boolean(storedToken),
    shopDomain: storedToken?.shopDomain || null,
    shopUrl: storedToken?.shopUrl || null,
  });
};

export default function Index() {
  const { storefrontToken, hasToken, shopDomain, shopUrl } =
    useLoaderData<typeof loader>();
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);

  const handleProductsChange = (products: Product[]) => {
    setSelectedProducts(products);
  };

  return (
    <Page>
      <TitleBar title="Shop-in-Widget" />
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">
                  Create Your Shop-in-Widget
                </Text>
                <Text variant="bodyMd" as="p">
                  This app allows you to create a widget that displays your
                  selected products on any website using the Storefront API.
                </Text>

                <BlockStack gap="300">
                  <Text variant="headingMd" as="h3">
                    Step 1: Generate a Storefront API Token
                  </Text>
                  <Text variant="bodyMd" as="p">
                    First, generate a Storefront API token that will be used to
                    access your product data.
                  </Text>
                  <StorefrontToken
                    initialToken={storefrontToken}
                    hasToken={hasToken}
                    shopDomain={shopDomain}
                    shopUrl={shopUrl}
                  />
                </BlockStack>

                <BlockStack gap="300">
                  <Text variant="headingMd" as="h3">
                    Step 2: Select Products
                  </Text>
                  <Text variant="bodyMd" as="p">
                    Choose which products you want to display in your widget.
                  </Text>
                  <ProductSelector
                    selectedProducts={selectedProducts}
                    onProductsChange={handleProductsChange}
                  />
                </BlockStack>

                <BlockStack gap="300">
                  <Text variant="headingMd" as="h3">
                    Step 3: Add the Widget to Your Website
                  </Text>
                  <Text variant="bodyMd" as="p">
                    Copy and paste this code into your website to display your
                    selected products.
                  </Text>

                  {selectedProducts.length > 0 && storefrontToken ? (
                    <Card>
                      <BlockStack gap="300">
                        <Text variant="bodyMd" as="p">
                          Add this script to your HTML page:
                        </Text>
                        <Box
                          padding="300"
                          background="bg-surface-active"
                          borderWidth="025"
                          borderRadius="200"
                          borderColor="border"
                          overflowX="scroll"
                        >
                          <pre>
                            <code>{`
<div id="shop-in-widget"></div>
<script src="https://shop-in-widget-cdn.example.com/widget.js" 
  data-shop-domain="${shopDomain || ""}"
  data-token="${storefrontToken || ""}"
  data-product-ids="${selectedProducts.map((p) => p.id.split("/").pop()).join(",")}"
></script>
                            `}</code>
                          </pre>
                        </Box>
                      </BlockStack>
                    </Card>
                  ) : (
                    <Card>
                      <BlockStack gap="300">
                        <Text variant="bodyMd" as="p">
                          {!storefrontToken
                            ? "Generate a Storefront API token first."
                            : "Select at least one product to generate the widget code."}
                        </Text>
                      </BlockStack>
                    </Card>
                  )}
                </BlockStack>
              </BlockStack>
            </Card>
          </Layout.Section>

          <Layout.Section variant="oneThird">
            <Card>
              <BlockStack gap="300">
                <Text variant="headingMd" as="h2">
                  Resources
                </Text>
                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd">
                    Storefront API
                  </Text>
                  <Link
                    url="https://shopify.dev/docs/api/storefront"
                    target="_blank"
                    removeUnderline
                  >
                    Documentation
                  </Link>
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd">
                    Widget Customization
                  </Text>
                  <Link url="#" removeUnderline>
                    View Options
                  </Link>
                </InlineStack>
                <InlineStack align="space-between">
                  <Text as="span" variant="bodyMd">
                    Need Help?
                  </Text>
                  <Link url="#" removeUnderline>
                    Contact Support
                  </Link>
                </InlineStack>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
