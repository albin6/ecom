import { apiSlice } from '../api/apiSlice.js';

export const checkoutApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    initiateCheckout: builder.mutation({
      query: (data) => ({
        url: '/checkout/initiate',
        method: 'POST',
        body: data,
      }),
    }),
    getCheckoutStatus: builder.query({
      query: () => ({
        url: '/checkout/status',
        method: 'GET',
      }),
      keepUnusedDataFor: 0, // Always get fresh status
    }),
    cancelCheckout: builder.mutation({
      query: () => ({
        url: '/checkout/cancel',
        method: 'POST',
      }),
    }),
  }),
});

export const {
  useInitiateCheckoutMutation,
  useGetCheckoutStatusQuery,
  useCancelCheckoutMutation,
} = checkoutApiSlice;
