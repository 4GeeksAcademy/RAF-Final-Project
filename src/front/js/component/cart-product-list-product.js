import React, { useContext, useEffect, useState } from "react";
import { deleteProduct } from "../apiservices/callToApi";
import { updateQuantityCartProduct } from "../apiservices/callToApi";
import { Context } from "../store/appContext";

export const ListProduct = ({ edit, name, description, quantity, color, image, tipo, user_id, product_id }) => {

    const [cantidad, setCantidad] = useState(quantity)
    const {actions} = useContext(Context)
    const aumentarCantidad = () => {
        setCantidad(prevCantidad => prevCantidad + 1);
       
    };
    
    const decrementarCantidad = () => {
        if (cantidad > 1) {
            setCantidad(prevCantidad => prevCantidad - 1);
        };
    };
    
    const updateProducts = async()=>{
        await updateQuantityCartProduct(user_id, tipo, product_id, cantidad)
        actions.getCart(user_id)
    }


    useEffect(() => {
        updateProducts()
    }, [cantidad])




    return (
        <>
            <div className="container">
                <div className="row card-cart-product p-3 rounded border border-1 border-light">
                    <div className="col-md-2 col-sm-1 px-0">
                        <div>
                            <div className="ratio ratio-1x1">
                                <img src={image}/>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-7 col-sm-10">
                        <div>
                            <span className="cart-product-list-title"><p className="mb-0">{name} { tipo != "tv" && `(${color})`}</p></span>
                            <span><p className="description-cart-product">{description}</p></span>
                        </div>
                    </div>
                    <div className="col-lg-2 col-sm-12">
                        <div className="d-flex justify-content-around">{ cantidad > 1? 
                            <button onClick={decrementarCantidad}>-</button> : 
                            <button onClick={async() =>{
                                await deleteProduct(user_id, tipo, product_id)
                                actions.getCart(user_id)
                            }}
                             className="btn cart-delete-button rounded" ><i class="fa-solid fa-trash"></i></button>
                            }
                            <p><b>{cantidad}</b></p>
                            <button onClick={aumentarCantidad} >+</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}