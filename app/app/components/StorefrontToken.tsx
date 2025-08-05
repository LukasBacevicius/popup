import { useState, useCallback } from "react";
import {
  Card,
  Text,
  Button,
  BlockStack,
  Box,
  Banner,
  InlineStack,
  TextField,
  Tooltip,
} from "@shopify/polaris";
import { useFetcher } from "@remix-run/react";

type StorefrontTokenProps = {
  initialToken: string | null;
  hasToken: boolean;
  shopDomain?: string | null;
  shopUrl?: string | null;
};

export function StorefrontToken({
  initialToken,
  hasToken,
  shopDomain,
  shopUrl,
}: StorefrontTokenProps) {
  const [token, setToken] = useState(initialToken);
  const [copied, setCopied] = useState(false);
  const tokenFetcher = useFetcher<{ 
    token: { 
      accessToken: string;
      shopDomain?: string;
      shopUrl?: string;
    } 
  }>();

  const isLoading =
    tokenFetcher.state === "loading" || tokenFetcher.state === "submitting";

  const handleGenerateToken = useCallback(() => {
    tokenFetcher.submit(
      {},
      { method: "POST", action: "/app/api/storefront-token" },
    );
  }, [tokenFetcher]);

  const handleCopyToken = useCallback(() => {
    if (token || tokenFetcher.data?.token?.accessToken) {
      const textToCopy = token || tokenFetcher.data?.token?.accessToken || "";
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [token, tokenFetcher.data]);

  // Update token state when fetcher data changes
  if (
    tokenFetcher.data?.token?.accessToken &&
    tokenFetcher.data.token.accessToken !== token
  ) {
    setToken(tokenFetcher.data.token.accessToken);
  }

  // Get the current shopDomain from props or fetcher data
  const currentShopDomain = 
    tokenFetcher.data?.token?.shopDomain || 
    shopDomain || 
    "";

  return (
    <Card>
      <BlockStack gap="400">
        <Text variant="headingMd" as="h2">
          Storefront API Token
        </Text>

        <Text variant="bodyMd" as="p">
          This token allows your widget to access product data through the
          Storefront API. Keep this token secure and don't share it publicly.
        </Text>

        {token || tokenFetcher.data?.token?.accessToken ? (
          <BlockStack gap="300">
            <InlineStack align="space-between">
              <TextField
                label="Storefront API Token"
                value={token || tokenFetcher.data?.token?.accessToken || ""}
                autoComplete="off"
                type="password"
                readOnly
                labelHidden
              />
              <Tooltip content={copied ? "Copied!" : "Copy to clipboard"}>
                <Button onClick={handleCopyToken} variant="primary">
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </Tooltip>
            </InlineStack>

            {currentShopDomain && (
              <Text variant="bodyMd" as="p">
                Shop Domain: {currentShopDomain}
              </Text>
            )}

            <Banner title="Keep your token secure" tone="warning">
              Don't share this token publicly. Anyone with this token can access
              your store's product data.
            </Banner>
          </BlockStack>
        ) : (
          <Box padding="400">
            <BlockStack gap="300" align="center">
              <Text variant="bodyMd" as="p">
                {hasToken
                  ? "Unable to load your Storefront API token."
                  : "You don't have a Storefront API token yet."}
              </Text>
              <Button
                onClick={handleGenerateToken}
                loading={isLoading}
                variant="primary"
              >
                {hasToken ? "Regenerate Token" : "Generate Token"}
              </Button>
            </BlockStack>
          </Box>
        )}
      </BlockStack>
    </Card>
  );
}
