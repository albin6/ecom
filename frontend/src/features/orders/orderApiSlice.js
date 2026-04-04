import { apiSlice } from '../api/apiSlice.js';

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (order) => ({
        url: '/orders',
        method: 'POST',
        body: order,
        headers: {
          'x-idempotency-key': crypto.randomUUID(), 
        }
      }),
    }),
    getOrderDetails: builder.query({
      query: (orderId) => ({
        url: `/orders/${orderId}`,
      }),
      keepUnusedDataFor: 5,
    }),
    payOrder: builder.mutation({
      query: ({ orderId, details }) => ({
        url: `/orders/${orderId}/pay`,
        method: 'PUT',
        body: details,
      }),
    }),
    getMyOrders: builder.query({
      query: () => ({
        url: '/orders/myorders',
      }),
      keepUnusedDataFor: 5,
    }),
    getOrders: builder.query({
      query: ({ keyword = '', pageNumber = 1, sort = '' }) => ({
        url: '/orders',
        params: { keyword, page: pageNumber, sort }
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Order'],
    }),
    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `/orders/${orderId}/deliver`,
        method: 'PUT',
      }),
      invalidatesTags: ['Order'],
    }),
  }),
});

export const { 
  useCreateOrderMutation, 
  useGetOrderDetailsQuery, 
  usePayOrderMutation, 
  useGetMyOrdersQuery,
  useGetOrdersQuery,
  useDeliverOrderMutation 
} = orderApiSlice;
