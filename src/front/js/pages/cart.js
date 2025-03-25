import React, { useContext, useEffect, useState } from 'react';
import { Context } from '../store/appContext';
import { ProductList } from '../component/cart-product-list';
import { OrderResume } from '../component/cart-order-resume';
import { deleteCart, createCart } from '../apiservices/callToApi';


export const Cart = () => {
    const { actions } = useContext(Context);
    const [userId, setUserId] = useState(sessionStorage.getItem("idUser"));

    useEffect(() => {
        actions.setNegativeColors();
        actions.setNavbarVisibility();
        actions.getCart(1);
    }, []);

    return (
        <>
            <div className="container-fluid negative-background cart" style={{ backgroundColor: "rgb(234, 248, 252)" }}>
                <div className="row justify-content-around mx-3">
                    <div className="col-lg-7 col-sm-12">
                        <ProductList user_id={userId} />
                    </div>
                    <div className="col-lg-4 col-sm-12">
                        <OrderResume />
                    </div>
                    
                </div>
            </div>
        </>
    )
}