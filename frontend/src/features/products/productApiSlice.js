import { apiSlice } from '../api/apiSlice.js';

export const productApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ keyword = '', pageNumber = 1, sort = '', category = '', limit = 12, minPrice = '', maxPrice = '' }) => {
        // Strip empty strings so the cache key matches what the server actually processes
        const params = { page: pageNumber, limit };
        if (keyword) params.keyword = keyword;
        if (sort) params.sort = sort;
        if (category) params.category = category;
        if (minPrice !== '') params.minPrice = minPrice;
        if (maxPrice !== '') params.maxPrice = maxPrice;
        return { url: '/products', params };
      },
      providesTags: ['Product'],
      keepUnusedDataFor: 30,
    }),
    getAdminProducts: builder.query({
      query: ({ keyword = '', pageNumber = '' }) => ({
        url: '/products/admin',
        params: { keyword, page: pageNumber },
      }),
      providesTags: ['Product'],
      keepUnusedDataFor: 5,
    }),
    getProductDetails: builder.query({
      query: (productId) => ({
        url: `/products/${productId}`,
      }),
      keepUnusedDataFor: 5,
    }),
    createProduct: builder.mutation({
      query: (data) => ({
        url: '/products',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    updateProduct: builder.mutation({
      query: ({ id, data }) => ({
        url: `/products/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Product'],
    }),
    deleteProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Product'],
    }),
    toggleBlockProduct: builder.mutation({
      query: (id) => ({
        url: `/products/${id}/block`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Product'],
    }),
    uploadProductImage: builder.mutation({
      query: (data) => ({
        url: '/upload',
        method: 'POST',
        body: data, // Expects FormData
      }),
    }),
  }),
});

export const {
  useGetProductsQuery,
  useGetAdminProductsQuery,
  useGetProductDetailsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useToggleBlockProductMutation,
  useUploadProductImageMutation,
} = productApiSlice;
