import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useGetCartQuery, useSyncCartMutation } from '../../features/cart/cartApiSlice.js';
import { setCart } from '../../features/cart/cartSlice.js';

export const CartSync = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems } = useSelector((state) => state.cart);
  
  // 1. Fetch server cart when user is logged in
  const { data: serverCart, isSuccess } = useGetCartQuery(undefined, {
    skip: !userInfo,
  });

  const [syncCart] = useSyncCartMutation();

  // 2. Sync server cart to Local Redux on Login/Initial Load
  useEffect(() => {
    if (isSuccess && serverCart && userInfo) {
      // Create a normalized version of local cart and server cart to compare
      const normalizedServerItems = serverCart.cartItems?.map(item => ({
        product: item.product?._id || item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        qty: item.qty,
        color: item.color || '',
        size: item.size || ''
      })) || [];

      const normalizedLocalItems = cartItems.map(item => ({
        product: item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        qty: item.qty,
        color: item.color || '',
        size: item.size || ''
      }));

      // Only dispatch if different to prevent loops
      if (JSON.stringify(normalizedServerItems) !== JSON.stringify(normalizedLocalItems)) {
        if (normalizedServerItems.length > 0) {
          dispatch(setCart(normalizedServerItems));
        }
      }
    }
    // We only want this once on initial success or when server data truly changes externally
  }, [isSuccess, serverCart, userInfo, dispatch]); // eslint-disable-line

  // 3. Sync Local Redux changes to Server
  useEffect(() => {
    if (userInfo && cartItems.length >= 0) {
      const timeoutId = setTimeout(() => {
        syncCart({ 
          cartItems: cartItems.map(item => ({
            product: item.product,
            name: item.name,
            image: item.image,
            price: item.price,
            qty: item.qty,
            color: item.color,
            size: item.size
          })) 
        });
      }, 1000); // Debounce sync by 1s
      
      return () => clearTimeout(timeoutId);
    }
  }, [cartItems, userInfo, syncCart]);

  return null;
};
