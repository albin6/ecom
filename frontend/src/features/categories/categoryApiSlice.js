import { apiSlice } from '../api/apiSlice.js';

export const categoryApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query({
      query: () => ({ url: '/categories' }),
      transformResponse: (response) => response.categories ?? response, // extract array from paginated response
      providesTags: ['Category'],
      keepUnusedDataFor: 5,
    }),
    getAdminCategories: builder.query({
      query: ({ keyword = '', pageNumber = 1, sort = '' } = {}) => ({ 
        url: '/categories/admin',
        params: { keyword, page: pageNumber, sort }
      }),
      providesTags: ['Category'],
      keepUnusedDataFor: 5,
    }),
    getCategoryDetails: builder.query({
      query: (id) => ({ url: `/categories/${id}` }),
      keepUnusedDataFor: 5,
    }),
    createCategory: builder.mutation({
      query: (data) => ({
        url: '/categories',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Category'],
    }),
    updateCategory: builder.mutation({
      query: ({ id, data }) => ({
        url: `/categories/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Category', 'Product'], // Invalidate products in case Category block visibility changed
    }),
    deleteCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Category', 'Product'],
    }),
    toggleBlockCategory: builder.mutation({
      query: (id) => ({
        url: `/categories/${id}/block`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Category', 'Product'], // Flushes products cache safely to trigger visibility filters correctly
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetAdminCategoriesQuery,
  useGetCategoryDetailsQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
  useToggleBlockCategoryMutation,
} = categoryApiSlice;
