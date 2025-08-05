import { useState, useCallback } from "react";
import {
  Card,
  ResourceList,
  ResourceItem,
  Thumbnail,
  Text,
  Button,
  Modal,
  EmptyState,
  InlineStack,
  BlockStack,
  Box,
  Pagination,
  Spinner,
} from "@shopify/polaris";
import { useFetcher } from "@remix-run/react";

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

type ProductSelectorProps = {
  selectedProducts: Product[];
  onProductsChange: (products: Product[]) => void;
};

export function ProductSelector({
  selectedProducts = [],
  onProductsChange,
}: ProductSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [cursor, setCursor] = useState<string | null>(null);

  const productsFetcher = useFetcher<{
    products: Product[];
    hasNextPage: boolean;
    endCursor: string;
  }>();

  const isLoading = productsFetcher.state === "loading";

  const handleOpenModal = useCallback(() => {
    setIsOpen(true);
    productsFetcher.load(
      `/app/api/products?${cursor ? `cursor=${cursor}` : ""}`,
    );
  }, [productsFetcher, cursor]);

  const handleCloseModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleNextPage = useCallback(() => {
    if (productsFetcher.data?.endCursor) {
      setCursor(productsFetcher.data.endCursor);
      productsFetcher.load(
        `/app/api/products?cursor=${productsFetcher.data.endCursor}`,
      );
    }
  }, [productsFetcher]);

  const handlePreviousPage = useCallback(() => {
    // For simplicity, just resetting to first page
    setCursor(null);
    productsFetcher.load("/app/api/products");
  }, [productsFetcher]);

  const handleSelectProduct = useCallback(
    (product: Product) => {
      const isSelected = selectedProducts.some((p) => p.id === product.id);

      if (isSelected) {
        onProductsChange(selectedProducts.filter((p) => p.id !== product.id));
      } else {
        onProductsChange([...selectedProducts, product]);
      }
    },
    [selectedProducts, onProductsChange],
  );

  const toggleProduct = useCallback(
    (productId: string) => {
      return () => {
        const product = productsFetcher.data?.products.find(
          (p) => p.id === productId,
        );
        if (product) {
          handleSelectProduct(product);
        }
      };
    },
    [productsFetcher.data, handleSelectProduct],
  );

  const isProductSelected = useCallback(
    (productId: string) => {
      return selectedProducts.some((p) => p.id === productId);
    },
    [selectedProducts],
  );

  return (
    <div>
      <BlockStack gap="300">
        <Button onClick={handleOpenModal}>Select Products</Button>

        {selectedProducts.length > 0 ? (
          <Card>
            <ResourceList
              resourceName={{ singular: "product", plural: "products" }}
              items={selectedProducts}
              renderItem={(product) => {
                const { id, title, images } = product;
                const media = images?.edges[0] ? (
                  <Thumbnail source={images.edges[0].node.url} alt={title} />
                ) : (
                  <Thumbnail
                    source="https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg"
                    alt=""
                  />
                );

                return (
                  <ResourceItem
                    id={id}
                    media={media}
                    accessibilityLabel={`View details for ${title}`}
                    onClick={() => {}}
                  >
                    <Text variant="bodyMd" fontWeight="bold" as="h3">
                      {title}
                    </Text>
                    <Button
                      variant="plain"
                      onClick={() => handleSelectProduct(product)}
                    >
                      Remove
                    </Button>
                  </ResourceItem>
                );
              }}
            />
          </Card>
        ) : (
          <Card>
            <BlockStack gap="300">
              <Box padding="400">
                <EmptyState heading="No products selected" image="">
                  <p>Select products to embed in your widget</p>
                </EmptyState>
              </Box>
            </BlockStack>
          </Card>
        )}
      </BlockStack>

      <Modal
        open={isOpen}
        onClose={handleCloseModal}
        title="Select Products"
        primaryAction={{
          content: "Done",
          onAction: handleCloseModal,
        }}
      >
        <Modal.Section>
          {isLoading ? (
            <Box padding="400">
              <Spinner size="large" />
            </Box>
          ) : productsFetcher.data?.products &&
            productsFetcher.data.products.length > 0 ? (
            <BlockStack gap="400">
              <ResourceList
                resourceName={{ singular: "product", plural: "products" }}
                items={productsFetcher.data.products}
                renderItem={(product) => {
                  const { id, title, images } = product;
                  const media = images?.edges[0] ? (
                    <Thumbnail source={images.edges[0].node.url} alt={title} />
                  ) : (
                    <Thumbnail
                      source="https://cdn.shopify.com/s/files/1/0757/9955/files/empty-state.svg"
                      alt=""
                    />
                  );

                  const isSelected = isProductSelected(id);

                  return (
                    <ResourceItem
                      id={id}
                      media={media}
                      accessibilityLabel={`Select ${title}`}
                      onClick={toggleProduct(id)}
                    >
                      <InlineStack gap="300" align="space-between">
                        <Text variant="bodyMd" fontWeight="bold" as="h3">
                          {title}
                        </Text>
                        <Button
                          variant={isSelected ? "primary" : "secondary"}
                          onClick={() => {
                            toggleProduct(id)();
                          }}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </Button>
                      </InlineStack>
                    </ResourceItem>
                  );
                }}
              />

              {(productsFetcher.data?.hasNextPage || cursor) && (
                <Pagination
                  hasPrevious={Boolean(cursor)}
                  onPrevious={handlePreviousPage}
                  hasNext={productsFetcher.data?.hasNextPage}
                  onNext={handleNextPage}
                />
              )}
            </BlockStack>
          ) : (
            <EmptyState heading="No products found" image="">
              <p>
                Try changing the search or adding new products to your store
              </p>
            </EmptyState>
          )}
        </Modal.Section>
      </Modal>
    </div>
  );
}
