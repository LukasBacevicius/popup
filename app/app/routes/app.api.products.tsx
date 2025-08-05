import { json, type LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  
  const url = new URL(request.url);
  const cursor = url.searchParams.get("cursor");
  const searchTerm = url.searchParams.get("searchTerm");
  
  const queryString = searchTerm ? `title:*${searchTerm}*` : "";
  
  // Build the GraphQL query with cursor-based pagination
  const response = await admin.graphql(
    `#graphql
      query GetProducts($cursor: String, $query: String) {
        products(first: 10, after: $cursor, query: $query) {
          edges {
            node {
              id
              title
              handle
              images(first: 1) {
                edges {
                  node {
                    url
                  }
                }
              }
            }
            cursor
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }`,
    {
      variables: {
        cursor: cursor || null,
        query: queryString || null,
      },
    }
  );

  const responseJson = await response.json();
  
  // Format the response data
  const products = responseJson.data.products.edges.map(
    (edge: any) => edge.node
  );
  
  const { hasNextPage, endCursor } = responseJson.data.products.pageInfo;

  return json({
    products,
    hasNextPage,
    endCursor,
  });
}; 